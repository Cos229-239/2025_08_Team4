import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Oswald_600SemiBold } from "@expo-google-fonts/oswald";
import { Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { useRightDrawer } from "../../components/RightDrawerContext";
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Text as SvgText, Defs, Stop, G, LinearGradient as SvgLinearGradient, Rect } from 'react-native-svg';

const HEADER_TITLE_COMPONENT = () => (
  <Text
    style={{
      fontFamily: "Pacifico_400Regular",
      fontSize: 40,
      color: "#FFFFFF",
      height: 85,
      textAlignVertical: "center",
      textAlign: "center",
    }}
  >
    LucidPaths
  </Text>
);

const { width: screenWidth } = Dimensions.get('window');
const mountainChartHeight = 200;

const MountainChart = () => {
  const mountains = [
    { name: "Goal 2", color: "#F7DB79", path: "M0,150 L20,100 L40,120 L60,80 L80,100 L100,150 Z", x: 40, y: 110 },
    { name: "Get Promotion", color: "#4CC3B2", path: "M80,150 L120,70 L160,90 L200,50 L240,70 L280,150 Z", x: 160, y: 80 },
    { name: "Goal 5", color: "#4069D1", path: "M220,150 L260,30 L300,60 L340,10 L380,40 L420,150 Z", x: 300, y: 50 },
    { name: "Goal 7", color: "#61AE4C", path: "M250,150 L270,120 L290,130 L310,100 L330,120 L350,150 Z", x: 290, y: 125 },
    { name: "Goal 4", color: "#A870E1", path: "M360,150 L390,90 L420,110 L450,70 L480,90 L510,150 Z", x: 420, y: 100 },
    { name: "Goal 6", color: "#DB3C3C", path: "M480,150 L520,60 L560,90 L600,40 L640,70 L680,150 Z", x: 560, y: 80 },
  ];

  return (
    <View style={styles.chartContainer}>
      <Svg height={mountainChartHeight} width="100%" viewBox="0 0 680 200">
        <Defs>
          {mountains.map((mountain, index) => (
            <SvgLinearGradient key={index} id={`grad${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={mountain.color} stopOpacity="1" />
              <Stop offset="100%" stopColor="#fff" stopOpacity="0.5" />
            </SvgLinearGradient>
          ))}
          <SvgLinearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#8AD034" />
            <Stop offset="100%" stopColor="#B3E689" />
          </SvgLinearGradient>
          <SvgLinearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#9BC2E6" />
            <Stop offset="100%" stopColor="#E0F2F7" />
          </SvgLinearGradient>
        </Defs>

        <Rect x="0" y="0" width="100%" height="200" fill="url(#skyGrad)" />
        
        <G>
          {mountains.map((mountain, index) => (
            <React.Fragment key={index}>
              <Path
                d={mountain.path}
                fill={`url(#grad${index})`}
              />
              <SvgText
                fill="#333"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                x={mountain.x}
                y={mountain.y}
              >
                {mountain.name}
              </SvgText>
            </React.Fragment>
          ))}
        </G>
        <Path d="M0,150 Q170,160 340,150 T680,140 V200 H0 Z" fill="url(#groundGrad)" />
      </Svg>
    </View>
  );
};

export default function Home() {
  const router = useRouter();
  const { openDrawer } = useRightDrawer();
  const { width: screenWidth } = Dimensions.get('window');

  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
    Pacifico_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  const dailyTasks = [
    { id: '1', title: 'Complete your first task!', dueDate: 'Due in 1 day' },
    { id: '2', title: 'Review your weekly goals', dueDate: 'Due in 2 days' },
    { id: '3', title: 'Plan your next summit', dueDate: 'Due in 3 days' },
    { id: '4', title: 'Reflect on your progress', dueDate: 'Due in 4 days' },
    { id: '5', title: 'Take a break and recharge', dueDate: 'Due in 5 days' },
  ];

  return (
    <LinearGradient
      colors={['#3177C9', '#30F0C8']}
      locations={[0.37, 0.61]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Tabs.Screen
        options={{
          headerTitle: () => HEADER_TITLE_COMPONENT(),
          headerLeft: () => (
            <Pressable onPress={openDrawer} style={{ marginLeft: 20 }}>
              <Ionicons name="menu-outline" size={30} color="#fff" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => router.push('/profile')} style={{ marginRight: 20 }}>
              <Ionicons name="person-circle-outline" size={30} color="#fff" />
            </Pressable>
          ),
          headerStyle: { backgroundColor: '#3177C9' },
          headerTransparent: false,
          title: '',
        }}
      />
      <View style={styles.scrollContent}>
        <Pressable onPress={() => router.push('dailystandup')}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>Daily Stand Up</Text>
            <Ionicons name="filter-outline" size={24} color="#333" />
          </View>
        </Pressable>
        <View style={[styles.sectionContainer, {marginBottom: 10}]}>
          <View style={styles.taskList}>
            {dailyTasks.map((task, index) => (
              <Pressable
                key={task.id}
                style={[
                  styles.taskItem,
                  index % 2 === 0 ? styles.taskItemEven : styles.taskItemOdd,
                ]}
                onPress={() => console.log('Task pressed:', task.title)}
              >
                <Ionicons name="search-outline" size={24} color="#333" />
                <Text style={styles.taskTitleText}>{task.title}</Text>
                <Text style={styles.taskDueDate}>{task.dueDate}</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#333" />
              </Pressable>
            ))}
          </View>
        </View>

        <ScrollView horizontal pagingEnabled style={styles.horizontalScroll} showsHorizontalScrollIndicator={false}>
          {}
          <View style={styles.scrollPage}>
            <View style={styles.pageContent}>
              <View style={[styles.sectionHeaderContainer, { marginTop: 20 }]}>
                <Text style={styles.sectionTitle}>Goal Peek Range</Text>
                <Ionicons name="filter-outline" size={24} color="#333" />
              </View>
              <View style={[styles.sectionContainer, styles.goalPeekRangeContainer]}>
                <MountainChart />
                <Text style={styles.goalPeekRangeSubtitle}>Goal Details one click away!</Text>
              </View>
            </View>
          </View>

          {}
          <View style={styles.scrollPage}>
            <View style={styles.pageContent}>
              <View style={[styles.sectionHeaderContainer, { marginTop: 20 }]}>
                <Text style={styles.sectionTitle}>Goal Management</Text>
                <Ionicons name="options-outline" size={24} color="#333" />
              </View>
              <View style={[styles.sectionContainer, styles.goalPeekRangeContainer]}>
                <View style={styles.gridContainer}>
                  <View style={styles.gridRow}>
                    <View style={[styles.gridItem, styles.blueGridItem]}>
                      <Text style={styles.gridText}>Goal Glimpse</Text>
                    </View>
                    <View style={[styles.gridItem, styles.blueGridItem]}>
                      <Text style={styles.gridText}>New Goal</Text>
                    </View>
                  </View>
                  <View style={styles.gridRow}>
                    <View style={[styles.gridItem, styles.blueGridItem]}>
                      <Text style={styles.gridText}>New Task</Text>
                    </View>
                    <View style={[styles.gridItem, styles.blueGridItem]}>
                      <Text style={styles.gridText}>Task Attack</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 20,
    color: '#333',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3177C9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskList: {
    
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  taskItemEven: {
    backgroundColor: '#F0F8FF', 
  },
  taskItemOdd: {
    backgroundColor: '#fff',
  },
  taskTitleText: {
    flex: 1,
    fontFamily: 'Oswald_600SemiBold',
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  taskDueDate: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  horizontalScroll: {
    flex: 1,
    marginHorizontal: -16,
  },
  scrollPage: {
    width: screenWidth,
    paddingHorizontal: 16,
  },
  pageContent: {
    flex: 1,
  },
  goalPeekRangeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  goalPeekRangeSubtitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  gridContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  gridItem: {
    width: '45%',
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  blueGridItem: {
    backgroundColor: '#3177C9',
  },
  gridText: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
});