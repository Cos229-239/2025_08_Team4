import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isTwoFactor, setIsTwoFactor] = useState(false);
  const [isPushNotifications, setIsPushNotifications] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState('daily');

  // Dynamic colors based on dark mode
  const backgroundColor = isDarkMode ? '#002A7C' : '#FFFFFF';
  const sectionBackgroundColor = isDarkMode ? '#BABAD1' : '#FFFFFF';
  const sectionBorderColor = isDarkMode ? '#333333' : '#F0F0F0';

  const SettingItem = ({
    title,
    subtitle,
    onPress,
    showToggle,
    toggleValue,
    onToggleChange,
    showArrow = true,
    showFrequency = false,
    frequencyValue
  }) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {showToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggleChange}
            trackColor={{ false: '#E0E0E0', true: '#3177C9' }}
            thumbColor={'#FFFFFF'}
          />
        ) : showFrequency ? (
          <View style={styles.frequencyContainer}>
            <Text style={styles.frequencyText}>{frequencyValue}</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        ) : showArrow ? (
          <Text style={styles.arrow}>›</Text>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Account Section */}
      <View style={styles.section}>
        <LinearGradient
          colors={['#3177C9', '#00C8C8']}
          style={styles.sectionTitleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.sectionTitle}>Account</Text>
        </LinearGradient>
        <View style={[styles.sectionContent, { backgroundColor: sectionBackgroundColor, borderColor: sectionBorderColor }]}>
          <SettingItem
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => {}}
          />
          <SettingItem
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => {}}
          />
          <SettingItem
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of security"
            showToggle={true}
            toggleValue={isTwoFactor}
            onToggleChange={setIsTwoFactor}
          />
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <LinearGradient
          colors={['#3177C9', '#00C8C8']}
          style={styles.sectionTitleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.sectionTitle}>Preferences</Text>
        </LinearGradient>
        <View style={[styles.sectionContent, { backgroundColor: sectionBackgroundColor, borderColor: sectionBorderColor }]}>
          <SettingItem
            title="Light/Dark Mode"
            subtitle="Choose your preferred theme"
            showToggle={true}
            toggleValue={isDarkMode}
            onToggleChange={toggleDarkMode}
          />
          <SettingItem
            title="Push Notifications"
            subtitle="Receive notifications about your goals"
            showToggle={true}
            toggleValue={isPushNotifications}
            onToggleChange={setIsPushNotifications}
          />
          <SettingItem
            title="Reminder Schedule"
            subtitle="Choose how often you want reminders"
            onPress={() => {}}
            showFrequency={true}
            frequencyValue={reminderFrequency}
          />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <LinearGradient
          colors={['#E74C3C', '#C0392B']}
          style={styles.sectionTitleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.sectionTitle}>Danger Zone</Text>
        </LinearGradient>
        <View style={[styles.sectionContent, { backgroundColor: sectionBackgroundColor, borderColor: sectionBorderColor }]}>
          <SettingItem
            title="Delete Account"
            subtitle="Permanently remove your account and data"
            onPress={() => {}}
            showArrow={false}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitleGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  settingItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  arrow: {
    fontSize: 20,
    color: '#3177C9',
    fontWeight: '600',
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  frequencyText: {
    fontSize: 14,
    color: '#3177C9',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
