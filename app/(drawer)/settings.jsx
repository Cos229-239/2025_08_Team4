import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
  const router = useRouter();
  
  // State for toggles (visual only, no functionality)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTwoFactor, setIsTwoFactor] = useState(false);
  const [isPushNotifications, setIsPushNotifications] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState('daily');

  const handleBack = () => {
    router.back();
  };

  const SettingItem = ({ title, subtitle, onPress, showToggle, toggleValue, onToggleChange, showArrow = true, showFrequency = false, frequencyValue, onFrequencyChange }) => (
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
            thumbColor={toggleValue ? '#FFFFFF' : '#FFFFFF'}
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
    <View style={styles.container}>
      <LinearGradient
        colors={['#3177C9', '#4A90E2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                 <View style={styles.section}>
           <LinearGradient
             colors={['#3177C9', '#00C8C8']}
             style={styles.sectionTitleGradient}
             start={{ x: 0, y: 0 }}
             end={{ x: 0, y: 1 }}
           >
             <Text style={styles.sectionTitle}>Account</Text>
           </LinearGradient>
          <View style={styles.sectionContent}>
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

                 <View style={styles.section}>
           <LinearGradient
             colors={['#3177C9', '#00C8C8']}
             style={styles.sectionTitleGradient}
             start={{ x: 0, y: 0 }}
             end={{ x: 0, y: 1 }}
           >
             <Text style={styles.sectionTitle}>Preferences</Text>
           </LinearGradient>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Light/Dark Mode"
              subtitle="Choose your preferred theme"
              showToggle={true}
              toggleValue={isDarkMode}
              onToggleChange={setIsDarkMode}
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
               onFrequencyChange={setReminderFrequency}
             />
          </View>
        </View>

        <View style={styles.section}>
          <LinearGradient
            colors={['#E74C3C', '#C0392B']}
            style={styles.sectionTitleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.sectionTitle}>Danger Zone</Text>
          </LinearGradient>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Delete Account"
              subtitle="Permanently remove your account and data"
              onPress={() => {}}
              showArrow={false}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
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
