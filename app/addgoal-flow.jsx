import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Dimensions, Pressable, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold, OpenSans_400Regular } from '@expo-google-fonts/open-sans';
import SnowyMountain from '../components/SnowyMountain';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import RNPickerSelect from 'react-native-picker-select';
import { upsertGoal } from '../lib/goalRepo';

const { width } = Dimensions.get('window');

function getPriorityColor(level) {
  const colors = {
    priority1: '#6FCF97', priority2: '#F2C94C', priority3: '#F2994A',
    priority4: '#EB5757', priority5: '#C22B34',
  };
  return colors[`priority${level}`] || '#E0E0E0';
}

const ProgressIndicator = ({ currentStep, totalSteps }) => (
  <View style={styles.progressContainer}>
    {Array.from({ length: totalSteps }).map((_, index) => (
      <View
        key={index}
        style={[styles.progressDot, index === currentStep && styles.progressDotActive]}
      />
    ))}
  </View>
);

const Step1 = ({ priority, setPriority, goalName, setGoalName }) => (
    <>
      <Text style={styles.label}>Name of the goal</Text>
      <TextInput 
        style={styles.input} 
        placeholder="e.g., Run a 5K" 
        value={goalName}
        onChangeText={setGoalName}
      />
      <Text style={styles.label}>Priority</Text>
      <View style={styles.mountainRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setPriority(n)}>
            <SnowyMountain
              width={40} height={40}
              mountainColor={n <= priority ? getPriorityColor(n) : '#E0E0E0'}
              snowColor={'#FFFFFF'} strokeWidth={0}
            />
          </TouchableOpacity>
        ))}
      </View>
    </>
);

const Step2 = ({ why, setWhy, gain, setGain, success, setSuccess }) => (
    <>
      <Text style={styles.label}>Why is this important?</Text>
      <TextInput style={[styles.input, styles.textArea]} multiline placeholder="This goal is important because..." value={why} onChangeText={setWhy} />
      <Text style={styles.label}>What will I gain?</Text>
      <TextInput style={[styles.input, styles.textArea]} multiline placeholder="I will gain confidence and..." value={gain} onChangeText={setGain} />
      <Text style={styles.label}>Success looks like...</Text>
      <TextInput style={[styles.input, styles.textArea]} multiline placeholder="I have run a 5K in under 30 minutes." value={success} onChangeText={setSuccess} />
    </>
);

const Step3 = ({ notes, setNotes, project, setProject }) => (
    <>
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Any extra notes or thoughts..." value={notes} onChangeText={setNotes} />
      <Text style={styles.label}>Project</Text>
      <TextInput style={styles.input} placeholder="e.g., Personal Health" value={project} onChangeText={setProject} />
    </>
);

const Step4 = ({ targetDate, onSelectDate }) => (
    <>
      <Text style={styles.label}>Target date to complete</Text>
      <Pressable onPress={onSelectDate}>
        <View style={styles.dateInput}>
          <Text style={styles.dateText}>{targetDate || "Select a date"}</Text>
        </View>
      </Pressable>
    </>
);

const Step5 = ({ selectedValue, onValueChange, items }) => (
  <>
    <Text style={styles.label}>Review cadence</Text>
    <RNPickerSelect
        onValueChange={onValueChange}
        items={items}
        style={pickerSelectStyles}
        placeholder={{ label: "Select a review cadence...", value: null }}
        value={selectedValue}
        useNativeAndroidPickerStyle={false}
    />
  </>
);

export default function AddGoalFlowScreen() {
  const router = useRouter();
  const flatListRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [goalName, setGoalName] = useState('');
  const [priority, setPriority] = useState(0);
  const [motivationWhy, setMotivationWhy] = useState('');
  const [motivationGain, setMotivationGain] = useState('');
  const [motivationSuccess, setMotivationSuccess] = useState('');
  const [notes, setNotes] = useState('');
  const [project, setProject] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [reviewCadence, setReviewCadence] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  
  const cadenceOptions = [
      { label: 'Daily', value: 'DAILY' },
      { label: 'Weekly', value: 'WEEKLY' },
      { label: 'Monthly', value: 'MONTHLY' },
  ];

  const [fontsLoaded] = useFonts({ Oswald_600SemiBold, OpenSans_700Bold, OpenSans_400Regular });

  const isStepComplete = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return goalName.trim() !== '' && priority > 0;
      case 1:
        return motivationWhy.trim() !== '' && motivationGain.trim() !== '' && motivationSuccess.trim() !== '';
      case 2:
        return project.trim() !== '';
      case 3:
        return targetDate !== '';
      case 4:
        return reviewCadence !== null;
      default:
        return false;
    }
  };
  const isCurrentStepComplete = isStepComplete(currentStep);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date) => {
    setTargetDate(date.toISOString().split('T')[0]);
    hideDatePicker();
  };

  const steps = [
    { id: '1', component: <Step1 priority={priority} setPriority={setPriority} goalName={goalName} setGoalName={setGoalName} /> },
    { id: '2', component: <Step2 why={motivationWhy} setWhy={setMotivationWhy} gain={motivationGain} setGain={setMotivationGain} success={motivationSuccess} setSuccess={setMotivationSuccess} /> },
    { id: '3', component: <Step3 notes={notes} setNotes={setNotes} project={project} setProject={setProject} /> },
    { id: '4', component: <Step4 targetDate={targetDate} onSelectDate={showDatePicker} /> },
    { id: '5', component: <Step5 selectedValue={reviewCadence} onValueChange={setReviewCadence} items={cadenceOptions} /> },
  ];

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      flatListRef.current.scrollToIndex({ index: nextStep });
      setCurrentStep(nextStep);
    }
  };

  const handleGoBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      flatListRef.current?.scrollToIndex({ index: prevStep, animated: true });
      setCurrentStep(prevStep);
    }
  };
  
  const handleAddGoal = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const payload = {
        title: goalName,
        priority: priority,
        description: motivationWhy,
        why: motivationGain,
        successCriteria: motivationSuccess,
        notes: notes,
        project: project,
        targetDate: targetDate,
        reviewCadence: reviewCadence,
        status: 'paused',
      };

      await upsertGoal(payload);

      Alert.alert("Success", "Your new goal has been saved!");
      router.push('/(tabs)/goals');

    } catch (error) {
      console.error("Failed to save goal:", error);
      Alert.alert("Save Failed", error.message || "An unknown error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerBackText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create a New Goal</Text>
        <View style={{ width: 55 }} /> 
      </View>

      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={({ item }) => <View style={styles.stepContainer}>{item.component}</View>}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      />

      <View style={styles.footer}>
        <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} />
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          {currentStep === steps.length - 1 ? (
            <TouchableOpacity 
              style={[styles.mainButton, (!isCurrentStepComplete || isSaving) && styles.mainButtonDisabled]} 
              onPress={handleAddGoal}
              disabled={!isCurrentStepComplete || isSaving}
            >
              <Text style={styles.mainButtonText}>{isSaving ? 'Saving...' : 'Add Goal'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.mainButton, !isCurrentStepComplete && styles.mainButtonDisabled]} 
              onPress={goToNextStep}
              disabled={!isCurrentStepComplete}
            >
              <Text style={styles.mainButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible} mode="date"
        onConfirm={handleConfirmDate} onCancel={hideDatePicker}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 32,
    color: '#222223',
    flex: 1,
    textAlign: 'center',
  },
  headerBackText: {
    color: '#04A777',
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    width: 55,
  },
  stepContainer: { 
      width: width, 
      paddingHorizontal: 24, 
      paddingTop: 20 
  },
  label: { 
      fontFamily: 'Oswald_600SemiBold', 
      fontSize: 24, 
      color: '#222223', 
      marginBottom: 12 
  },
  input: { 
      backgroundColor: '#F8F8F8', 
      paddingHorizontal: 20, 
      paddingVertical: 16, 
      borderRadius: 12, 
      fontSize: 16, 
      fontFamily: 'OpenSans_400Regular', 
      marginBottom: 24, 
      borderWidth: 1, 
      borderColor: '#EAEAEB', 
      color: '#222223'
  },
  textArea: { 
      height: 100, 
      textAlignVertical: 'top' 
  },
  mountainRow: { 
      flexDirection: 'row', 
      justifyContent: 'center', 
      gap: 12, 
      paddingVertical: 6 
  },
  footer: { 
      padding: 24 
  },
  progressContainer: { 
      flexDirection: 'row', 
      justifyContent: 'center', 
      gap: 8, 
      marginBottom: 20 
  },
  progressDot: { 
      width: 10, 
      height: 10, 
      borderRadius: 5, 
      backgroundColor: '#EAEAEB' 
  },
  progressDotActive: { 
      backgroundColor: '#04A777' 
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    backgroundColor: '#EAEAEB',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    width: '30%',
  },
  backButtonText: {
    color: '#5E5E6C',
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
  },
  mainButton: { 
      backgroundColor: '#04A777', 
      paddingVertical: 18, 
      borderRadius: 16, 
      alignItems: 'center',
      flex: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
  },
  mainButtonDisabled: {
    backgroundColor: '#A9A9A9',
    elevation: 0,
  },
  mainButtonText: { 
      color: '#FFFFFF', 
      fontSize: 18, 
      fontFamily: 'OpenSans_700Bold' 
  },
  dateInput: { 
      backgroundColor: '#F8F8F8', 
      paddingHorizontal: 20, 
      paddingVertical: 16, 
      borderRadius: 12, 
      borderWidth: 1, 
      borderColor: '#EAEAEB', 
      height: 54, 
      justifyContent: 'center' 
  },
  dateText: { 
      fontSize: 16, 
      fontFamily: 'OpenSans_400Regular', 
      color: '#5E5E6C' 
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    fontFamily: 'OpenSans_400Regular',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#EAEAEB',
    borderRadius: 12,
    color: '#222223',
    backgroundColor: '#F8F8F8',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    fontFamily: 'OpenSans_400Regular',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#EAEAEB',
    borderRadius: 12,
    color: '#222223',
    backgroundColor: '#F8F8F8',
    paddingRight: 30,
  },
  placeholder: {
    color: '#5E5E6C',
  },
  iconContainer: {
    top: 20,
    right: 15,
  },
});