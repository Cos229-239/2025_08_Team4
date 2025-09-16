import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Oswald_600SemiBold } from "@expo-google-fonts/oswald";
import { OpenSans_700Bold } from "@expo-google-fonts/open-sans";

const dailyTasks = [
  { id: '1', title: 'Complete your first task!', dueDate: 'Due in 1 day' },
  { id: '2', title: 'Review your weekly goals', dueDate: 'Due in 2 days' },
  { id: '3', title: 'Plan your next summit', dueDate: 'Due in 3 days' },
];

const TaskItem = ({ item }) => {
  const router = useRouter();
  return (
    <Pressable style={styles.taskItem} onPress={() => router.push('/dailystandup')}>
      <Ionicons name="search-outline" size={24} color="#3177C9" />
      <Text style={styles.taskTitleText}>{item.title}</Text>
      <Text style={styles.taskDueDate}>{item.dueDate}</Text>
      <Ionicons name="chevron-forward-outline" size={24} color="#B0B0B0" />
    </Pressable>
  );
};

const ManagementButton = ({ title, iconName }) => (
  <Pressable style={styles.gridItem}>
    <Ionicons name={iconName} size={32} color="#3177C9" />
    <Text style={styles.gridText}>{title}</Text>
  </Pressable>
);

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
    OpenSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>Daily Stand Up</Text>
            <Ionicons name="filter-outline" size={24} color="#666" />
          </View>
          <View style={styles.card}>
            {dailyTasks.map((task) => (
              <TaskItem key={task.id} item={task} />
            ))}
          </View>
        </View>

        {/* Goal Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>Goal Management</Text>
            <Ionicons name="options-outline" size={24} color="#666" />
          </View>
          <View style={styles.gridContainer}>
            <ManagementButton title="Goal Glimpse" iconName="eye-outline" />
            <ManagementButton title="New Goal" iconName="add-circle-outline" />
            <ManagementButton title="New Task" iconName="clipboard-outline" />
            <ManagementButton title="Task Attack" iconName="flash-outline" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 22,
    color: '#333',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden', 
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8', 
  },
  taskTitleText: {
    flex: 1,
    fontFamily: 'OpenSans_700Bold',
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  taskDueDate: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 14,
    color: '#888',
    marginRight: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%', 
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    aspectRatio: 1, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  gridText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 18,
    color: '#3177C9',
    marginTop: 10,
    textAlign: 'center',
  },
});