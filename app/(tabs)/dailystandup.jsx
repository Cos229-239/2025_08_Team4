import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { LinearGradient } from 'expo-linear-gradient';

const HEADER_TITLE = () => (
  <Text
    style={{
      fontFamily: "Pacifico_400Regular",
      fontSize: 36,
      color: "#FFFFFF",
      textAlign: "center",
    }}
  >
    Daily Standup
  </Text>
);

const TaskList = ({ data, completed }) => (
    <View style={styles.taskListContainer}>
        {data.map((task, index) => (
            <View
                key={task.id}
                style={[
                    styles.taskItem,
                    index % 2 === 0 ? styles.taskItemEven : styles.taskItemOdd,
                ]}
            >
                <Ionicons
                    name={completed ? "checkbox-outline" : "square-outline"}
                    size={24}
                    color={completed ? "#3177C9" : "#333"}
                />
                <Text style={styles.taskTitleText}>{task.title}</Text>
                <Text style={styles.taskDueDate}>{task.dueDate}</Text>
                <Ionicons name="chevron-forward-outline" size={24} color="#333" />
            </View>
        ))}
    </View>
);

export default function DailyStandupScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        Oswald_600SemiBold,
        Pacifico_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }

    const completedTasks = [
        { id: '1', title: 'Completed Task 1', dueDate: 'Completed yesterday' },
        { id: '2', title: 'Completed Task 2', dueDate: 'Completed yesterday' },
        { id: '3', title: 'Completed Task 3', dueDate: 'Completed yesterday' },
        { id: '4', title: 'Completed Task 4', dueDate: 'Completed yesterday' },
        { id: '5', title: 'Completed Task 5', dueDate: 'Completed yesterday' },
    ];

    const todaysTasks = [
        { id: '1', title: 'Today\'s Task 1', dueDate: 'Due today' },
        { id: '2', title: 'Today\'s Task 2', dueDate: 'Due today' },
        { id: '3', title: 'Today\'s Task 3', dueDate: 'Due today' },
    ];

    const upcomingTasks = [
        { id: '1', title: 'Upcoming Task 1', dueDate: 'Due tomorrow' },
        { id: '2', title: 'Upcoming Task 2', dueDate: 'Due in 2 days' },
        { id: '3', title: 'Upcoming Task 3', dueDate: 'Due in 4 days' },
        { id: '4', title: 'Upcoming Task 4', dueDate: 'Due in 5 days' },
        { id: '5', title: 'Upcoming Task 5', dueDate: 'Due next week' },
    ];

    const blockers = [
        { id: '1', title: 'Blocker 1', dueDate: 'Task 5 - Goal 10' },
        { id: '2', title: 'Blocker 2', dueDate: 'Task 4 - Goal 8' },
    ];

    return (
        <LinearGradient
            colors={['#3177C9', '#30F0C8']}
            locations={[0.37, 0.61]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <Stack.Screen
                options={{
                    headerTitle: () => HEADER_TITLE(),
                    headerShown: true,
                    headerTransparent: true,
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <Pressable onPress={() => router.replace('/')} style={{ marginLeft: 15 }}>
                            <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                        </Pressable>
                    ),
                }}
            />
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.dateHeader}>Today's Date</Text>
                    
                    <View style={styles.taskSection}>
                        <Text style={styles.sectionHeadingText}>Look at all you complete yesterday! Keep it Going!</Text>
                        <TaskList data={completedTasks} completed={true} />
                    </View>

                    <View style={styles.taskSection}>
                        <Text style={styles.sectionHeadingText}>Lets plan out our day, here is what we have to do!</Text>
                        <TaskList data={todaysTasks} completed={false} />
                    </View>

                    <View style={styles.taskSection}>
                        <Text style={styles.sectionHeadingText}>Here's whats coming up next.</Text>
                        <TaskList data={upcomingTasks} completed={false} />
                    </View>

                    <View style={styles.taskSection}>
                        <Text style={styles.sectionHeadingText}>Here is a list of your blockers.</Text>
                        <TaskList data={blockers} completed={false} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 120, 
        paddingBottom: 20,
    },
    dateHeader: {
        fontFamily: 'Oswald_600SemiBold',
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionHeadingText: {
        fontFamily: 'Oswald_600SemiBold',
        fontSize: 16,
        color: '#fff',
        marginBottom: 10,
    },
    taskSection: {
        marginBottom: 20,
    },
    taskListContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3177C9',
        overflow: 'hidden',
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
});