import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Dimensions, Pressable, Platform, Alert, ActivityIndicator, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold, OpenSans_400Regular } from '@expo-google-fonts/open-sans';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { listMyGoals } from '../lib/goalRepo';
import { upsertTask } from '../lib/taskRepo';
import { Picker } from '@react-native-picker/picker';
import SnowyMountain from '../components/SnowyMountain';

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

// --- Step 1: Select a Goal ---
const Step1 = ({ goals, selectedGoalId, onSelectGoal, isLoading }) => (
  <>
    <Text style={styles.label}>Which goal is this for?</Text>
    {isLoading ? (
      <ActivityIndicator size="large" color="#04A777" />
    ) : (
      <FlatList
        data={goals}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.goalSelectItem, selectedGoalId === item.$id && styles.goalSelectItem_selected]}
            onPress={() => onSelectGoal(item.$id)}
          >
            <Text style={[styles.goalSelectText, selectedGoalId === item.$id && styles.goalSelectText_selected]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    )}
  </>
);

// --- Step 2: Task Details ---
const Step2 = ({ taskName, setTaskName, dueDate, onSelectDate }) => (
    <>
      <Text style={styles.label}>Name of the task</Text>
      <TextInput style={styles.input} placeholder="e.g., Schedule initial meeting" value={taskName} onChangeText={setTaskName} />
      <Text style={styles.label}>Due Date</Text>
      <Pressable onPress={onSelectDate}>
        <View style={styles.dateInput}>
          <Text style={[styles.dateText, dueDate && {color: '#222223'}]}>{dueDate || "Select a date"}</Text>
        </View>
      </Pressable>
    </>
);


const Step3 = ({ durationHours, durationMinutes, onOpenPicker }) => {
  // Helper function to display the time nicely
  const formatDuration = () => {
    if (durationHours === 0 && durationMinutes === 0) {
      return '';
    }
    const hrString = durationHours > 0 ? `${durationHours} hr` : '';
    const minString = durationMinutes > 0 ? `${durationMinutes} min` : '';
    return `${hrString} ${minString}`.trim();
  };

  return (
    <>
      <Text style={styles.label}>Expected duration</Text>
      <Pressable onPress={onOpenPicker}>
        <View style={styles.dateInput}>
          <Text style={[styles.dateText, (durationHours > 0 || durationMinutes > 0) && { color: '#222223' }]}>
            {formatDuration() || "Select a duration"}
          </Text>
        </View>
      </Pressable>
    </>
  );
};


const Step4 = ({ priority, setPriority }) => (
    <>
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

const Step5 = ({ notes, setNotes }) => ( 
    <> 
        <Text style={styles.label}>Details</Text> 
        <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Description of this task" value={notes} onChangeText={setNotes} /> 
    </> 
);

export default function AddTaskFlowScreen() {
  const router = useRouter();
  const flatListRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [goals, setGoals] = useState([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [isDurationPickerVisible, setIsDurationPickerVisible] = useState(false);
  const [priority, setPriority] = useState(0);
  const hourItems = Array.from({ length: 25 }, (_, i) => i);
  const minuteItems = Array.from({ length: 12 }, (_, i) => i * 5);


  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const userGoals = await listMyGoals();
        setGoals(userGoals);
      } catch (error) {
        console.error("Failed to fetch goals:", error);
        Alert.alert("Error", "Could not load your goals.");
      } finally {
        setIsLoadingGoals(false);
      }
    };
    fetchGoals();
  }, []);

  const [fontsLoaded] = useFonts({ Oswald_600SemiBold, OpenSans_700Bold, OpenSans_400Regular });

   const isStepComplete = (stepIndex) => {
  switch (stepIndex) {
    case 0: 
      return selectedGoalId !== null;
    case 1: 
      return taskName.trim() !== '' && dueDate !== '';
    case 2:
      return durationHours > 0 || durationMinutes > 0;
    case 3: 
      return priority > 0;
    case 4: 
      return notes.trim() !== '';
    default:
      return false;
  }
};

  const isCurrentStepComplete = isStepComplete(currentStep);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date) => {
    setDueDate(date.toISOString().split('T')[0]);
    hideDatePicker();
  };

   const steps = [
    { id: '1', component: <Step1 goals={goals} selectedGoalId={selectedGoalId} onSelectGoal={setSelectedGoalId} isLoading={isLoadingGoals} /> },
    { id: '2', component: <Step2 taskName={taskName} setTaskName={setTaskName} dueDate={dueDate} onSelectDate={showDatePicker} /> },
    { id: '3', component: <Step3 durationHours={durationHours} durationMinutes={durationMinutes} onOpenPicker={() => setIsDurationPickerVisible(true)} /> },
    { id: '4', component: <Step4 priority={priority} setPriority={setPriority} /> },
    { id: '5', component: <Step5 notes={notes} setNotes={setNotes} /> },
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
  
   const handleAddTask = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const timeInMinutes = (durationHours * 60) + durationMinutes;
      const payload = {
        title: taskName,
        notes: notes,
        startDate: new Date().toISOString().split('T')[0], 
        dueDate: dueDate,
        priority: priority,
        estimateMinuets: timeInMinutes > 0 ? timeInMinutes : null,
        status: 'Paused',
        goalId: selectedGoalId, 
      };
      await upsertTask(payload);
      Alert.alert("Success", "Your new task has been saved!");
      router.back();
    } catch (error) {
      console.error("Failed to save task:", error);
      Alert.alert("Save Failed", error.message || "An unknown error occurred.");
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
        <Text style={styles.headerTitle}>Create a New Task</Text>
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
              onPress={handleAddTask}
              disabled={!isCurrentStepComplete || isSaving}
            >
              <Text style={styles.mainButtonText}>{isSaving ? 'Saving...' : 'Add Task'}</Text>
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
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />

      <Modal
        transparent={true}
        visible={isDurationPickerVisible}
        animationType="fade"
        onRequestClose={() => setIsDurationPickerVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsDurationPickerVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}> 
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                selectedValue={durationHours}
                onValueChange={(itemValue) => setDurationHours(itemValue)}
              >
                {hourItems.map(h => <Picker.Item key={h} label={`${h}`} value={h} />)}
              </Picker>
              <Text style={styles.pickerLabel}>Hours</Text>

              <Picker
                style={styles.picker}
                selectedValue={durationMinutes}
                onValueChange={(itemValue) => setDurationMinutes(itemValue)}
              >
                {minuteItems.map(m => <Picker.Item key={m} label={`${m}`} value={m} />)}
              </Picker>
              <Text style={styles.pickerLabel}>Minutes</Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsDurationPickerVisible(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
  goalSelectItem: {
    backgroundColor: '#F8F8F8',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EAEAEB',
    marginBottom: 10,
  },
  goalSelectItem_selected: {
    borderColor: '#04A777',
    backgroundColor: '#E6F6F1',
  },
  goalSelectText: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 16,
    color: '#222223',
  },
  goalSelectText_selected: {
    color: '#027A56',
  },

  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  durationPickerContainer: {
    flex: 1,
  },
  durationInput: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'OpenSans_400Regular',
    borderWidth: 1,
    borderColor: '#EAEAEB',
    color: '#222223',
    flex: 1,
    textAlign: 'center',
  },
  durationLabel: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 16,
    color: '#5E5E6C',
  },
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
    textAlign: 'center',
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
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#04A777',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
  },
   mountainRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 6,
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
    textAlign: 'center',
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
    textAlign: 'center',
  },
});