import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Pressable, ScrollView } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { getTask, upsertTask } from '../lib/taskRepo';
import SnowyMountain from '../components/SnowyMountain';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import Svg, { Path } from 'react-native-svg';


const colors = {
    background: '#F2F2F2',
    cardBackground: '#FFFFFF',
    textPrimary: '#333333',
    textSecondary: '#828282',
    primaryBlue: '#2F80ED',
    accent: '#27AE60',
    priority1: '#6FCF97',
    priority2: '#F2C94C',
    priority3: '#F2994A',
    priority4: '#EB5757',
    priority5: '#C22B34',
};


const toISODate = (d) => d?.toISOString()?.split('T')[0];
const parseISODate = (s) => (s ? new Date(s) : new Date());


const BackArrowIcon = ({ color, size }) => ( <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Svg> );
const EditIcon = ({ color, size }) => ( <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Svg> );
function getPriorityColor(level) {
    switch (level) {
        case 1: return colors.priority1;
        case 2: return colors.priority2;
        case 3: return colors.priority3;
        case 4: return colors.priority4;
        case 5: return colors.priority5;
        default: return '#E0E0E0';
    }
}


const Field = ({ label, value, onChangeText, placeholder, multiline = false }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.formLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#BDBDBD"
      multiline={multiline}
    />
  </View>
);

export default function ViewTaskScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { taskId, initialTask } = route.params;

    const [mode, setMode] = useState('view');
    const [task, setTask] = useState(initialTask);
    const [form, setForm] = useState(initialTask);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isDurationPickerVisible, setIsDurationPickerVisible] = useState(false);
    
    const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    useFocusEffect(
      useCallback(() => {
        async function loadTask() {
          if (!taskId) return;
          try {
            const fetchedTask = await getTask(taskId);
            const hours = fetchedTask.estimateMinutes ? Math.floor(fetchedTask.estimateMinutes / 60) : 0;
            const minutes = fetchedTask.estimateMinutes ? fetchedTask.estimateMinutes % 60 : 0;
            const formData = { ...fetchedTask, durationHours: hours, durationMinutes: minutes };
            setTask(formData);
            setForm(formData);
          } catch (e) {
            Alert.alert("Error", "Could not load task details.");
          } finally {
            setLoading(false);
          }
        }
        loadTask();
      }, [taskId])
    );

    const handleSave = async () => {
        setSaving(true);
        try {
            const timeInMinutes = (form.durationHours * 60) + form.durationMinutes;
            const payload = {
                ...form,
                estimateMinutes: timeInMinutes > 0 ? timeInMinutes : null,
                dueDate: form.dueDate ? toISODate(parseISODate(form.dueDate)) : null, 
            };
            const updatedTask = await upsertTask(payload);
            setTask(updatedTask);
            setForm(updatedTask);
            setMode('view');
        } catch (err) {
            Alert.alert("Save Failed", err.message);
        } finally {
            setSaving(false);
        }
    };
    
    const handleCancel = () => {
        setForm(task);
        setMode('view');
    };

    useLayoutEffect(() => {
        navigation.setOptions({
          headerShown: false, 
        });
    }, [navigation]);


    if (loading) return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );

    const currentData = mode === 'view' ? task : form;

    return (
        <ScrollView style={styles.screen}>
            <View style={styles.headerBubble}>
                <TouchableOpacity onPress={mode === 'edit' ? handleCancel : () => navigation.goBack()} style={styles.headerIconContainer}>
                    <BackArrowIcon color={colors.textPrimary} size={24}/>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{mode === 'edit' ? 'Edit Task' : 'Task Details'}</Text>
                <TouchableOpacity onPress={mode === 'edit' ? handleSave : () => setMode('edit')} style={styles.headerIconContainer} disabled={saving}>
    {mode === 'edit' ? (
        <Text style={[styles.headerButtonText, { color: colors.primaryBlue, fontWeight: 'bold' }]}>
            {saving ? 'Saving...' : 'Save'}
        </Text>
    ) : (
        <EditIcon color={colors.primaryBlue} size={24}/>
    )}
</TouchableOpacity>
            </View>

            <View style={styles.container}>
                {/* View Mode */}
                {mode === 'view' && (
                    <View style={styles.card}>
                        <View style={styles.cardSection}><Text style={styles.viewLabel}>Task</Text><Text style={styles.taskTitleHeader}>{currentData?.title}</Text></View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}><Text style={styles.viewLabel}>Due Date</Text><Text style={styles.value}>{currentData?.dueDate ? currentData.dueDate.split('T')[0] : 'Not set'}</Text></View>
                            <View style={styles.detailItem}><Text style={styles.viewLabel}>Duration</Text><Text style={styles.value}>{currentData?.estimateMinutes ? `${Math.floor(currentData.estimateMinutes / 60)} hr ${currentData.estimateMinutes % 60} min` : 'Not set'}</Text></View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.cardSection}>
                            <Text style={styles.viewLabel}>Priority</Text>
                            <View style={styles.mountainRow}>
                                {[1, 2, 3, 4, 5].map(n => <SnowyMountain key={n} width={32} height={32} mountainColor={n <= currentData?.priority ? getPriorityColor(n) : '#E0E0E0'} snowColor={'#FFFFFF'} strokeWidth={0}/>)}
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.cardSection}><Text style={styles.viewLabel}>Details</Text><Text style={styles.value}>{currentData?.notes || 'No notes added.'}</Text></View>
                    </View>
                )}

                {/* Edit Mode */}
                {mode === 'edit' && (
                    <View style={styles.card}>
                        <Field label="Task Name" value={form.title} onChangeText={t => setField('title', t)} />
                        
                        <View style={styles.fieldContainer}>
                            <Text style={styles.formLabel}>Due Date</Text>
                            <TouchableOpacity style={styles.input} onPress={() => setDatePickerVisibility(true)}>
                                <Text style={{fontSize: 16, color: colors.textPrimary}}>{form.dueDate ? form.dueDate.split('T')[0] : 'Select Date'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.formLabel}>Expected Duration</Text>
                            <Pressable onPress={() => setIsDurationPickerVisible(true)}>
                                <View style={styles.input}>
                                    <Text style={{fontSize: 16, color: colors.textPrimary}}>
                                        {`${form.durationHours || 0} hr ${form.durationMinutes || 0} min`}
                                    </Text>
                                </View>
                            </Pressable>
                        </View>
                        
                        <View style={styles.fieldContainer}>
                            <Text style={styles.formLabel}>Priority</Text>
                            <View style={styles.mountainRow}>
                                {[1, 2, 3, 4, 5].map(n => <TouchableOpacity key={n} onPress={() => setField('priority', n)}><SnowyMountain width={40} height={40} mountainColor={n <= form.priority ? getPriorityColor(n) : '#E0E0E0'} snowColor={'#FFFFFF'} strokeWidth={0}/></TouchableOpacity>)}
                            </View>
                        </View>
                        
                        <Field label="Details" value={form.notes} onChangeText={t => setField('notes', t)} multiline />
                    </View>
                )}
            </View>

            <DateTimePickerModal isVisible={isDatePickerVisible} mode="date" date={parseISODate(form.dueDate)} onConfirm={d => { setDatePickerVisibility(false); setField('dueDate', toISODate(d)); }} onCancel={() => setDatePickerVisibility(false)} />
            
            <Modal transparent={true} visible={isDurationPickerVisible} animationType="fade" onRequestClose={() => setIsDurationPickerVisible(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setIsDurationPickerVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <View style={styles.pickerContainer}>
                            <Picker style={styles.picker} selectedValue={form.durationHours} onValueChange={v => setField('durationHours', v)}>
                                {Array.from({ length: 25 }, (_, i) => i).map(h => <Picker.Item key={h} label={`${h}`} value={h} />)}
                            </Picker>
                            <Text style={styles.pickerLabel}>Hours</Text>
                            <Picker style={styles.picker} selectedValue={form.durationMinutes} onValueChange={v => setField('durationMinutes', v)}>
                                {Array.from({ length: 12 }, (_, i) => i * 5).map(m => <Picker.Item key={m} label={`${m}`} value={m} />)}
                            </Picker>
                            <Text style={styles.pickerLabel}>Minutes</Text>
                        </View>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setIsDurationPickerVisible(false)}><Text style={styles.modalButtonText}>Done</Text></TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  container: { 
    padding: 20 
  },
  card: { 
    backgroundColor: colors.cardBackground, 
    borderRadius: 24, 
    padding: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 15, 
    elevation: 5, 
    marginBottom: 20, 
  },
  cardSection: { 
    paddingVertical: 10 
  },
  taskTitleHeader: {
    fontFamily: 'Pacifico-Regular', 
    fontSize: 28, 
    color: colors.textPrimary,
    marginBottom: 8,
  },
  viewLabel: { 
    fontFamily: 'OpenSans-SemiBold', 
    fontSize: 14, 
    color: colors.accent, 
    marginBottom: 10, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    opacity: 0.8 
  },
  value: { 
    fontFamily: 'OpenSans-Regular', 
    fontSize: 16, 
    color: colors.textPrimary, 
    lineHeight: 24 
  },
  mountainRow: { 
    flexDirection: 'row', 
    gap: 8 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F2F2F2', 
    marginVertical: 10, 
  },
  detailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 14 
  },
  detailItem: { 
    flex: 1 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorText: { 
    fontSize: 16, 
    color: "#b91c1c", 
    textAlign: 'center', 
    padding: 20 
  },
  headerButtonText: {
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
  },
  
  
  headerBubble: {
    marginHorizontal: 16,
    marginTop: 48,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Pacifico-Regular',
    fontSize: 24, 
    color: colors.textPrimary,
    marginHorizontal: 12,
  },
  headerIconContainer: { padding: 4 },

  
  fieldContainer: { 
    marginBottom: 20 
  },
  formLabel: { 
    fontSize: 14, 
    color: '#4F4F4F', 
    marginBottom: 8, 
    fontWeight: '600', 
    fontFamily: 'OpenSans-SemiBold' 
  },
  input: { 
    backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: "#e5e7eb", 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 16, 
    fontFamily: 'OpenSans-Regular', 
    color: colors.textPrimary,
    justifyContent: 'center',
    minHeight: 54,
  },
  inputMultiline: { 
    minHeight: 96, 
    textAlignVertical: "top" 
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
    fontFamily: 'OpenSans-SemiBold', 
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: colors.primaryBlue, 
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold', 
  },
});