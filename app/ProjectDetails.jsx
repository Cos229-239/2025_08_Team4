import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import SnowyMountain from '../components/SnowyMountain'; 
// CORRECTED: Path to repository files
import { listMyTasks, upsertTask } from '../lib/taskRepo'; 

const COLORS = { 
  primary: '#04A777',
  primaryLight: '#E6F6F1',
  background: '#F8F9FA', 
  card: '#FFFFFF', 
  text: '#212529', 
  textSecondary: '#6C757D', 
  border: '#E9ECEF',
  priority1: '#6FCF97', priority2: '#F2C94C', priority3: '#F2994A',
  priority4: '#EB5757', priority5: '#C22B34',
};

const getPriorityColor = (level) => {
    const p = parseInt(level, 10);
    if (p === 1) return COLORS.priority1; if (p === 2) return COLORS.priority2;
    if (p === 3) return COLORS.priority3; if (p === 4) return COLORS.priority4;
    if (p === 5) return COLORS.priority5; return COLORS.border;
};

const FilterControl = ({ options, selectedOption, onSelect }) => (
  <View style={styles.filterContainer}>
    {options.map(option => (
      <Pressable key={option} style={[styles.filterButton, selectedOption === option && styles.filterButtonActive]} onPress={() => onSelect(option)}>
        <Text style={[styles.filterButtonText, selectedOption === option && styles.filterButtonTextActive]}>{option}</Text>
      </Pressable>
    ))}
  </View>
);

const GoalItem = ({ goal, onPress }) => (
  <Pressable style={styles.itemCard} onPress={onPress}>
    <View style={{ flex: 1 }}>
      <Text style={styles.itemTitle}>{goal.title}</Text>
      <Text style={styles.itemDescription}>{goal.description}</Text>
      <View style={styles.goalFooter}>
        <View style={styles.mountainRow}>
          {[1, 2, 3, 4, 5].map(n => <SnowyMountain key={n} width={20} height={20} mountainColor={n <= goal.priority ? getPriorityColor(n) : '#E0E0E0'} snowColor={'#FFFFFF'} strokeWidth={0}/>)}
        </View>
      </View>
    </View>
    <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textSecondary} />
  </Pressable>
);

const TaskItem = ({ task, onToggle, onNavigate }) => (
    <Pressable style={styles.itemCard} onPress={onNavigate}>
        <Checkbox
            style={{ marginRight: 16 }}
            value={task.status === 'Completed'}
            onValueChange={() => onToggle(task)}
            color={COLORS.primary}
        />
        <View style={{flex: 1}}>
            <Text style={[styles.itemTitle, task.status === 'Completed' && styles.completedText]}>{task.title}</Text>
            {task.dueDate && <Text style={styles.itemDate}>Due {new Date(task.dueDate).toLocaleDateString()}</Text>}
        </View>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textSecondary} />
    </Pressable>
);

export default function ProjectDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { projectName } = params;
  const projectGoals = params.goals ? JSON.parse(params.goals) : [];
  
  const [allTasks, setAllTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('Goals');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectGoals.length) {
        setIsLoading(false);
        return;
      }
      try {
        const fetchedTasks = await listMyTasks();
        setAllTasks(fetchedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks for project:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [projectGoals]);

  const projectTasks = useMemo(() => {
    const goalIds = new Set(projectGoals.map(g => g.$id));
    return allTasks.filter(task => goalIds.has(task.goalId));
  }, [allTasks, projectGoals]);

  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Active' : 'Completed';
    try {
      const updatedTask = await upsertTask({ ...task, status: newStatus });
      setAllTasks(prevTasks => prevTasks.map(t => t.$id === updatedTask.$id ? updatedTask : t));
    } catch (error) {
      console.error("Failed to toggle task:", error);
      Alert.alert("Error", "Could not update the task.");
    }
  };

  const completedGoals = projectGoals.filter(g => g.status === 'Completed').length;
  const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;
  const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.customHeader}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{projectName}</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Project Progress</Text>
            <View style={styles.progressBarBackground}><View style={[styles.progressBarFill, { width: `${progress}%` }]} /></View>
            <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
            <View style={styles.statsContainer}>
                <Text style={styles.statText}>{completedGoals} / {projectGoals.length} Goals</Text>
                <Text style={styles.statText}>{completedTasks} / {projectTasks.length} Tasks</Text>
            </View>
        </View>

        <FilterControl options={['Goals', 'Tasks']} selectedOption={viewMode} onSelect={setViewMode} />

        {isLoading ? <ActivityIndicator size="large" color={COLORS.primary} /> : (
            <>
                {viewMode === 'Goals' && projectGoals.map(goal => (
                    <GoalItem key={goal.$id} goal={goal} onPress={() => router.push(`/ViewGoalScreen?goalId=${goal.$id}`)} />
                ))}

                {viewMode === 'Tasks' && projectTasks.map(task => (
                    <TaskItem key={task.$id} task={task} onToggle={handleToggleTask} onNavigate={() => router.push(`/ViewTask?taskId=${task.$id}`)} />
                ))}
            </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, fontFamily: 'Oswald_600SemiBold' },
  scrollContent: { padding: 16, paddingTop: 0 },
  summaryCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  summaryTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  progressBarBackground: { height: 10, borderRadius: 5, backgroundColor: COLORS.border, marginTop: 16, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 5 },
  progressText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  statText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  filterContainer: { flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: 12, padding: 4, marginBottom: 16 },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  filterButtonActive: { backgroundColor: COLORS.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  filterButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  filterButtonTextActive: { color: COLORS.primary },
  itemCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  itemDescription: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4,},
  itemDate: { fontSize: 13, color: COLORS.primary, marginTop: 4, fontWeight: '600' },
  completedText: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  goalFooter: { paddingTop: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  mountainRow: { flexDirection: 'row', gap: 4 },
});