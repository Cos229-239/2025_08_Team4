import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listMyTasks } from '../../lib/taskRepo';
import { listMyGoals } from '../../lib/goalRepo';
import { getOrCreateProfile } from '../../lib/profile';


const QUOTES = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "It’s not whether you get knocked down, it’s whether you get up.", author: "Vince Lombardi" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "Well done is better than well said.", author: "Benjamin Franklin" },
  { quote: "A goal is a dream with a deadline.", author: "Napoleon Hill" },
];

const today = new Date();
today.setHours(0, 0, 0, 0);
const isUpcoming = (dateString) => {
  if (!dateString) return false;
  const checkDate = new Date(dateString);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() >= today.getTime();
};
const formatDueDate = (dateString) => {
  if (!dateString) return 'No due date';
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due in 1 day';
  if (diffDays > 1) return `Due in ${diffDays} days`;
  return 'Overdue';
};


const COLORS = { 
  primary: '#04A777', 
  primaryLight: '#E6F6F1',
  background: '#F8F9FA', 
  card: '#FFFFFF', 
  text: '#212529', 
  textSecondary: '#6C757D', 
  border: '#E9ECEF',
};

const UpcomingTaskItem = ({ goalName, taskTitle, dueDateText, onPress }) => (
  <Pressable style={styles.taskItem} onPress={onPress}>
    <View style={styles.taskIcon}>
      <Ionicons name="radio-button-off-outline" size={24} color={COLORS.primary} />
    </View>
    <View style={styles.taskItemTextContainer}>
      <Text style={styles.taskItemGoalName} numberOfLines={1}>{goalName}</Text>
      <Text style={styles.taskItemTitle} numberOfLines={1}>{taskTitle}</Text>
    </View>
    <Text style={styles.taskItemDueDate}>{dueDateText}</Text>
    <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textSecondary} />
  </Pressable>
);

export default function HomeScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  
  const dailyQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [fetchedTasks, fetchedGoals, fetchedProfile] = await Promise.all([
          listMyTasks(),
          listMyGoals(),
          getOrCreateProfile(),
        ]);
        setTasks(fetchedTasks);
        setGoals(fetchedGoals);
        setProfile(fetchedProfile);
      } catch (error) {
        console.error("Failed to fetch home screen data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingTasksWithGoals = useMemo(() => {
    if (!tasks.length || !goals.length) return [];
    const goalMap = new Map(goals.map(goal => [goal.$id, goal.title]));
    return tasks
      .filter(task => task.status !== 'Completed' && isUpcoming(task.dueDate))
      .map(task => ({
        ...task,
        goalName: goalMap.get(task.goalId) || 'General Task',
      }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [tasks, goals]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
       
        <View style={styles.headerContainer}>
          <Text style={styles.greetingTitle}>Hello, {profile?.name || 'User'}!</Text>
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>"{dailyQuote.quote}"</Text>
            <Text style={styles.quoteAuthor}>- {dailyQuote.author}</Text>
          </View>
        </View>

        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Standup</Text>
          <Pressable onPress={() => router.push('/dailystandup')}>
             <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          {isLoading ? (
            <ActivityIndicator style={{ padding: 20 }} size="small" color={COLORS.primary} />
          ) : upcomingTasksWithGoals.length > 0 ? (
            upcomingTasksWithGoals.map((task, index) => (
              <React.Fragment key={task.$id}>
                <UpcomingTaskItem
                  goalName={task.goalName}
                  taskTitle={task.title}
                  dueDateText={formatDueDate(task.dueDate)}
                  onPress={() => router.push(`/ViewTask?taskId=${task.$id}`)}
                />
                {index < upcomingTasksWithGoals.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No upcoming tasks. Enjoy the clear path!</Text>
            </View>
          )}
        </View>

        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsContainer}>
          <Pressable style={styles.actionButton} onPress={() => router.push('/addgoal')}>
             <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
             <Text style={styles.actionButtonText}>New Goal</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.push('/addtask-flow')}>
             <Ionicons name="document-text-outline" size={28} color={COLORS.primary} />
             <Text style={styles.actionButtonText}>New Task</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 24, },
  headerContainer: {
    padding: 20,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    marginBottom: 32,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  quoteContainer: {
    marginTop: 12,
  },
  quoteText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskIcon: {
    backgroundColor: 'white', 
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskItemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  taskItemGoalName: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  taskItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  taskItemDueDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 68,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});