import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


const CheckboxItem = ({ label, isChecked, onToggle }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
      {isChecked && <Ionicons name="checkmark" size={18} color="white" />}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const OnboardingStep2 = () => {
  const router = useRouter();
  const [selectedBarriers, setSelectedBarriers] = useState([]);

  const barriers = [
    "Lack of Motivation",
    "Time Management Issues",
    "Fear of Failure",
    "Lack of Clear Goals",
    "Procrastination",
    "Self-Doubt",
    "Distractions",
    "Overwhelming",
  ];

  const handleToggleBarrier = (barrier) => {
    setSelectedBarriers(prev => 
      prev.includes(barrier)
        ? prev.filter(item => item !== barrier)
        : [...prev, barrier]
    );
  };

const handleContinue = () => {
    if (selectedBarriers.length === 0) {
      Alert.alert("Please Select", "Choose at least one option to continue.");
      return; 
    }
    

    console.log('Selected Barriers:', selectedBarriers);
    router.push('/onboarding/step3');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What's Holding You Back?</Text>
        <Text style={styles.subtitle}>Select any challenges you face in achieving your goals.</Text>

        <ScrollView style={styles.scrollContainer}>
          {barriers.map((barrier, index) => (
            <CheckboxItem
              key={index}
              label={barrier}
              isChecked={selectedBarriers.includes(barrier)}
              onToggle={() => handleToggleBarrier(barrier)}
            />
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24, 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#636366',
    textAlign: 'center',
    marginBottom: 32, 
  },
  scrollContainer: {
    flex: 1, 
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3177C9',
    borderColor: '#3177C9',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  button: {
    backgroundColor: '#3177C9',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingStep2;