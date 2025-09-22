import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { account } from './appwrite';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Notification categories and actions
export const NOTIFICATION_CATEGORIES = {
  GOAL_REMINDER: 'goal_reminder',
  TASK_REMINDER: 'task_reminder',
  DAILY_STANDUP: 'daily_standup',
  WEEKLY_REVIEW: 'weekly_review',
};

// Reminder frequency mappings
export const REMINDER_FREQUENCIES = {
  'daily': { label: 'Daily', hours: 24 },
  'fewdays': { label: 'Every few days', hours: 72 },
  'weekly': { label: 'Weekly', hours: 168 },
  'monthly': { label: 'Monthly', hours: 720 },
};

export class NotificationService {
  static isExpoGo() {
    return Constants.appOwnership === 'expo';
  }

  static async registerForPushNotificationsAsync() {
    let token;

    // Check if running in Expo Go
    if (this.isExpoGo()) {
      console.log('Running in Expo Go - Push notifications have limited functionality');
      console.log('For full push notification support, use a development build');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#04A777',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  static async scheduleGoalReminder(goalId, goalTitle, reminderFrequency) {
    try {
      // Check if running in Expo Go
      if (this.isExpoGo()) {
        console.log('Skipping goal reminder scheduling in Expo Go');
        return null;
      }

      // Cancel existing reminders for this goal
      await this.cancelGoalReminders(goalId);

      const frequency = REMINDER_FREQUENCIES[reminderFrequency];
      if (!frequency) {
        console.log('Invalid reminder frequency:', reminderFrequency);
        return;
      }

      // Schedule recurring notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Goal Reminder',
          body: `Don't forget to work on: ${goalTitle}`,
          data: { 
            goalId, 
            type: NOTIFICATION_CATEGORIES.GOAL_REMINDER 
          },
          categoryIdentifier: NOTIFICATION_CATEGORIES.GOAL_REMINDER,
        },
        trigger: {
          seconds: frequency.hours * 3600, // Convert hours to seconds
          repeats: true,
        },
      });

      console.log(`Scheduled goal reminder for ${goalTitle} with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling goal reminder:', error);
      throw error;
    }
  }

  static async scheduleDailyStandup(time = '09:00') {
    try {
      // Check if running in Expo Go
      if (this.isExpoGo()) {
        console.log('Skipping daily standup scheduling in Expo Go');
        return null;
      }

      // Cancel existing daily standup
      await this.cancelDailyStandup();

      const [hours, minutes] = time.split(':').map(Number);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Standup',
          body: 'Time to review your goals and plan your day!',
          data: { 
            type: NOTIFICATION_CATEGORIES.DAILY_STANDUP 
          },
          categoryIdentifier: NOTIFICATION_CATEGORIES.DAILY_STANDUP,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      console.log(`Scheduled daily standup for ${time} with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling daily standup:', error);
      throw error;
    }
  }

  static async scheduleTaskReminder(taskId, taskTitle, dueDate) {
    try {
      // Check if running in Expo Go
      if (this.isExpoGo()) {
        console.log('Skipping task reminder scheduling in Expo Go');
        return null;
      }

      const dueDateTime = new Date(dueDate);
      const now = new Date();
      
      // Don't schedule if due date is in the past
      if (dueDateTime <= now) {
        console.log('Task due date is in the past, skipping reminder');
        return;
      }

      // Schedule reminder 1 hour before due date
      const reminderTime = new Date(dueDateTime.getTime() - (60 * 60 * 1000));
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Due Soon',
          body: `${taskTitle} is due in 1 hour`,
          data: { 
            taskId, 
            type: NOTIFICATION_CATEGORIES.TASK_REMINDER 
          },
          categoryIdentifier: NOTIFICATION_CATEGORIES.TASK_REMINDER,
        },
        trigger: reminderTime,
      });

      console.log(`Scheduled task reminder for ${taskTitle} with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling task reminder:', error);
      throw error;
    }
  }

  static async cancelGoalReminders(goalId) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.goalId === goalId && 
            notification.content.data?.type === NOTIFICATION_CATEGORIES.GOAL_REMINDER) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
      
      console.log(`Cancelled goal reminders for goal: ${goalId}`);
    } catch (error) {
      console.error('Error cancelling goal reminders:', error);
    }
  }

  static async cancelDailyStandup() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === NOTIFICATION_CATEGORIES.DAILY_STANDUP) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
      
      console.log('Cancelled daily standup reminders');
    } catch (error) {
      console.error('Error cancelling daily standup:', error);
    }
  }

  static async cancelTaskReminder(taskId) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.taskId === taskId && 
            notification.content.data?.type === NOTIFICATION_CATEGORIES.TASK_REMINDER) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
      
      console.log(`Cancelled task reminder for task: ${taskId}`);
    } catch (error) {
      console.error('Error cancelling task reminder:', error);
    }
  }

  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all scheduled notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  static async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  static async setupNotificationCategories() {
    try {
      await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.GOAL_REMINDER, [
        {
          identifier: 'VIEW_GOAL',
          buttonTitle: 'View Goal',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'SNOOZE',
          buttonTitle: 'Remind Later',
          options: { opensAppToForeground: false },
        },
      ]);

      await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.TASK_REMINDER, [
        {
          identifier: 'VIEW_TASK',
          buttonTitle: 'View Task',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'MARK_COMPLETE',
          buttonTitle: 'Mark Complete',
          options: { opensAppToForeground: true },
        },
      ]);

      await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.DAILY_STANDUP, [
        {
          identifier: 'OPEN_APP',
          buttonTitle: 'Open App',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'SNOOZE',
          buttonTitle: 'Remind Later',
          options: { opensAppToForeground: false },
        },
      ]);

      console.log('Notification categories set up successfully');
    } catch (error) {
      console.error('Error setting up notification categories:', error);
    }
  }

  static async handleNotificationResponse(response) {
    const { data, actionIdentifier } = response.notification.request.content;
    
    console.log('Notification response:', { data, actionIdentifier });
    
    // Handle different notification actions
    switch (actionIdentifier) {
      case 'VIEW_GOAL':
        // Navigate to goal details
        console.log('Navigate to goal:', data.goalId);
        break;
      case 'VIEW_TASK':
        // Navigate to task details
        console.log('Navigate to task:', data.taskId);
        break;
      case 'MARK_COMPLETE':
        // Mark task as complete
        console.log('Mark task complete:', data.taskId);
        break;
      case 'SNOOZE':
        // Snooze notification for 1 hour
        console.log('Snooze notification');
        break;
      case 'OPEN_APP':
        // Open app to main screen
        console.log('Open app');
        break;
      default:
        console.log('Default notification action');
    }
  }
}

// Initialize notification service
export const initializeNotifications = async () => {
  try {
    // Check if running in Expo Go
    if (NotificationService.isExpoGo()) {
      console.log('Running in Expo Go - Notifications will have limited functionality');
      console.log('For full push notification support, build a development build');
      return null;
    }

    // Set up notification categories
    await NotificationService.setupNotificationCategories();
    
    // Register for push notifications
    const token = await NotificationService.registerForPushNotificationsAsync();
    
    // Save push token to user profile if available
    if (token) {
      try {
        const me = await account.get();
        const prefs = {
          ...me.prefs,
          pushToken: token,
          notificationsEnabled: true,
        };
        await account.updatePrefs(prefs);
        console.log('Push token saved to user profile');
      } catch (error) {
        console.log('Could not save push token to profile:', error);
      }
    }
    
    return token;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
};

export default NotificationService;
