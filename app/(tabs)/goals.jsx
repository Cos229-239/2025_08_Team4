import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Svg, { Path, Circle } from 'react-native-svg';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { listMyGoals } from "../../lib/goalRepo";
import SnowyMountain from "../../components/SnowyMountain";
import { useTheme } from "../../context/ThemeContext";


function formatDueDate(isoString) {
  if (!isoString) return 'No due date';
  const date = new Date(isoString);
  const options = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
  return `Due by ${date.toLocaleDateString('en-US', options)}`;
}


function getPriorityColor(level, themeColors) {
  switch (level) {
    case 1: return themeColors.success;
    case 2: return themeColors.warning;
    case 3: return '#F2994A';
    case 4: return themeColors.danger;
    case 5: return '#C22B34';
    default: return themeColors.border; 
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


const GoalItem = ({ item, onPress, colors }) => (
  <TouchableOpacity style={[styles.goalCard, { backgroundColor: colors.card }]} onPress={onPress}>
    <View style={styles.mountainRow}>
        {[1, 2, 3, 4, 5].map((n) => (
            <SnowyMountain
                key={n}
                width={20}
                height={20}
                mountainColor={n <= item.priority ? getPriorityColor(n, colors) : colors.border}
                snowColor={'#FFFFFF'}
                strokeWidth={0}
            />
        ))}
    </View>
    <Text style={[styles.goalTitle, { color: colors.text }]}>{item.title}</Text>
    <Text style={[styles.goalDescription, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
    <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <CalendarIcon color={colors.textSecondary} size={16} />
        <Text style={[styles.dueDateText, { color: colors.textSecondary }]}>{formatDueDate(item.targetDate)}</Text>
    </View>
  </TouchableOpacity>
);

export default function GoalsScreen() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { colors } = useTheme();
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
          <View style={[styles.centered, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        );
    }
    if (error) {
        return (
          <View style={[styles.centered, { backgroundColor: colors.background }]}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        );
    }
  
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {/* Unified Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View>
                <Text style={[styles.headerTitle, { color: colors.primary }]}>My Goals</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Your path to success starts here.</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Menu>
                    <MenuTrigger>
                        <FilterIcon color={colors.textSecondary} size={28} />
                    </MenuTrigger>
                    <MenuOptions customStyles={getMenuStyles(colors)}>
                        <MenuOption onSelect={() => setSortBy('updatedAt')} style={menuStyles.menuOption}>
                            <Text style={[menuStyles.menuOptionText, { color: colors.text }]}>Recently Updated</Text>
                            {sortBy === 'updatedAt' && <CheckmarkIcon color={colors.primary} size={20} />}
                        </MenuOption>
                        <MenuOption onSelect={() => setSortBy('priority')} style={menuStyles.menuOption}>
                            <Text style={[menuStyles.menuOptionText, { color: colors.text }]}>Priority (High-Low)</Text>
                            {sortBy === 'priority' && <CheckmarkIcon color={colors.primary} size={20} />}
                        </MenuOption>
                        <MenuOption onSelect={() => setSortBy('date')} style={menuStyles.menuOption}>
                            <Text style={[menuStyles.menuOptionText, { color: colors.text }]}>Due Date</Text>
                            {sortBy === 'date' && <CheckmarkIcon color={colors.primary} size={20} />}
                        </MenuOption>
                        <MenuOption onSelect={() => setSortBy('createdAt')} style={menuStyles.menuOption}>
                            <Text style={[menuStyles.menuOptionText, { color: colors.text }]}>Date Created</Text>
                            {sortBy === 'createdAt' && <CheckmarkIcon color={colors.primary} size={20} />}
                        </MenuOption>
                        <MenuOption onSelect={() => setSortBy('title')} style={menuStyles.menuOption}>
                            <Text style={[menuStyles.menuOptionText, { color: colors.text }]}>Title (A-Z)</Text>
                            {sortBy === 'title' && <CheckmarkIcon color={colors.primary} size={20} />}
                        </MenuOption>
                    </MenuOptions>
                </Menu>
            </View>
        </View>
  
        <FlatList
          data={sortedGoals}
          contentContainerStyle={styles.listContainer}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => ( <GoalItem item={item} onPress={() => navigation.navigate("ViewGoal", { goalId: item.$id })} colors={colors} /> )}
          ListEmptyComponent={() => ( <View style={styles.centered}> <Text style={[styles.emptyText, { color: colors.text }]}>Your journey begins here.</Text> <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tap the '+' button to set your first goal.</Text> </View> )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
        paddingHorizontal: 20,
        paddingTop: 5, 
        paddingBottom: 10,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontFamily: 'Pacifico_400Regular', 
        fontSize: 32,
    },
    headerSubtitle: {
        fontFamily: 'OpenSans-Regular',
        fontSize: 14,
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
        marginBottom: 6,
    },
    goalDescription: {
        fontFamily: 'OpenSans-Regular',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderTopWidth: 1,
        paddingTop: 12,
    },
    dueDateText: {
        fontFamily: 'OpenSans-SemiBold',
        fontSize: 12,
    },
    errorText: {
        fontSize: 16,
    },
    emptyText: {
        fontFamily: 'Oswald-Bold',
        fontSize: 24,
        textAlign: "center"
    },
    emptySubtext: {
        fontFamily: 'OpenSans-Regular',
        fontSize: 16,
        marginTop: 8,
        textAlign: "center"
    },
});

const getMenuStyles = (colors) => ({
    optionsContainer: {
        backgroundColor: colors.card,
        padding: 5,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginTop: 35,
    },
});

const menuStyles = {
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
    },
};