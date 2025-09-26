// app/addgoal-flow.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity,
  FlatList, Dimensions, Pressable, Alert, Modal, KeyboardAvoidingView,
  Platform, Keyboard
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold, OpenSans_400Regular } from '@expo-google-fonts/open-sans';
import SnowyMountain from '../components/SnowyMountain';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';

import { upsertGoal } from '../lib/goalRepo';
import { listMyProjects, createProject, PROJECT_TYPE_ENUM } from '../lib/projectRepo';

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
      <View key={index} style={[styles.progressDot, index === currentStep && styles.progressDotActive]} />
    ))}
  </View>
);

/* ---------------- Steps ---------------- */

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
    <TextInput
      style={[styles.input, styles.textArea]}
      multiline
      placeholder="This goal is important because..."
      value={why}
      onChangeText={setWhy}
    />
    <Text style={styles.label}>What will I gain?</Text>
    <TextInput
      style={[styles.input, styles.textArea]}
      multiline
      placeholder="I will gain confidence and..."
      value={gain}
      onChangeText={setGain}
    />
    <Text style={styles.label}>Success looks like...</Text>
    <TextInput
      style={[styles.input, styles.textArea]}
      multiline
      placeholder="I have run a 5K in under 30 minutes."
      value={success}
      onChangeText={setSuccess}
    />
  </>
);

// Step3: Notes + Project (RNPickerSelect) + "Create Project" modal trigger
const Step3 = ({
  notes, setNotes,
  project, setProject,
  projectItems, onCreateProject,
}) => (
  <>
    <Text style={styles.label}>Notes</Text>
    <TextInput
      style={[styles.input, styles.textArea]}
      multiline
      placeholder="Any extra notes or thoughts..."
      value={notes}
      onChangeText={setNotes}
    />

    <Text style={styles.label}>Project</Text>
    <RNPickerSelect
      value={project ?? ''}
      onValueChange={(val) => {
        if (val === '__create__') onCreateProject?.();
        else setProject(val);
      }}
      items={[
        { label: 'Not Assigned', value: 'none' },
        ...projectItems,
        { label: '➕ New Project…', value: '__create__' },
      ]}
      placeholder={{}} // show current value without placeholder row
      useNativeAndroidPickerStyle={false}
      style={pickerSelectStyles}
      Icon={() => <Text style={{ position: 'absolute', right: 0, top: 0, bottom: 0 }}>▾</Text>}
    />
  </>
);

const Step4 = ({ targetDate, onSelectDate }) => (
  <>
    <Text style={styles.label}>Target date to complete</Text>
    <Pressable onPress={onSelectDate}>
      <View style={styles.dateInput}>
        <Text style={styles.dateText}>{targetDate || 'Select a date'}</Text>
      </View>
    </Pressable>
  </>
);

// Step5: Review cadence (custom bottom sheet so it works on iOS reliably)
const CADENCE_LABELS = { DAILY: 'Daily', WEEKLY: 'Weekly', MONTHLY: 'Monthly' };
const Step5 = ({ selectedValue, onValueChange, items }) => {
  const [open, setOpen] = useState(false);
  const currentLabel =
    CADENCE_LABELS[selectedValue] ||
    (items.find(i => i.value === selectedValue)?.label ?? 'Select a review cadence…');

  return (
    <>
      <Text style={styles.label}>Review cadence</Text>

      {/* Trigger */}
      <TouchableOpacity
        style={styles.selectTrigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons name="repeat-outline" size={18} color="#6B7280" />
        <Text style={styles.selectText}>{currentLabel}</Text>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </TouchableOpacity>

      {/* Bottom sheet modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.sheetWrap}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Select cadence</Text>
                <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {items.map(opt => {
                const selected = selectedValue === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optionRow, selected && styles.optionRowActive]}
                    onPress={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                      {opt.label}
                    </Text>
                    {selected && <Ionicons name="checkmark" size={18} color="#04A777" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
};

/* ---------------- Screen ---------------- */

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

  // project picker
  const [project, setProject] = useState(''); // '' until chosen; 'none' = Not Assigned
  const [projectItems, setProjectItems] = useState([]);

  // create project modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState(
    Array.isArray(PROJECT_TYPE_ENUM) && PROJECT_TYPE_ENUM.length ? PROJECT_TYPE_ENUM[0] : 'Personal'
  );
  const typeItems = (Array.isArray(PROJECT_TYPE_ENUM) ? PROJECT_TYPE_ENUM : ['Personal']).map((t) => ({
    label: t, value: t,
  }));

  const [targetDate, setTargetDate] = useState('');
  const [reviewCadence, setReviewCadence] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [fontsLoaded] = useFonts({ Oswald_600SemiBold, OpenSans_700Bold, OpenSans_400Regular });

  // load projects once
  useEffect(() => {
    (async () => {
      try {
        const rows = await listMyProjects(1000);
        setProjectItems((rows || []).map((p) => ({
          label: p.name || '(Untitled Project)',
          value: String(p.$id),
        })));
      } catch (e) {
        console.warn('Failed to load projects', e?.message || e);
      }
    })();
  }, []);

  const openCreateProject = () => {
    setNewProjectName('');
    setNewProjectType(
      Array.isArray(PROJECT_TYPE_ENUM) && PROJECT_TYPE_ENUM.length ? PROJECT_TYPE_ENUM[0] : 'Personal'
    );
    setShowProjectModal(true);
  };

  const saveNewProject = async () => {
    const name = (newProjectName || '').trim();
    if (!name) {
      Alert.alert('Project', 'Please enter a project name.');
      return;
    }
    try {
      const created = await createProject({ name, type: newProjectType });
      const rows = await listMyProjects(1000);
      setProjectItems((rows || []).map((r) => ({
        label: r.name || '(Untitled Project)',
        value: String(r.$id),
      })));
      setProject(String(created.$id));
      setShowProjectModal(false);
    } catch (e) {
      console.error('createProject failed:', e?.message || e);
      Alert.alert('Project', e?.message || 'Could not create project');
    }
  };

  if (!fontsLoaded) {
    // keep hook order stable; show lightweight splash
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ padding: 24 }}>
          <Text>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cadenceOptions = [
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
  ];

  const isStepComplete = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return goalName.trim() !== '' && priority > 0;
      case 1:
        return (
          motivationWhy.trim() !== '' &&
          motivationGain.trim() !== '' &&
          motivationSuccess.trim() !== ''
        );
      case 2:
        // must choose something; 'none' is valid (Not Assigned)
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

  // iOS date picker: readable text + safe presentation
  const iosVersion = Platform.OS === 'ios' ? parseInt(String(Platform.Version), 10) || 0 : 0;
  const iosInlineSupported = Platform.OS === 'ios' && iosVersion >= 14;
  const dateDisplay = Platform.OS === 'ios' ? (iosInlineSupported ? 'inline' : 'spinner') : 'default';

  const showDatePicker = () => {
    Keyboard.dismiss();
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date) => {
    setTargetDate(date.toISOString().split('T')[0]);
    hideDatePicker();
  };

  const steps = [
    { id: '1', component: <Step1 priority={priority} setPriority={setPriority} goalName={goalName} setGoalName={setGoalName} /> },
    { id: '2', component: <Step2 why={motivationWhy} setWhy={setMotivationWhy} gain={motivationGain} setGain={setMotivationGain} success={motivationSuccess} setSuccess={setMotivationSuccess} /> },
    {
      id: '3',
      component: (
        <Step3
          notes={notes} setNotes={setNotes}
          project={project} setProject={setProject}
          projectItems={projectItems}
          onCreateProject={openCreateProject}
        />
      ),
    },
    { id: '4', component: <Step4 targetDate={targetDate} onSelectDate={showDatePicker} /> },
    { id: '5', component: <Step5 selectedValue={reviewCadence} onValueChange={setReviewCadence} items={cadenceOptions} /> },
  ];

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      flatListRef.current?.scrollToIndex({ index: nextStep });
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
      const selectedProjectId = project === 'none' ? null : (project || null);

      const payload = {
        title: goalName,
        priority,
        description: motivationWhy,
        why: motivationGain,
        successCriteria: motivationSuccess,
        notes,
        targetDate,
        reviewCadence,
        status: 'active', // default Active
        projectId: selectedProjectId,
        project: selectedProjectId,
      };

      await upsertGoal(payload);
      Alert.alert('Success', 'Your new goal has been saved!');
      router.push('/(tabs)/goals');
    } catch (error) {
      console.error('Failed to save goal:', error?.message || error);
      Alert.alert('Save Failed', error?.message || 'An unknown error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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

      {/* Date picker — iOS readable */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        display={dateDisplay}
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        // Force readable/light theme on iOS
        isDarkModeEnabled={false}
        pickerProps={Platform.OS === 'ios' ? { themeVariant: 'light' } : {}}
        headerTextIOS="Pick a date"
        buttonTextColorIOS="#04A777"
        // make sure the sheet/background stay bright for contrast
        pickerContainerStyleIOS={styles.iosPickerContainer}
        pickerStyleIOS={styles.iosPicker}
        contentContainerStyleIOS={styles.iosPickerContent}
        backdropStyleIOS={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        modalPropsIOS={{ presentationStyle: 'overFullScreen' }}
      />

      {/* Create Project Modal */}
      <Modal
        visible={showProjectModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProjectModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Project</Text>

            <Text style={styles.modalLabel}>Project name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a project name"
              value={newProjectName}
              onChangeText={setNewProjectName}
              autoFocus
            />

            <Text style={styles.modalLabel}>Type</Text>
            <RNPickerSelect
              value={newProjectType}
              onValueChange={setNewProjectType}
              items={typeItems}
              placeholder={{}}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
              Icon={() => <Text style={{ position: 'absolute', right: 0, top: 0, bottom: 0 }}>▾</Text>}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <TouchableOpacity style={[styles.backButton, { flex: 1 }]} onPress={() => setShowProjectModal(false)}>
                <Text style={styles.backButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mainButton, { flex: 1 }]} onPress={saveNewProject}>
                <Text style={styles.mainButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- styles ---------------- */
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
  stepContainer: { width: width, paddingHorizontal: 24, paddingTop: 20 },
  label: { fontFamily: 'Oswald_600SemiBold', fontSize: 24, color: '#222223', marginBottom: 12 },
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
  textArea: { height: 100, textAlignVertical: 'top' },
  mountainRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingVertical: 6 },
  footer: { padding: 24 },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EAEAEB' },
  progressDotActive: { backgroundColor: '#04A777' },
  buttonContainer: { flexDirection: 'row', gap: 10 },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  mainButtonDisabled: { backgroundColor: '#A9A9A9', elevation: 0 },
  mainButtonText: { color: '#FFFFFF', fontSize: 18, fontFamily: 'OpenSans_700Bold' },
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
  dateText: { fontSize: 16, fontFamily: 'OpenSans_400Regular', color: '#5E5E6C' },

  // cadence bottom sheet
  selectTrigger: {
    backgroundColor: '#F8F8F8',
    borderColor: '#EAEAEB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  selectText: {
    flex: 1,
    color: '#222223',
    fontFamily: 'OpenSans_700Bold',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  sheetWrap: { width: '100%' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: '#EAEAEB',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 18,
    color: '#222223',
    fontFamily: 'OpenSans_700Bold',
  },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  optionRowActive: { backgroundColor: '#E6F6F1', borderColor: '#D0F0E7' },
  optionText: { color: '#222223', fontFamily: 'OpenSans_700Bold' },
  optionTextActive: { color: '#222223' },

  // modal for project
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontFamily: 'Oswald_600SemiBold', fontSize: 22, color: '#222223', marginBottom: 12 },
  modalLabel: { fontFamily: 'Oswald_600SemiBold', fontSize: 16, color: '#222223', marginBottom: 8, marginTop: 6 },

  // iOS picker container styling (readable)
  iosPickerContainer: {
    backgroundColor: '#FFFFFF',
  },
  iosPickerContent: {
    backgroundColor: '#FFFFFF',
  },
  iosPicker: {
    backgroundColor: '#FFFFFF',
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
    marginBottom: 24,
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
    marginBottom: 24,
  },
  placeholder: { color: '#5E5E6C' },
  iconContainer: { top: 18, right: 14 },
});
