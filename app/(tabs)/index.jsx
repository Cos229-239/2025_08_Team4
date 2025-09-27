import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { listMyTasks } from '../../lib/taskRepo';
import { listMyGoals } from '../../lib/goalRepo';
import { getOrCreateProfile } from '../../lib/profile';
import { useTheme } from '../../context/ThemeContext';


const QUOTES = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "It’s not whether you get knocked down, it’s whether you get up.", author: "Vince Lombardi" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "Well done is better than well said.", author: "Benjamin Franklin" },
  { quote: "A goal is a dream with a deadline.", author: "Napoleon Hill" },
  { quote: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { quote: "You miss 100% of the shots you don’t take.", author: "Wayne Gretzky" },
  { quote: "Whether you think you can or you think you can’t, you’re right.", author: "Henry Ford" },
  { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { quote: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { quote: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { quote: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "If you want to make an easy job seem mighty hard, just keep putting off doing it.", author: "Olin Miller" },
  { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { quote: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { quote: "Nothing will work unless you do.", author: "Maya Angelou" },
  { quote: "Small deeds done are better than great deeds planned.", author: "Peter Marshall" },
  { quote: "Great things are done by a series of small things brought together.", author: "Vincent van Gogh" },
  { quote: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
  { quote: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { quote: "If it’s important to you, you’ll find a way. If not, you’ll find an excuse.", author: "Ryan Blair" },
  { quote: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { quote: "You don’t have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { quote: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
  { quote: "Never confuse motion with action.", author: "Ernest Hemingway" },
  { quote: "Your mind is for having ideas, not holding them.", author: "David Allen" },
  { quote: "If you spend too much time thinking about a thing, you’ll never get it done.", author: "Bruce Lee" },
  { quote: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Rohn" },
  { quote: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { quote: "If there is no struggle, there is no progress.", author: "Frederick Douglass" },
  { quote: "He who is not courageous enough to take risks will accomplish nothing in life.", author: "Muhammad Ali" },
  { quote: "Procrastination makes easy things hard, hard things harder.", author: "Mason Cooley" },
  { quote: "The key is not to prioritize what’s on your schedule, but to schedule your priorities.", author: "Stephen R. Covey" },
  { quote: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss" },
  { quote: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", author: "Will Durant" },
  { quote: "Don’t be pushed by your problems; be led by your dreams.", author: "Ralph Waldo Emerson" },
  { quote: "The sun’s rays do not burn until brought to a focus.", author: "Alexander Graham Bell" },
  { quote: "If opportunity doesn’t knock, build a door.", author: "Milton Berle" },
  { quote: "Hard work beats talent when talent doesn’t work hard.", author: "Tim Notke" },
  { quote: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { quote: "The best way out is always through.", author: "Robert Frost" },
  { quote: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { quote: "Carpe diem.", author: "Horace" },
  { quote: "Show up. Show up. Show up. And after a while the muse shows up, too.", author: "Isabel Allende" },
  { quote: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { quote: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
  { quote: "Saying ‘no’ is the ultimate productivity hack.", author: "Shane Parrish" },
  { quote: "Knowing is not enough; we must apply. Willing is not enough; we must do.", author: "Johann Wolfgang von Goethe" },
  { quote: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { quote: "Act as if what you do makes a difference. It does.", author: "William James" }

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

// Colors are now provided by the theme context

const UpcomingTaskItem = ({ goalName, taskTitle, dueDateText, onPress, colors }) => (
  <Pressable style={[styles.taskItem, { backgroundColor: colors.card }]} onPress={onPress}>
    <View style={styles.taskIcon}>
      <Ionicons name="radio-button-off-outline" size={24} color={colors.primary} />
    </View>
    <View style={styles.taskItemTextContainer}>
      <Text style={[styles.taskItemGoalName, { color: colors.textSecondary }]} numberOfLines={1}>{goalName}</Text>
      <Text style={[styles.taskItemTitle, { color: colors.text }]} numberOfLines={1}>{taskTitle}</Text>
    </View>
    <Text style={[styles.taskItemDueDate, { color: colors.textSecondary }]}>{dueDateText}</Text>
    <Ionicons name="chevron-forward-outline" size={22} color={colors.textSecondary} />
  </Pressable>
);

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // NEW: Select a random quote on component load
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- NEW: Redesigned Header Section --- */}
        <View style={[styles.headerContainer, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.greetingTitle, { color: colors.text }]}>Hello, {profile?.name || 'User'}!</Text>
          <View style={styles.quoteContainer}>
            <Text style={[styles.quoteText, { color: colors.text }]}>"{dailyQuote.quote}"</Text>
            <Text style={[styles.quoteAuthor, { color: colors.textSecondary }]}>- {dailyQuote.author}</Text>
          </View>
        </View>

        {/* --- Daily Stand Up Section --- */}
        <View style={styles.sectionHeader}>
          {/* UPDATED: Title changed */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Standup</Text>
          <Pressable onPress={() => router.push('/dailystandup')}>
             <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          </Pressable>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {isLoading ? (
            <ActivityIndicator style={{ padding: 20 }} size="small" color={colors.primary} />
          ) : upcomingTasksWithGoals.length > 0 ? (
            upcomingTasksWithGoals.map((task, index) => (
              <React.Fragment key={task.$id}>
                <UpcomingTaskItem
                  goalName={task.goalName}
                  taskTitle={task.title}
                  dueDateText={formatDueDate(task.dueDate)}
                  onPress={() => router.push(`/ViewTask?taskId=${task.$id}`)}
                  colors={colors}
                />
                {index < upcomingTasksWithGoals.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No upcoming tasks. Enjoy the clear path!</Text>
            </View>
          )}
        </View>


        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        </View>
        <View style={styles.actionsContainer}>
          <Pressable style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={() => router.push('/taskAttack')}>
             <MaterialCommunityIcons name="target-variant" size={28} color={colors.primary} />
             <Text style={[styles.actionButtonText, { color: colors.text }]}>Task Attack</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={() => router.push('../addProject')}>
             <MaterialCommunityIcons name="folder-plus-outline" size={28} color={colors.primary} />
             <Text style={[styles.actionButtonText, { color: colors.text }]}>New Project</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 24, },
  // NEW and UPDATED Styles for the header
  headerContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  quoteContainer: {
    marginTop: 12,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 4,
  },
  // ------------------------------------
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
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    overflow: 'hidden',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskIcon: {
    backgroundColor: 'white', // Changed from primaryLight for better contrast
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  taskItemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  taskItemGoalName: {
    fontSize: 12,
  },
  taskItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskItemDueDate: {
    fontSize: 14,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 8,
  },
  actionButton: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  actionsRowSpacer: {  //add this style to and quick action buttons added belowe the top row
  marginTop: 16,
},
});