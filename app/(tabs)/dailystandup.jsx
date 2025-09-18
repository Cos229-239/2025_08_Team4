import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // REMOVED useNavigation
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { listMyTasks, upsertTask } from '../../lib/taskRepo'; // Adjust the import path as needed

// --- Date Helper Functions (no changes) ---
const today = new Date();
today.setHours(0, 0, 0, 0);
const isSameDay = (date1, date2) => (
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate()
);
const isYesterday = (dateString) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(new Date(dateString), yesterday);
};
const isToday = (dateString) => {
  if (!dateString) return false;
  return isSameDay(new Date(dateString), new Date());
};
const isUpcoming = (dateString) => {
  if (!dateString) return false;
  const checkDate = new Date(dateString);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() > today.getTime();
};
// ------------------------------------------

const COLORS = { 
  primary: '#04A777', 
  primaryLight: '#30C49F',
  background: '#F8F9FA', 
  card: '#FFFFFF', 
  text: '#212529', 
  textSecondary: '#6C757D', 
  border: '#E9ECEF',
  iconPrimary: '#04A777',
};

const DateHeader = ({ date }) => {
  const formattedDate = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <View style={styles.dateHeaderContainer}>
      {/* FIX 1: Combined emoji and text into one string to prevent the error */}
      <Text style={styles.dateHeaderText}>{`📅 ${formattedDate}`}</Text>
    </View>
  );
};

// --- TaskItem, EmptyState, and TaskSection components remain the same ---
const TaskItem = ({ title, detailText, isCompleted, onToggle, onNavigate }) => (
  <Pressable style={styles.itemContainer} onPress={onNavigate}>
    <Checkbox style={styles.checkbox} value={isCompleted} onValueChange={onToggle} color={isCompleted ? COLORS.primary : undefined} />
    <View style={styles.itemTextContainer}>
      <Text style={[styles.itemLabel, isCompleted && styles.completedText]}>{title}</Text>
      {detailText && <Text style={styles.itemSublabel}>{detailText}</Text>}
    </View>
    <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textSecondary} />
  </Pressable>
);

const EmptyState = ({ message }) => (
  <View style={styles.emptyContainer}><Text style={styles.emptyText}>{message}</Text></View>
);

const TaskSection = ({ title, tasks, emptyMessage, onToggle, onNavigate, sectionType, iconName }) => (
  <>
    <View style={styles.sectionHeaderContainer}>
      {iconName && <Ionicons name={iconName} size={20} color={COLORS.iconPrimary} style={styles.sectionIcon} />}
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
    <View style={styles.card}>
      {tasks.length > 0 ? (
        tasks.map((task, index) => {
          let detailText = null;
          if (sectionType === 'upcoming' || sectionType === 'today') {
            detailText = `Due ${new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`;
          } else if (sectionType === 'allCompleted' || sectionType === 'yesterdayCompleted') {
            detailText = `Completed ${new Date(task.$updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
          }

          return (
            <React.Fragment key={task.$id}>
              <TaskItem
                title={task.title}
                detailText={detailText}
                isCompleted={task.status === 'Completed'}
                onToggle={() => onToggle(task)}
                onNavigate={() => onNavigate(task.goalId, task.$id)}
              />
              {index < tasks.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          );
        })
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </View>
  </>
);


export default function DailyStandupScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedTasks = await listMyTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      alert("Could not load your tasks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // FIX 2: The entire useLayoutEffect block has been removed to prevent conflict with the layout file.
  
  const { completedYesterday, dueToday, upcoming, allCompleted } = useMemo(() => {
    const incompleteStatuses = ['Paused', 'Active', 'Not Started'];
    
    return {
      completedYesterday: tasks.filter(t => t.status === 'Completed' && isYesterday(t.$updatedAt)),
      dueToday: tasks.filter(t => incompleteStatuses.includes(t.status) && isToday(t.dueDate)),
      upcoming: tasks.filter(t => incompleteStatuses.includes(t.status) && isUpcoming(t.dueDate)),
      allCompleted: tasks.filter(t => t.status === 'Completed'),
    };
  }, [tasks]);

  const handleToggleTask = async (task) => {
    const isNowCompleted = task.status !== 'Completed';
    const newStatus = isNowCompleted ? 'Completed' : 'Active';
    
    try {
      await upsertTask({ ...task, status: newStatus });
      await fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Could not update the task.");
    }
  };

  const handleNavigate = (goalId, taskId) => {
    router.push(`/ViewTask?taskId=${taskId}`);
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <DateHeader date={new Date()} />
        <TaskSection title="Yesterday's Progress" tasks={completedYesterday} emptyMessage="No tasks completed yesterday." onToggle={handleToggleTask} onNavigate={handleNavigate} sectionType="yesterdayCompleted" iconName="checkmark-circle-outline"/>
        <TaskSection title="Today's Focus" tasks={dueToday} emptyMessage="You're all caught up for today! 🎉" onToggle={handleToggleTask} onNavigate={handleNavigate} sectionType="today" iconName="today-outline"/>
        <TaskSection title="What's Next" tasks={upcoming} emptyMessage="No upcoming tasks. Plan ahead!" onToggle={handleToggleTask} onNavigate={handleNavigate} sectionType="upcoming" iconName="calendar-outline"/>
        <TaskSection title="All Completed" tasks={allCompleted} emptyMessage="No tasks have been completed yet." onToggle={handleToggleTask} onNavigate={handleNavigate} sectionType="allCompleted" iconName="albums-outline"/>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  scrollContent: { padding: 16 },
  dateHeaderContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionHeader: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.textSecondary, 
    textTransform: 'uppercase', 
  },
  card: { backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.card },
  checkbox: { marginRight: 16, borderRadius: 6 },
  itemTextContainer: { flex: 1, justifyContent: 'center' },
  itemLabel: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  completedText: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  itemSublabel: { fontSize: 13, color: COLORS.primaryLight, marginTop: 4, fontWeight: '600' }, 
  divider: { height: 1, backgroundColor: '#F1F3F5', marginLeft: 50 },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, fontStyle: 'italic' },
});