import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { getOrCreateProfile, updateProfile } from '../../lib/profile';

export default function OnboardingStep3() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [timeSpentOpen, setTimeSpentOpen] = useState(false);
  const [timeSpentValue, setTimeSpentValue] = useState(null);
  const [timeSpentItems, setTimeSpentItems] = useState([
    { label: 'Less than 1 hour', value: 'lt1' },
    { label: '1-5 hours', value: '1-5' },
    { label: '5-10 hours', value: '5-10' },
    { label: '10+ hours', value: '10+' },
  ]);

  const [timeGoalOpen, setTimeGoalOpen] = useState(false);
  const [timeGoalValue, setTimeGoalValue] = useState(null);
  const [timeGoalItems, setTimeGoalItems] = useState([
    { label: '1-5 hours', value: '1-5' },
    { label: '5-10 hours', value: '5-10' },
    { label: '10-20 hours', value: '10-20' },
    { label: '20+ hours', value: '20+' },
  ]);

  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderValue, setReminderValue] = useState(null);
  const [reminderItems, setReminderItems] = useState([
    { label: 'Daily', value: 'daily' },
    { label: 'Every few days', value: 'fewDays' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ]);

  const handleContinue = async () => {
    if (!timeSpentValue || !timeGoalValue || !reminderValue) {
      Alert.alert('Incomplete', 'Please answer all questions to continue.');
      return;
    }
    try {
      setSaving(true);
      await getOrCreateProfile();
      await updateProfile({
        timeSpentMonthly: timeSpentValue,
        timeGoalMonthly: timeGoalValue,
        reminderFrequency: reminderValue,
      });

      router.push('/onboarding/step4');
    } catch (e) {
      Alert.alert('Error', e?.message ?? 'Failed to save your preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Goal Habits</Text>
        <Text style={styles.subtitle}>Let's understand your current routine.</Text>

        <View style={{ zIndex: 3000 }}>
          <Text style={styles.label}>How much time do you currently spend on your goals per month?</Text>
          <DropDownPicker
            open={timeSpentOpen}
            value={timeSpentValue}
            items={timeSpentItems}
            setOpen={setTimeSpentOpen}
            setValue={setTimeSpentValue}
            setItems={setTimeSpentItems}
            onOpen={() => { setTimeGoalOpen(false); setReminderOpen(false); }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholder="Select an option"
          />
        </View>

        <View style={{ zIndex: 2000 }}>
          <Text style={styles.label}>How much time would you like to spend?</Text>
          <DropDownPicker
            open={timeGoalOpen}
            value={timeGoalValue}
            items={timeGoalItems}
            setOpen={setTimeGoalOpen}
            setValue={setTimeGoalValue}
            setItems={setTimeGoalItems}
            onOpen={() => { setTimeSpentOpen(false); setReminderOpen(false); }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholder="Select an option"
          />
        </View>

        <View style={{ zIndex: 1000 }}>
          <Text style={styles.label}>How often do you want to be reminded?</Text>
          <DropDownPicker
            open={reminderOpen}
            value={reminderValue}
            items={reminderItems}
            setOpen={setReminderOpen}
            setValue={setReminderValue}
            setItems={setReminderItems}
            onOpen={() => { setTimeSpentOpen(false); setTimeGoalOpen(false); }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholder="Select an option"
          />
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[styles.button, saving && { opacity: 0.6 }]}
          onPress={handleContinue}
          disabled={saving}
        >
          <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#636366', textAlign: 'center', marginBottom: 48 },
  label: { fontSize: 16, color: '#1C1C1E', marginBottom: 8 },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
    height: 58,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
  },
  button: {
    backgroundColor: '#3177C9',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
