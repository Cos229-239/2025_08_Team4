import React, { useState } from 'react';
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
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../../lib/notifications';
import Constants from 'expo-constants';

export default function TestNotificationsScreen() {
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts({
    Pacifico_400Regular,
    Oswald_600SemiBold,
    OpenSans_700Bold,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExpoGo, setIsExpoGo] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  React.useEffect(() => {
    setIsExpoGo(Constants.appOwnership === 'expo');
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      console.log('Notification permission status:', status);
    } catch (error) {
      console.log('Error checking permissions:', error);
      setPermissionStatus('error');
    }
  };

  const testLocalNotification = async () => {
    try {
      setIsLoading(true);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a local test notification!',
        },
        trigger: { seconds: 2 },
      });
      Alert.alert('Success', 'Local notification scheduled for 2 seconds!');
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to schedule notification');
    } finally {
      setIsLoading(false);
    }
  };

  const testScheduledNotification = async () => {
    try {
      setIsLoading(true);
      const result = await NotificationService.scheduleDailyStandup('09:00');
      if (result) {
        Alert.alert('Success', 'Daily standup scheduled for 9:00 AM!');
      } else {
        Alert.alert('Info', 'Notification scheduling skipped (Expo Go limitation)');
      }
    } catch (error) {
      console.error('Error scheduling daily standup:', error);
      Alert.alert('Error', 'Failed to schedule daily standup');
    } finally {
      setIsLoading(false);
    }
  };

  const testGoalReminder = async () => {
    try {
      setIsLoading(true);
      const result = await NotificationService.scheduleGoalReminder(
        'test-goal-id',
        'Test Goal',
        'daily'
      );
      if (result) {
        Alert.alert('Success', 'Goal reminder scheduled!');
      } else {
        Alert.alert('Info', 'Goal reminder scheduling skipped (Expo Go limitation)');
      }
    } catch (error) {
      console.error('Error scheduling goal reminder:', error);
      Alert.alert('Error', 'Failed to schedule goal reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const testImmediateNotification = async () => {
    try {
      setIsLoading(true);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Immediate Test',
          body: 'This notification should appear immediately!',
        },
        trigger: null, // Immediate
      });
      Alert.alert('Success', 'Immediate notification sent!');
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      Alert.alert('Error', 'Failed to send immediate notification');
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted': return '#04A777';
      case 'denied': return '#E74C3C';
      case 'undetermined': return '#F39C12';
      default: return '#666';
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted': return 'Granted';
      case 'denied': return 'Denied';
      case 'undetermined': return 'Not Requested';
      default: return 'Unknown';
    }
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
        <Text style={styles.headerTitle}>Test Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Text style={styles.pageSubtitle}>Test notification functionality and permissions</Text>
          
          {isExpoGo && (
            <View style={styles.expoGoWarning}>
              <Ionicons name="warning-outline" size={20} color="#FF6B35" />
              <Text style={styles.expoGoWarningText}>
                Push notifications have limited functionality in Expo Go. For full testing, use a development build.
              </Text>
            </View>
          )}

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Permission Status:</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, { backgroundColor: getPermissionStatusColor() }]} />
              <Text style={styles.statusText}>{getPermissionStatusText()}</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={checkPermissions}>
                <Ionicons name="refresh" size={16} color="#04A777" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.testSection}>
            <Text style={styles.sectionTitle}>Basic Tests</Text>
            
            <TouchableOpacity 
              style={[styles.testButton, isLoading && styles.testButtonDisabled]} 
              onPress={testImmediateNotification}
              disabled={isLoading}
            >
              <Ionicons name="flash" size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Test Immediate Notification</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.testButton, isLoading && styles.testButtonDisabled]} 
              onPress={testLocalNotification}
              disabled={isLoading}
            >
              <Ionicons name="time" size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Test Delayed Notification (2s)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.testSection}>
            <Text style={styles.sectionTitle}>Service Tests</Text>
            
            <TouchableOpacity 
              style={[styles.testButton, isLoading && styles.testButtonDisabled]} 
              onPress={testScheduledNotification}
              disabled={isLoading}
            >
              <Ionicons name="calendar" size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Schedule Daily Standup</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.testButton, isLoading && styles.testButtonDisabled]} 
              onPress={testGoalReminder}
              disabled={isLoading}
            >
              <Ionicons name="flag" size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Schedule Goal Reminder</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Testing Tips:</Text>
            <Text style={styles.infoText}>• Check console logs for detailed feedback</Text>
            <Text style={styles.infoText}>• Immediate notifications should work in Expo Go</Text>
            <Text style={styles.infoText}>• Scheduled notifications may be limited in Expo Go</Text>
            <Text style={styles.infoText}>• For full testing, create a development build</Text>
          </View>
        </View>
      </ScrollView>
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
  statusContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusLabel: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  testSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#04A777',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#04A777',
  },
  infoTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 20,
  },
});
