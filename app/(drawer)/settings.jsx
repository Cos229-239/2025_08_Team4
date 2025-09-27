import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../../context/GlobalProvider';
import { useTheme } from '../../context/ThemeContext';
import { updateProfile } from '../../lib/profile';
import { REMINDER_FREQUENCIES } from '../../lib/notifications';
import { account } from '../../lib/appwrite';


const SettingItem = ({ label, sublabel, type, value, onValueChange, onPress, colors }) => {
  return (
    <Pressable onPress={onPress} style={[styles.itemContainer, { backgroundColor: colors.card }]} disabled={!onPress}>
      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemLabel, { color: colors.text }, type === 'danger' && { color: colors.danger }]}>{label}</Text>
        {sublabel && <Text style={[styles.itemSublabel, { color: colors.textSecondary }]}>{sublabel}</Text>}
      </View>
      {type === 'navigation' && <Ionicons name="chevron-forward-outline" size={22} color={colors.textSecondary} />}
      {type === 'toggle' && <Switch trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.isDarkMode ? "#f4f3f4" : "#f4f3f4"} onValueChange={onValueChange} value={value} />}
      {type === 'value' && <Text style={[styles.itemValue, { color: colors.primary }]}>{value}</Text>}
    </Pressable>
  );
};


export default function SettingsScreen() {
  const router = useRouter();
  const { profile, refresh, user } = useGlobalContext();
  const { isDarkMode, colors, toggleTheme } = useTheme();
  
  const [is2FAEnabled, set2FAEnabled] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminderSchedule, setReminderSchedule] = useState('Daily');

  // Load notification preferences from profile and user prefs
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load notification enabled from user preferences
        if (user?.prefs) {
          setPushNotifications(user.prefs.notificationsEnabled ?? true);
        }
        
        // Load reminder frequency from profile
        if (profile) {
          setReminderSchedule(REMINDER_FREQUENCIES[profile.reminderFrequency]?.label || 'Daily');
        }
      } catch (error) {
        console.log('Error loading notification preferences:', error);
        // Set defaults
        setPushNotifications(true);
        setReminderSchedule('Daily');
      }
    };

    loadPreferences();
  }, [profile, user]);

  const handleNotificationToggle = async (value) => {
    try {
      setPushNotifications(value);
      
      // Update user preferences instead of profile
      const me = await account.get();
      const prefs = {
        ...me.prefs,
        notificationsEnabled: value,
      };
      await account.updatePrefs(prefs);
      
      await refresh();
    } catch (error) {
      console.error('Error updating notification preference:', error);
      // Revert the toggle if update failed
      setPushNotifications(!value);
    }
  };
  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Account</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingItem label="Edit Profile" sublabel="Update your personal information" type="navigation" onPress={() => router.push('/(drawer)/editprofile')} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem label="Change Password" sublabel="Update your account password" type="navigation" onPress={() => router.push('/(drawer)/changepassword')} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem label="Two-Factor Authentication" sublabel="Add an extra layer of security" type="toggle" value={is2FAEnabled} onValueChange={set2FAEnabled} colors={colors} />
        </View>

        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Preferences</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingItem label="Dark Mode" sublabel="Switch between light and dark themes" type="toggle" value={isDarkMode} onValueChange={toggleTheme} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem label="Push Notifications" sublabel="Receive notifications about your goals" type="toggle" value={pushNotifications} onValueChange={handleNotificationToggle} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem label="Reminder Schedule" sublabel="Choose how often you want reminders" type="value" value={reminderSchedule} onPress={() => router.push('/(drawer)/reminderschedule')} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem label="Test Notifications" sublabel="Test notification functionality" type="navigation" onPress={() => router.push('/(drawer)/test-notifications')} colors={colors} />
        </View>

        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Danger Zone</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingItem label="Delete Account" sublabel="Permanently remove your account and data" type="danger" onPress={() => alert("Open Delete Account confirmation")} colors={colors} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16, 
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 8,
  },
  card: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemSublabel: {
    fontSize: 13,
    marginTop: 2,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
});