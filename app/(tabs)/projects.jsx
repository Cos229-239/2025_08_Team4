import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listMyGoals } from '../../lib/goalRepo';
import { listMyTasks } from '../../lib/taskRepo';
// NEW: Import the popup menu components
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

const COLORS = { 
  primary: '#04A777',
  primaryLight: '#E6F6F1',
  background: '#F8F9FA', 
  card: '#FFFFFF', 
  text: '#212529', 
  textSecondary: '#6C757D', 
  border: '#E9ECEF',
};

// FilterControl and ProjectCard components remain the same
const FilterControl = ({ options, selectedOption, onSelect }) => (
  <View style={styles.filterContainer}>
    {options.map(option => (
      <Pressable key={option} style={[styles.filterButton, selectedOption === option && styles.filterButtonActive]} onPress={() => onSelect(option)}>
        <Text style={[styles.filterButtonText, selectedOption === option && styles.filterButtonTextActive]}>{option}</Text>
      </Pressable>
    ))}
  </View>
);
const ProjectCard = ({ projectName, goals, taskCount, onPress }) => {
  const completedGoals = useMemo(() => goals.filter(g => g.status === 'Completed').length, [goals]);
  const progress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}><View style={styles.cardIcon}><Ionicons name="briefcase-outline" size={20} color={COLORS.primary} /></View><Text style={styles.cardTitle}>{projectName}</Text></View>
      <View style={styles.statsContainer}><View style={styles.statItem}><Ionicons name="flag-outline" size={16} color={COLORS.textSecondary} /><Text style={styles.cardSubtitle}>{goals.length} {goals.length === 1 ? 'Goal' : 'Goals'}</Text></View><View style={styles.statItem}><Ionicons name="checkmark-done-outline" size={16} color={COLORS.textSecondary} /><Text style={styles.cardSubtitle}>{taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}</Text></View></View>
      <View style={styles.progressBarBackground}><View style={[styles.progressBarFill, { width: `${progress}%` }]} /></View>
      <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
    </Pressable>
  );
};


export default function ProjectsScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recently Updated'); // NEW: State for sorting

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [fetchedGoals, fetchedTasks] = await Promise.all([listMyGoals(), listMyTasks()]);
          setGoals(fetchedGoals);
          setTasks(fetchedTasks);
        } catch (error) {
          console.error("Failed to fetch project data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  // UPDATED: This now includes advanced sorting logic
  const projects = useMemo(() => {
    if (!goals.length) return [];

    const filteredGoals = goals.filter(goal => {
      if (filter === 'All') return true;
      if (filter === 'Active') return goal.status !== 'Completed';
      if (filter === 'Completed') return goal.status === 'Completed';
      return true;
    });
    
    const goalIdToProjectMap = new Map(goals.map(g => [g.$id, g.project?.trim() || 'General']));
    const projectTaskCounts = tasks.reduce((acc, task) => {
      const projectName = goalIdToProjectMap.get(task.goalId) || 'General';
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {});
    const groupedGoals = filteredGoals.reduce((acc, goal) => {
      const projectName = goal.project?.trim() || 'General';
      if (!acc[projectName]) acc[projectName] = [];
      acc[projectName].push(goal);
      return acc;
    }, {});
    
    let processedProjects = Object.keys(groupedGoals).map(projectName => ({
      projectName,
      goals: groupedGoals[projectName],
      taskCount: projectTaskCounts[projectName] || 0,
    }));

    // --- NEW: Sorting Logic ---
    const getMostRecentGoalUpdate = (goals) => Math.max(...goals.map(g => new Date(g.$updatedAt).getTime()));
    const getHighestPriority = (goals) => Math.max(...goals.map(g => g.priority));
    const getMostRecentTaskUpdate = (project) => {
      const goalIds = new Set(project.goals.map(g => g.$id));
      const relevantTasks = tasks.filter(t => goalIds.has(t.goalId));
      if (!relevantTasks.length) return 0;
      return Math.max(...relevantTasks.map(t => new Date(t.$updatedAt).getTime()));
    };

    switch (sortBy) {
      case 'Highest Priority':
        processedProjects.sort((a, b) => getHighestPriority(b.goals) - getHighestPriority(a.goals));
        break;
      case 'Recent Task Activity':
        processedProjects.sort((a, b) => getMostRecentTaskUpdate(b) - getMostRecentTaskUpdate(a));
        break;
      case 'Recently Updated':
      default:
        processedProjects.sort((a, b) => getMostRecentGoalUpdate(b.goals) - getMostRecentGoalUpdate(a.goals));
        break;
    }

    return processedProjects;
  }, [goals, tasks, filter, sortBy]);

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Projects</Text>
            <Text style={styles.headerSubtitle}>Organize your goals, achieve more.</Text>
          </View>
          {/* NEW: Replaced Pressable with a Menu component */}
          <Menu>
            <MenuTrigger>
              <Ionicons name="options-outline" size={24} color={COLORS.textSecondary} />
            </MenuTrigger>
            <MenuOptions customStyles={menuStyles}>
              <Text style={menuStyles.title}>Sort By</Text>
              <MenuOption onSelect={() => setSortBy('Recently Updated')} text='Recently Updated' />
              <MenuOption onSelect={() => setSortBy('Highest Priority')} text='Highest Priority' />
              <MenuOption onSelect={() => setSortBy('Recent Task Activity')} text='Recent Task Activity' />
            </MenuOptions>
          </Menu>
        </View>

        <FilterControl options={['All', 'Active', 'Completed']} selectedOption={filter} onSelect={setFilter} />

        {projects.length > 0 ? (
          projects.map(project => (
            <ProjectCard 
              key={project.projectName}
              projectName={project.projectName}
              goals={project.goals}
              taskCount={project.taskCount}
              onPress={() => router.push({ pathname: '/ProjectDetails', params: { projectName: project.projectName, goals: JSON.stringify(project.goals) }})}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}><Ionicons name="folder-open-outline" size={64} color={COLORS.textSecondary} /><Text style={styles.emptyTitle}>No Projects Found</Text><Text style={styles.emptySubtitle}>No projects match the current filter.</Text></View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginBottom: 16, },
  headerTitle: { fontFamily: 'Pacifico_400Regular', fontSize: 40, color: COLORS.primary, },
  headerSubtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: -5 },
  filterContainer: { flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: 12, padding: 4, marginBottom: 24 },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  filterButtonActive: { backgroundColor: COLORS.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  filterButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  filterButtonTextActive: { color: COLORS.primary },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, flex: 1 },
  statsContainer: { flexDirection: 'row', marginTop: 8, marginLeft: 52, gap: 16, },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4, },
  cardSubtitle: { fontSize: 14, color: COLORS.textSecondary, },
  progressBarBackground: { height: 8, borderRadius: 4, backgroundColor: COLORS.border, marginTop: 16, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  progressText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, marginTop: '20%' },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginTop: 16 },
  emptySubtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
});

// NEW: Custom styles for the popup menu
const menuStyles = {
  optionsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 8,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
};