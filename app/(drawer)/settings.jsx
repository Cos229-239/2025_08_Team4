import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#04A777',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#212529',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  danger: '#D9534F',
};


const SettingItem = ({ label, sublabel, type, value, onValueChange, onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.itemContainer} disabled={!onPress}>
      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemLabel, type === 'danger' && styles.dangerText]}>{label}</Text>
        {sublabel && <Text style={styles.itemSublabel}>{sublabel}</Text>}
      </View>
      {type === 'navigation' && <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textSecondary} />}
      {type === 'toggle' && <Switch trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor={"#f4f3f4"} onValueChange={onValueChange} value={value} />}
      {type === 'value' && <Text style={styles.itemValue}>{value}</Text>}
    </Pressable>
  );
};


export default function SettingsScreen() {
  
  const [is2FAEnabled, set2FAEnabled] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const reminderSchedule = 'Daily';
  

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.card}>
          <SettingItem label="Edit Profile" sublabel="Update your personal information" type="navigation" onPress={() => alert("Navigate to Edit Profile")} />
          <View style={styles.divider} />
          <SettingItem label="Change Password" sublabel="Update your account password" type="navigation" onPress={() => alert("Navigate to Change Password")} />
          <View style={styles.divider} />
          <SettingItem label="Two-Factor Authentication" sublabel="Add an extra layer of security" type="toggle" value={is2FAEnabled} onValueChange={set2FAEnabled} />
        </View>

        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.card}>
          <SettingItem label="Light/Dark Mode" sublabel="Choose your preferred theme" type="toggle" value={isDarkMode} onValueChange={setDarkMode} />
          <View style={styles.divider} />
          <SettingItem label="Push Notifications" sublabel="Receive notifications about your goals" type="toggle" value={pushNotifications} onValueChange={setPushNotifications} />
          <View style={styles.divider} />
          <SettingItem label="Reminder Schedule" sublabel="Choose how often you want reminders" type="value" value={reminderSchedule} onPress={() => alert("Open Reminder Schedule options")} />
        </View>

        <Text style={styles.sectionHeader}>Danger Zone</Text>
        <View style={styles.card}>
          <SettingItem label="Delete Account" sublabel="Permanently remove your account and data" type="danger" onPress={() => alert("Open Delete Account confirmation")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16, 
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 8,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
  },
  itemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  itemSublabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginLeft: 16,
  },
  dangerText: {
    color: COLORS.danger,
  },
});