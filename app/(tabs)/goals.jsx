import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Svg, { Path, Circle } from 'react-native-svg';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { listMyGoals } from "../../lib/goalRepo";
import SnowyMountain from "../../components/SnowyMountain";


function formatDueDate(isoString) {
  if (!isoString) return 'No due date';
  const date = new Date(isoString);
  const options = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
  return `Due by ${date.toLocaleDateString('en-US', options)}`;
}


function getPriorityColor(level) {
  switch (level) {
    case 1: return colors.priority1;
    case 2: return colors.priority2;
    case 3: return colors.priority3;
    case 4: return colors.priority4;
    case 5: return colors.priority5;
    default: return '#E0E0E0'; 
  }
}


const CalendarIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FilterIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10 18H14M17 12H7M20 6H4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckmarkIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);


const GoalItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.goalCard} onPress={onPress}>
    <View style={styles.mountainRow}>
        {[1, 2, 3, 4, 5].map((n) => (
            <SnowyMountain
                key={n}
                width={20}
                height={20}
                mountainColor={n <= item.priority ? getPriorityColor(n) : '#E0E0E0'}
                snowColor={'#FFFFFF'}
                strokeWidth={0}
            />
        ))}
    </View>
    <Text style={styles.goalTitle}>{item.title}</Text>
    <Text style={styles.goalDescription} numberOfLines={2}>{item.description}</Text>
    <View style={styles.cardFooter}>
        <CalendarIcon color={colors.textSecondary} size={16} />
        <Text style={styles.dueDateText}>{formatDueDate(item.targetDate)}</Text>
    </View>
  </TouchableOpacity>
);

export default function GoalsScreen() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [sortBy, setSortBy] = useState('updatedAt');
  
    const fetchGoals = async () => {
      try {
        const data = await listMyGoals();
        setGoals(data);
        setError(null);
      } catch (e) {
        setError("Could not load your goals. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    React.useEffect(() => {
        if (isFocused) { setLoading(true); fetchGoals(); }
    }, [isFocused]);
  
    const sortedGoals = useMemo(() => {
    const sorted = [...goals];
    if (sortBy === 'priority') {
        return sorted.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }
    if (sortBy === 'date') {
        return sorted.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
    }
    if (sortBy === 'title') {
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === 'createdAt') {
        return sorted.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
    }
    if (sortBy === 'updatedAt') {
        return sorted.sort((a, b) => new Date(b.$updatedAt) - new Date(a.$updatedAt));
    }
    return sorted;
}, [goals, sortBy]);
    
    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await fetchGoals();
      setRefreshing(false);
    }, []);
  
    if (loading && !refreshing) {
        return (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primaryBlue} />
          </View>
        );
    }
    if (error) {
        return (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        );
    }
  
    return (
      <View style={styles.screen}>
        {/* Unified Header */}
        <View style={styles.header}>
            <View>
                <Text style={styles.headerTitle}>My Goals</Text>
                <Text style={styles.headerSubtitle}>Your path to success starts here.</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Menu>
                    <MenuTrigger>
                        <FilterIcon color={colors.textSecondary} size={28} />
                    </MenuTrigger>
                    <MenuOptions customStyles={menuStyles}>
                        <MenuOption onSelect={() => setSortBy('updatedAt')} style={menuStyles.menuOption}>
                            <Text style={menuStyles.menuOptionText}>Recently Updated</Text>
                            {sortBy === 'updatedAt' && <CheckmarkIcon color={colors.accent} size={20} />}
                        </MenuOption>
                        <MenuOption onSelect={() => setSortBy('priority')} style={menuStyles.menuOption}>
                            <Text style={menuStyles.menuOptionText}>Priority (High-Low)</Text>
                            {sortBy === 'priority' && <CheckmarkIcon color={colors.accent} size={20} />}
                        </MenuOption>
                        <MenuOption onSelect={() => setSortBy('date')} style={menuStyles.menuOption}>
                            <Text style={menuStyles.menuOptionText}>Due Date</Text>
                            {sortBy === 'date' && <CheckmarkIcon color={colors.accent} size={20} />}
                        </MenuOption>
                        <MenuOption onSelect={() => setSortBy('createdAt')} style={menuStyles.menuOption}>
                            <Text style={menuStyles.menuOptionText}>Date Created</Text>
                            {sortBy === 'createdAt' && <CheckmarkIcon color={colors.accent} size={20} />}
                        </MenuOption>
                        <MenuOption onSelect={() => setSortBy('title')} style={menuStyles.menuOption}>
                            <Text style={menuStyles.menuOptionText}>Title (A-Z)</Text>
                            {sortBy === 'title' && <CheckmarkIcon color={colors.accent} size={20} />}
                        </MenuOption>
                    </MenuOptions>
                </Menu>
            </View>
        </View>
  
        <FlatList
          data={sortedGoals}
          contentContainerStyle={styles.listContainer}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => ( <GoalItem item={item} onPress={() => navigation.navigate("ViewGoal", { goalId: item.$id })} /> )}
          ListEmptyComponent={() => ( <View style={styles.centered}> <Text style={styles.emptyText}>Your journey begins here.</Text> <Text style={styles.emptySubtext}>Tap the '+' button to set your first goal.</Text> </View> )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    );
}

const colors = {
    background: '#F2F2F2',
    cardBackground: '#FFFFFF',
    textPrimary: '#333333',
    textSecondary: '#828282',
    primaryBlue: '#2F80ED',
    accent: '#27AE60',
    priority1: '#6FCF97',   
    priority2: '#F2C94C',  
    priority3: '#F2994A',   
    priority4: '#EB5757',   
    priority5: '#C22B34',
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
        backgroundColor: colors.cardBackground,
        paddingHorizontal: 20,
        paddingTop: 5, 
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.background,
    },
    headerTitle: {
        fontFamily: 'Pacifico_400Regular', 
        fontSize: 32,
        color: colors.accent,
    },
    headerSubtitle: {
        fontFamily: 'OpenSans-Regular',
        fontSize: 14,
        color: colors.textSecondary,
    },
    listContainer: {
        padding: 16,
        flexGrow: 1,
    },
    centered: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    goalCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
    },
    mountainRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 12,
    },
    goalTitle: {
        fontFamily: 'Oswald-Bold',
        fontSize: 22,
        color: colors.textPrimary,
        marginBottom: 6,
    },
    goalDescription: {
        fontFamily: 'OpenSans-Regular',
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: colors.background,
        paddingTop: 12,
    },
    dueDateText: {
        fontFamily: 'OpenSans-SemiBold',
        fontSize: 12,
        color: colors.textSecondary,
    },
    errorText: {
        fontSize: 16,
        color: "#b91c1c"
    },
    emptyText: {
        fontFamily: 'Oswald-Bold',
        fontSize: 24,
        color: colors.textPrimary,
        textAlign: "center"
    },
    emptySubtext: {
        fontFamily: 'OpenSans-Regular',
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 8,
        textAlign: "center"
    },

});

const menuStyles = {
    optionsContainer: {
        backgroundColor: '#FFFFFF',
        padding: 5,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginTop: 35,
    },
    
    menuOption: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    
    menuOptionText: {
        fontFamily: 'OpenSans-SemiBold',
        fontSize: 16,
        color: colors.textPrimary,
    },
};