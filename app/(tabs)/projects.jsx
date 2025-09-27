import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listMyGoals } from '../../lib/goalRepo';
import { listMyTasks } from '../../lib/taskRepo';
import { listMyProjects } from '../../lib/projectRepo'; // 👈 NEW
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { useTheme } from '../../context/ThemeContext';

const FilterControl = ({ options, selectedOption, onSelect, colors }) => (
  <View style={[styles.filterContainer, { backgroundColor: colors.border }]}>
    {options.map(option => (
      <Pressable key={option} style={[styles.filterButton, selectedOption === option && { backgroundColor: colors.card }]} onPress={() => onSelect(option)}>
        <Text style={[styles.filterButtonText, { color: colors.textSecondary }, selectedOption === option && { color: colors.primary }]}>{option}</Text>
      </Pressable>
    ))}
  </View>
);

const ProjectCard = ({ projectName, goals, taskCount, onPress, colors }) => {
  const completedGoals = useMemo(() => goals.filter(g => g.status === 'Completed').length, [goals]);
  const progress = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;
  return (
    <Pressable style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{projectName}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="flag-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {goals.length} {goals.length === 1 ? 'Goal' : 'Goals'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-done-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
          </Text>
        </View>
      </View>

      <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBarFill, { width: `${Math.round(progress)}%`, backgroundColor: colors.primary }]} />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>{Math.round(progress)}% Complete</Text>
    </Pressable>
  );
};

// 👇 NEW: "Not Assigned" card (goals with no project relation)
const NotAssignedCard = ({ goals, taskCount, onPress, colors }) => {
  const completed = useMemo(() => goals.filter(g => g.status === 'Completed').length, [goals]);
  const progress = goals.length ? (completed / goals.length) * 100 : 0;
  return (
    <Pressable style={[styles.card, { borderStyle: 'dashed', backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: '#FDECEC' }]}>
          <Ionicons name="folder-open-outline" size={20} color="#EF4444" />
        </View>
        <Text style={[styles.cardTitle, { color: '#EF4444' }]}>Not Assigned</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="flag-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {goals.length} {goals.length === 1 ? 'Goal' : 'Goals'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-done-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
          </Text>
        </View>
      </View>

      <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBarFill, { width: `${Math.round(progress)}%`, backgroundColor: '#EF4444' }]} />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>{Math.round(progress)}% Complete</Text>
    </Pressable>
  );
};

export default function ProjectsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [projectsRaw, setProjectsRaw] = useState([]); // 👈 NEW
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recently Updated');

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [fetchedProjects, fetchedGoals, fetchedTasks] = await Promise.all([
            listMyProjects(), // ← real projects for the current user
            listMyGoals(),
            listMyTasks(),
          ]);
          setProjectsRaw(fetchedProjects || []);
          setGoals(fetchedGoals || []);
          setTasks(fetchedTasks || []);
        } catch (error) {
          console.error("Failed to fetch project data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  // Build: assigned project buckets + a Not Assigned bucket
  const { assignedProjects, notAssigned } = useMemo(() => {
  const filteredGoals = goals.filter(goal => {
    if (filter === 'All') return true;
    if (filter === 'Active') return goal.status !== 'Completed';
    if (filter === 'Completed') return goal.status === 'Completed';
    return true;
  });

  const byId = new Map(projectsRaw.map(p => [String(p.$id), p]));

  const buckets = new Map();
  const ensureBucket = (proj) => {
    const key = String(proj.$id);
    if (!buckets.has(key)) {
      buckets.set(key, {
        project: proj,
        projectName: proj.name || '(Untitled Project)',
        goals: [],
        taskCount: 0,
      });
    }
    return buckets.get(key);
  };

  // Pre-seed every project so empty ones render
  for (const p of projectsRaw) ensureBucket(p);

  const unassigned = { goals: [], taskCount: 0 };
  const goalToBucketKey = new Map();

  for (const g of filteredGoals) {
    const relId = g.projectId || g.project?.$id || null;
    if (relId && byId.has(String(relId))) {
      const bucket = ensureBucket(byId.get(String(relId)));
      bucket.goals.push(g);
      goalToBucketKey.set(g.$id, String(relId));
    } else {
      unassigned.goals.push(g);
      goalToBucketKey.set(g.$id, 'not-assigned');
    }
  }

  for (const t of tasks) {
    const tRelId = t.projectId || t.project?.$id || null;
    if (tRelId && buckets.has(String(tRelId))) {
      buckets.get(String(tRelId)).taskCount += 1;
    } else if (t.goalId && goalToBucketKey.has(t.goalId)) {
      const key = goalToBucketKey.get(t.goalId);
      if (key === 'not-assigned') unassigned.taskCount += 1;
      else if (buckets.has(key)) buckets.get(key).taskCount += 1;
    } else {
      unassigned.taskCount += 1;
    }
  }

  let assigned = Array.from(buckets.values());

  const getMostRecentGoalUpdate = (arr) =>
    arr.length ? Math.max(...arr.map(g => new Date(g.$updatedAt || g.$createdAt || 0).getTime())) : 0;
  const getHighestPriority = (arr) =>
    arr.length ? Math.max(...arr.map(g => Number(g.priority ?? 0))) : 0;
  const getMostRecentTaskUpdate = (proj) => {
    const goalIds = new Set(proj.goals.map(g => g.$id));
    const relevant = tasks.filter(
      t => (t.projectId && proj.project?.$id && String(t.projectId) === String(proj.project.$id)) ||
           (t.goalId && goalIds.has(t.goalId))
    );
    return relevant.length
      ? Math.max(...relevant.map(t => new Date(t.$updatedAt || t.$createdAt || 0).getTime()))
      : 0;
  };

  switch (sortBy) {
    case 'Highest Priority':
      assigned.sort((a, b) => getHighestPriority(b.goals) - getHighestPriority(a.goals));
      break;
    case 'Recent Task Activity':
      assigned.sort((a, b) => getMostRecentTaskUpdate(b) - getMostRecentTaskUpdate(a));
      break;
    case 'Recently Updated':
    default:
      assigned.sort((a, b) => getMostRecentGoalUpdate(b.goals) - getMostRecentGoalUpdate(a.goals));
      break;
  }

  return { assignedProjects: assigned, notAssigned: unassigned };
}, [projectsRaw, goals, tasks, filter, sortBy]);


  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>My Projects</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Organize your goals, achieve more.</Text>
          </View>

          <Menu>
            <MenuTrigger>
              <Ionicons name="options-outline" size={24} color={colors.textSecondary} />
            </MenuTrigger>
            <MenuOptions customStyles={getMenuStyles(colors)}>
              <Text style={[menuStyles.title, { color: colors.textSecondary }]}>Sort By</Text>
              <MenuOption onSelect={() => setSortBy('Recently Updated')} text='Recently Updated' />
              <MenuOption onSelect={() => setSortBy('Highest Priority')} text='Highest Priority' />
              <MenuOption onSelect={() => setSortBy('Recent Task Activity')} text='Recent Task Activity' />
            </MenuOptions>
          </Menu>
        </View>

        <FilterControl options={['All', 'Active', 'Completed']} selectedOption={filter} onSelect={setFilter} colors={colors} />

        {/* Not Assigned first (only if there are any) */}
        {notAssigned.goals.length > 0 && (
          <NotAssignedCard
            goals={notAssigned.goals}
            taskCount={notAssigned.taskCount}
            onPress={() =>
              router.push({
                pathname: '/ProjectDetails',
                params: {
                  projectId: '',
                  projectName: 'Not Assigned',
                  goals: JSON.stringify(notAssigned.goals),
                },
              })
            }
            colors={colors}
          />
        )}

        {/* Assigned project cards */}
        {assignedProjects.length > 0 ? (
          assignedProjects.map(p => (
            <ProjectCard
              key={p.project.$id}
              projectName={p.projectName}
              goals={p.goals}
              taskCount={p.taskCount}
              onPress={() =>
                router.push({
                  pathname: '/ProjectDetails',
                  params: {
                    projectId: p.project.$id,
                    projectName: p.projectName,
                    goals: JSON.stringify(p.goals),
                  },
                })
              }
              colors={colors}
            />
          ))
        ) : (
          notAssigned.goals.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Projects Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>No projects match the current filter.</Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginBottom: 16 },
  headerTitle: { fontFamily: 'Pacifico_400Regular', fontSize: 40 },
  headerSubtitle: { fontSize: 16, marginTop: -5 },
  filterContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 24 },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  filterButtonText: { fontSize: 14, fontWeight: '600' },
  card: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  statsContainer: { flexDirection: 'row', marginTop: 8, marginLeft: 52, gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardSubtitle: { fontSize: 14 },
  progressBarBackground: { height: 8, borderRadius: 4, marginTop: 16, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: 'right', marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, marginTop: '20%' },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  emptySubtitle: { fontSize: 16, textAlign: 'center', marginTop: 8 },
});

const getMenuStyles = (colors) => ({
  optionsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 8,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  optionText: { fontSize: 16, color: colors.text },
});

const menuStyles = {
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
};
