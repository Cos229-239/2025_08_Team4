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
import { updateProfile } from '../../lib/profile';
import { NotificationService, REMINDER_FREQUENCIES } from '../../lib/notifications';
import { account } from '../../lib/appwrite';
import Constants from 'expo-constants';

export default function ReminderScheduleScreen() {
  const router = useRouter();
  const { profile, refresh, user } = useGlobalContext();
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
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Font loading error. Please restart the app.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#04A777" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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
        <View style={styles.formContainer}>
          <Text style={styles.pageSubtitle}>Configure when and how often you want to receive reminders</Text>
          
          {isExpoGo && (
            <View style={styles.expoGoWarning}>
              <Ionicons name="warning-outline" size={20} color="#FF6B35" />
              <Text style={styles.expoGoWarningText}>
                Push notifications have limited functionality in Expo Go. For full notification support, use a development build.
              </Text>
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enable Notifications</Text>
            <Text style={styles.subLabel}>Receive reminders about your goals and tasks</Text>
            <TouchableOpacity
              style={[styles.toggleButton, notificationsEnabled && styles.toggleButtonActive]}
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <Ionicons 
                name={notificationsEnabled ? "notifications" : "notifications-off"} 
                size={24} 
                color={notificationsEnabled ? "#04A777" : "#666"} 
              />
              <Text style={[styles.toggleText, notificationsEnabled && styles.toggleTextActive]}>
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>

          {notificationsEnabled && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Daily Standup Time</Text>
                <Text style={styles.subLabel}>When you want to receive your daily goal reminder</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={24} color="#04A777" />
                  <Text style={styles.timeText}>{formatTime(dailyStandupTime)}</Text>
                  <Ionicons name="chevron-forward-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Goal Reminder Frequency</Text>
                <Text style={styles.subLabel}>How often you want to be reminded about your goals</Text>
                <View style={styles.frequencyContainer}>
                  {Object.entries(REMINDER_FREQUENCIES).map(([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.frequencyButton,
                        reminderFrequency === key && styles.frequencyButtonActive
                      ]}
                      onPress={() => setReminderFrequency(key)}
                    >
                      <Text style={[
                        styles.frequencyText,
                        reminderFrequency === key && styles.frequencyTextActive
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
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#04A777',
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
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#04A777',
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
    backgroundColor: '#FFFFFF',
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
    color: '#666666',
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
    color: '#333333',
    marginBottom: 8,
  },
  subLabel: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(4, 167, 119, 0.1)',
    borderColor: '#04A777',
  },
  toggleText: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 16,
    color: '#666666',
    marginLeft: 12,
  },
  toggleTextActive: {
    color: '#04A777',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
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
    color: '#333333',
    marginLeft: 12,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  frequencyButtonActive: {
    backgroundColor: '#04A777',
    borderColor: '#04A777',
  },
  frequencyText: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 14,
    color: '#666666',
  },
  frequencyTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#04A777',
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
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  expoGoWarningText: {
    flex: 1,
    fontFamily: 'OpenSans_700Bold',
    fontSize: 14,
    color: '#E65100',
    marginLeft: 8,
    lineHeight: 20,
  },
});
