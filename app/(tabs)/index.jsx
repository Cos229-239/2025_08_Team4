import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { listMyTasks } from '../../lib/taskRepo';
import { listMyGoals } from '../../lib/goalRepo';
import { getOrCreateProfile } from '../../lib/profile';


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

const COLORS = { 
  primary: '#04A777', 
  primaryLight: '#E6F6F1',
  background: '#F8F9FA', 
  card: '#FFFFFF', 
  text: '#212529', 
  textSecondary: '#6C757D', 
  border: '#E9ECEF',
};

const ManagementButton = ({ title, iconName, onPress }) => (
  <Pressable style={styles.gridItem} onPress={onPress} accessibilityRole='button'>
    <Ionicons name={iconName} size={32} color="#3177C9" />
    <Text style={styles.gridText}>{title}</Text>
  </Pressable>
);

export default function HomeScreen() {
  const router = useRouter();
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

        {/* --- Daily Stand Up Section --- */}
        <View style={styles.sectionHeader}>
          {/* UPDATED: Title changed */}
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
          <Pressable style={styles.actionButton} onPress={() => router.push('/taskAttack')}>
             <MaterialCommunityIcons name="target-variant" size={28} color={COLORS.primary} />
             <Text style={styles.actionButtonText}>Task Attack</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.push('../addProject')}>
             <MaterialCommunityIcons name="folder-plus-outline" size={28} color={COLORS.primary} />
             <Text style={styles.actionButtonText}>New Project</Text>
          </Pressable>
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
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 8,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionsRowSpacer: {  //add this style to and quick action buttons added belowe the top row
  marginTop: 16,
},
});