import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGlobalContext } from '../../context/GlobalProvider';
import { useTheme } from '../../context/ThemeContext';
import { updateProfile } from '../../lib/profile';
import { NotificationService, REMINDER_FREQUENCIES } from '../../lib/notifications';
import { account } from '../../lib/appwrite';
import Constants from 'expo-constants';

export default function ReminderScheduleScreen() {
  const router = useRouter();
  const { profile, refresh, user } = useGlobalContext();
  const { colors } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Pacifico_400Regular,
    Oswald_600SemiBold,
    OpenSans_700Bold,
  });

  // State for notification preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyStandupTime, setDailyStandupTime] = useState(new Date());
  const [reminderFrequency, setReminderFrequency] = useState('daily');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpoGo, setIsExpoGo] = useState(false);

  // Load existing preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load from user preferences first (for notification settings)
        if (user?.prefs) {
          setNotificationsEnabled(user.prefs.notificationsEnabled ?? true);
          
          // Parse daily standup time from user prefs
          if (user.prefs.dailyStandupTime) {
            const [hours, minutes] = user.prefs.dailyStandupTime.split(':').map(Number);
            const time = new Date();
            time.setHours(hours, minutes, 0, 0);
            setDailyStandupTime(time);
          }
        }
        
        // Load reminder frequency from profile (this should work)
        if (profile) {
          setReminderFrequency(profile.reminderFrequency || 'daily');
        }
      } catch (error) {
        console.log('Error loading preferences:', error);
        // Set defaults if loading fails
        setNotificationsEnabled(true);
        setReminderFrequency('daily');
      }
    };

    loadPreferences();
    
    // Check if running in Expo Go
    setIsExpoGo(Constants.appOwnership === 'expo');
  }, [profile, user]);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const dailyStandupTimeString = `${dailyStandupTime.getHours().toString().padStart(2, '0')}:${dailyStandupTime.getMinutes().toString().padStart(2, '0')}`;
      
      // Update profile with reminder frequency (this should work)
      await updateProfile({
        reminderFrequency,
      });

      // Update user preferences with notification settings
      try {
        const me = await account.get();
        const prefs = {
          ...me.prefs,
          notificationsEnabled,
          dailyStandupTime: dailyStandupTimeString,
        };
        await account.updatePrefs(prefs);
        console.log('Notification preferences saved to user prefs');
      } catch (prefError) {
        console.log('Could not save notification preferences:', prefError);
        // Continue anyway - the main profile update might have worked
      }

      // Schedule/cancel notifications based on preferences
      if (notificationsEnabled) {
        // Schedule daily standup
        await NotificationService.scheduleDailyStandup(dailyStandupTimeString);
      } else {
        // Cancel all notifications
        await NotificationService.cancelAllNotifications();
      }

      // Refresh profile data
      await refresh();

      Alert.alert('Success', 'Reminder schedule updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating reminder schedule:', error);
      Alert.alert('Error', 'Failed to update reminder schedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDailyStandupTime(selectedTime);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (fontError) {
    console.error('Font loading error:', fontError);
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>Font loading error. Please restart the app.</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reminder Schedule</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Configure when and how often you want to receive reminders</Text>
          
          {isExpoGo && (
            <View style={[styles.expoGoWarning, { backgroundColor: colors.warning + '20', borderLeftColor: colors.warning }]}>
              <Ionicons name="warning-outline" size={20} color={colors.warning} />
              <Text style={[styles.expoGoWarningText, { color: colors.warning }]}>
                Push notifications have limited functionality in Expo Go. For full notification support, use a development build.
              </Text>
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Enable Notifications</Text>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Receive reminders about your goals and tasks</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton, 
                { backgroundColor: colors.background, borderColor: colors.border },
                notificationsEnabled && [styles.toggleButtonActive, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]
              ]}
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <Ionicons 
                name={notificationsEnabled ? "notifications" : "notifications-off"} 
                size={24} 
                color={notificationsEnabled ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.toggleText, 
                { color: colors.textSecondary },
                notificationsEnabled && [styles.toggleTextActive, { color: colors.primary }]
              ]}>
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>

          {notificationsEnabled && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Daily Standup Time</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>When you want to receive your daily goal reminder</Text>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={24} color={colors.primary} />
                  <Text style={[styles.timeText, { color: colors.text }]}>{formatTime(dailyStandupTime)}</Text>
                  <Ionicons name="chevron-forward-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Goal Reminder Frequency</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>How often you want to be reminded about your goals</Text>
                <View style={styles.frequencyContainer}>
                  {Object.entries(REMINDER_FREQUENCIES).map(([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.frequencyButton,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        reminderFrequency === key && [styles.frequencyButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                      ]}
                      onPress={() => setReminderFrequency(key)}
                    >
                      <Text style={[
                        styles.frequencyText,
                        { color: colors.textSecondary },
                        reminderFrequency === key && [styles.frequencyTextActive, { color: colors.card }]
                      ]}>
                        {value.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.primary }, isLoading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showTimePicker && (
        <DateTimePicker
          value={dailyStandupTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 100,
    paddingHorizontal: 24,
  },
  formContainer: {
    borderRadius: 15,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  pageSubtitle: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  subLabel: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(4, 167, 119, 0.1)',
    borderColor: '#04A777',
  },
  toggleText: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 16,
    marginLeft: 12,
  },
  toggleTextActive: {
    color: '#04A777',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeText: {
    flex: 1,
    fontFamily: 'OpenSans_700Bold',
    fontSize: 16,
    marginLeft: 12,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  frequencyButtonActive: {
    backgroundColor: '#04A777',
    borderColor: '#04A777',
  },
  frequencyText: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 14,
  },
  frequencyTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Oswald_600SemiBold',
  },
  expoGoWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  expoGoWarningText: {
    flex: 1,
    fontFamily: 'OpenSans_700Bold',
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 20,
  },
});
