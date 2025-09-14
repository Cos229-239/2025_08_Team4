import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import Svg, { Path } from 'react-native-svg';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { upsertGoal, getGoal } from '../lib/goalRepo'; // Added getGoal
import SnowyMountain from '../components/SnowyMountain';

// Helper functions for dates
const toISODate = (d) => d?.toISOString()?.split('T')[0];
const parseISODate = (s) => (s ? new Date(s) : new Date());

// Helper function to determine mountain color
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

// Icons for the custom header
const BackArrowIcon = ({ color, size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);
const EditIcon = ({ color, size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Reusable Field component for the edit form
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

export default function ViewGoalScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { goalId, initialGoal } = route.params;

  const [mode, setMode] = useState('view');
  const [goal, setGoal] = useState(initialGoal);
  const [form, setForm] = useState(initialGoal);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [saving, setSaving] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewValue, setReviewValue] = useState(initialGoal?.reviewCadence);
  const [reviewItems, setReviewItems] = useState([
    { label: "Daily", value: "DAILY" }, { label: "Weekly", value: "WEEKLY" }, { label: "Monthly", value: "MONTHLY" },
  ]);

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedGoal = await upsertGoal({ ...form, reviewCadence: reviewValue });
      setForm(updatedGoal);
      setMode('view');
    } catch (err) {
      Alert.alert("Save failed", err.message || "Could not save the goal.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(goal);
    setReviewValue(goal?.reviewCadence);
    setMode('view');
  };

  // Fetch the goal data using the ID
  useEffect(() => {
    async function loadGoal() {
      if (!goalId) {
        setLoading(false);
        return;
      }
      try {
        const fetchedGoal = await getGoal(goalId);
        setGoal(fetchedGoal);
        setForm(fetchedGoal);
        setReviewValue(fetchedGoal.reviewCadence);
        setLoading(false);
      } catch (e) {
        setError("Goal not found.");
        setLoading(false);
      }
    }
    loadGoal();
  }, [goalId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: mode === 'edit',
      title: 'Edit Goal',
      headerLeft: mode === 'edit' ? () => (
        <TouchableOpacity onPress={handleCancel} style={{ marginLeft: 16 }}>
            <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
      ) : () => null,
      headerRight: () => (
        mode === 'edit' ? (
            <View style={{ marginRight: 16 }}>
              <TouchableOpacity onPress={handleSave} disabled={saving}>
                <Text style={[styles.headerButtonText, { color: colors.primaryBlue, fontWeight: 'bold' }]}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
        ) : null
      ),
    });
  }, [navigation, mode, form, saving]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.headerBubble}>
        <View style={styles.cardHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconContainer}>
            <BackArrowIcon color={colors.textPrimary} size={24}/>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{goal?.title}</Text>
          <TouchableOpacity onPress={() => setMode('edit')} style={styles.headerIconContainer}>
            <EditIcon color={colors.primaryBlue} size={24}/>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.segmentedControlContainer}>
    <TouchableOpacity
        style={[styles.customSegmentButton, selectedIndex === 0 && styles.customSegmentButtonActive]}
        onPress={() => setSelectedIndex(0)}
    >
        <Text style={[styles.customSegmentText, selectedIndex === 0 && styles.customSegmentTextActive]}>Goal</Text>
    </TouchableOpacity>
    <TouchableOpacity
        style={[styles.customSegmentButton, selectedIndex === 1 && styles.customSegmentButtonActive]}
        onPress={() => setSelectedIndex(1)}
    >
        <Text style={[styles.customSegmentText, selectedIndex === 1 && styles.customSegmentTextActive]}>Tasks</Text>
    </TouchableOpacity>
</View>

      <View style={styles.container}>
        {selectedIndex === 0 ? (
          <>
            {mode === 'view' ? (
              <View style={styles.card}>
                <View style={styles.divider} />
                {typeof goal?.priority === 'number' && (
                  <View>
                    <View style={styles.cardSection}>
                      <Text style={styles.viewLabel}>Priority</Text>
                      <View style={styles.mountainRow}>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <SnowyMountain key={n} width={32} height={32} mountainColor={n <= goal.priority ? getPriorityColor(n) : '#E0E0E0'} snowColor={'#FFFFFF'} strokeWidth={0}/>
                        ))}
                      </View>
                    </View>
                    <View style={styles.divider} />
                  </View>
                )}
                <View style={styles.cardSection}><Text style={styles.viewLabel}>Why is this important?</Text><Text style={styles.value}>{goal?.description || 'Not specified'}</Text></View>
                <View style={styles.cardSection}><Text style={styles.viewLabel}>What will I gain?</Text><Text style={styles.value}>{goal?.why || 'Not specified'}</Text></View>
                <View style={styles.cardSection}><Text style={styles.viewLabel}>Success looks like...</Text><Text style={styles.value}>{goal?.successCriteria || 'Not specified'}</Text></View>
                <View style={styles.divider} />
                <View style={styles.cardSection}><Text style={styles.viewLabel}>Notes</Text><Text style={styles.value}>{goal?.notes || 'Not specified'}</Text></View>
                <View style={styles.cardSection}><Text style={styles.viewLabel}>Project</Text><Text style={styles.value}>{goal?.project || 'Not specified'}</Text></View>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}><Text style={styles.viewLabel}>Target Date</Text><Text style={styles.value}>{goal?.targetDate?.split('T')[0]}</Text></View>
                  <View style={styles.detailItem}><Text style={styles.viewLabel}>Review Cadence</Text><Text style={styles.value}>{goal?.reviewCadence || 'Not specified'}</Text></View>
                </View>
              </View>
            ) : (
              <View style={styles.detailsBubble}>
                <Field label="Title *" value={form?.title} onChangeText={(t) => setField('title', t)} placeholder="Short title"/>
                <Field label="Why is this important?" value={form?.description} onChangeText={(t) => setField('description', t)} placeholder="When I accomplish this, I will..." multiline/>
                <Field label="What will you gain?" value={form?.why} onChangeText={(t) => setField('why', t)} placeholder="I will gain..." multiline/>
                <Field label="Notes" value={form?.notes} onChangeText={(t) => setField('notes', t)} placeholder="Don't forget to..." multiline/>
                <Field label="I can mark this completed when *" value={form?.successCriteria} onChangeText={(t) => setField('successCriteria', t)} placeholder="e.g., I have done A, B, and C" multiline/>
                <View style={styles.fieldContainer}>
                  <Text style={styles.formLabel}>Priority</Text>
                  <View style={styles.mountainRow}>{[1, 2, 3, 4, 5].map((n) => (<TouchableOpacity key={n} onPress={() => setField('priority', n)}><SnowyMountain width={40} height={40} mountainColor={n <= form?.priority ? getPriorityColor(n) : '#E0E0E0'} snowColor={'#FFFFFF'} strokeWidth={0}/></TouchableOpacity>))}</View>
                </View>
                <View style={styles.fieldContainer}>
                  <Text style={styles.formLabel}>Target Date *</Text>
                  <TouchableOpacity style={styles.input} onPress={() => setDatePickerOpen(true)}><Text style={{fontSize: 16, color: colors.textPrimary}}>{form?.targetDate?.split('T')[0]}</Text></TouchableOpacity>
                </View>
                <DateTimePickerModal isVisible={datePickerOpen} mode="date" date={parseISODate(form?.targetDate)} onConfirm={(d) => { setDatePickerOpen(false); setField("targetDate", toISODate(d)); }} onCancel={() => setDatePickerOpen(false)}/>
                <View style={[styles.fieldContainer, { zIndex: 1000 }]}>
                  <Text style={styles.formLabel}>Review Cadence *</Text>
                  <DropDownPicker open={reviewOpen} value={reviewValue} items={reviewItems} setOpen={setReviewOpen} setValue={setReviewValue} setItems={setReviewItems} placeholder="Select cadence..." style={styles.dropdown} dropDownContainerStyle={styles.dropdownContainer} listMode="SCROLLVIEW"/>
                </View>
                <Field label="Project" value={form?.project} onChangeText={(t) => setField('project', t)} placeholder="Project name or relation label"/>
              </View>
            )}
          </>
        ) : (
          <View style={styles.tasksContainer}>
            <Text style={styles.emptyText}>Tasks will be displayed here.</Text>
            <Text style={styles.emptySubtext}>You can add a new component for tasks here.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
 container: { 
    paddingTop: 10, 
    paddingBottom: 40, 
    paddingHorizontal: 20 
},
  card: { backgroundColor: colors.cardBackground, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5, },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: 'Pacifico-Regular', fontSize: 30, color: colors.textPrimary, marginHorizontal: 12, },
  headerIconContainer: { padding: 4, },
  headerButtonText: { color: colors.textSecondary, fontFamily: 'OpenSans-SemiBold', fontSize: 16 },
  cardSection: { paddingVertical: 10 },
  viewLabel: { fontFamily: 'OpenSans-SemiBold', fontSize: 14, color: colors.accent, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.8 },
  value: { fontFamily: 'OpenSans-Regular', fontSize: 16, color: colors.textPrimary, lineHeight: 24 },
  mountainRow: { flexDirection: 'row', gap: 8 },
  divider: { height: 1, backgroundColor: '#F2F2F2', marginVertical: 10, },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  detailItem: { flex: 1 },
  fieldContainer: { marginBottom: 20 },
  formLabel: { fontSize: 14, color: '#4F4F4F', marginBottom: 8, fontWeight: '600', fontFamily: 'OpenSans-SemiBold' },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 16, fontFamily: 'OpenSans-Regular', color: colors.textPrimary, justifyContent: 'center' },
  inputMultiline: { minHeight: 96, textAlignVertical: "top" },
  dropdown: { borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#fff" },
  dropdownContainer: { borderColor: "#e5e7eb", borderRadius: 12 },
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
segmentedControlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 25,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
},
customSegmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
},
customSegmentButtonActive: {
    backgroundColor: colors.primaryBlue,
},
customSegmentText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 16,
},
customSegmentTextActive: {
    color: '#FFFFFF',
},
cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
},
headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Pacifico-Regular',
    fontSize: 24, 
    color: colors.textPrimary,
    marginHorizontal: 12,
},

detailsBubble: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
},
  tasksContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontFamily: 'Oswald-Bold', fontSize: 24, color: colors.textPrimary, textAlign: "center" },
  emptySubtext: { fontFamily: 'OpenSans-Regular', fontSize: 16, color: colors.textSecondary, marginTop: 8, textAlign: "center" },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: "#b91c1c", textAlign: 'center', padding: 20 }
});