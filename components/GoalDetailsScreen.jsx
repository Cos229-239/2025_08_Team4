// components/GoalDetailsScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { fetchMyProfile } from "../lib/profile";
import SnowyMountain from "../components/SnowyMountain";

/* ---------- helpers outside component ---------- */


function clampInt(n, min, max) {
  const v = Math.round(Number.isFinite(n) ? n : 0);
  return Math.max(min, Math.min(max, v));
}
function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseISODate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return null;
  const [y, m, d] = s.split("-").map((x) => parseInt(x, 10));
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

/* ---------- small UI atoms ---------- */
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  multiline = false,
  keyboardType = "default",
  errorText,
}) {
  return (
    <View style={styles.block}>
      <Label text={label} />
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          !editable && styles.inputDisabled,
          errorText && styles.inputError,
        ]}
        editable={editable}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        keyboardType={keyboardType}
      />
      {errorText ? <ErrorText text={errorText} /> : null}
    </View>
  );
}
const Label = ({ text }) => <Text style={styles.label}>{text}</Text>;
const ErrorText = ({ text }) => <Text style={styles.error}>{text}</Text>;
const Step = ({ disabled, onPress, text }) => (
  <TouchableOpacity
    disabled={disabled}
    onPress={onPress}
    style={[styles.stepperBtn, disabled && styles.disabledBtn]}
  >
    <Text style={styles.stepperText}>{text}</Text>
  </TouchableOpacity>
);

/* ---------- main ---------- */
export default function GoalDetailsScreen({
  initialGoal = {},
  onSave = async () => {},
}) {
  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // --- dropdown state (INSIDE the component) ---
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewItems, setReviewItems] = useState([
    { label: "Daily", value: "DAILY" },
    { label: "Weekly", value: "WEEKLY" },
    { label: "Monthly", value: "MONTHLY" },
  ]);
  const [reviewValue, setReviewValue] = useState(null);

  const [form, setForm] = useState({
    $id: "",
    title: "",
    description: "",
    why: "",
    notes: "",
    successCriteria: "",
    priority: 0,
    targetDate: "",
    timeBudgetMin: "",
    status: "not_started",
    reviewCadence: "",
    project: "",
    ownerId: "",
    projectId: "",
    $createdAt: "",
    $updatedAt: "",
  });

  // hydrate from initialGoal
  useEffect(() => {
    const g = initialGoal || {};
    const next = {
      $id: g.$id ?? "",
      title: g.title ?? "",
      description: g.description ?? "",
      why: g.why ?? "",
      notes: g.notes ?? "",
      successCriteria: g.successCriteria ?? "",
      priority: typeof g.priority === "number" ? clampInt(g.priority, 0, 5) : 0,
      targetDate: g.targetDate ?? "",
      timeBudgetMin:
        g.timeBudgetMin === 0 || g.timeBudgetMin
          ? String(g.timeBudgetMin)
          : "",
      status: g.status ?? "not_started",
      reviewCadence: g.reviewCadence ?? "",
      project: g.project ?? "",
      ownerId: g.ownerId ?? "",
      projectId: g.projectId ?? "",
      $createdAt: g.$createdAt ?? "",
      $updatedAt: g.$updatedAt ?? "",
    };
    setForm(next);
    setReviewValue(next.reviewCadence || null); // keep dropdown in sync
    setMode(g.$id ? "view" : "edit");
    setErrors({});
  }, [initialGoal?.$id]);

  // derive ownerId from profile if missing on the doc
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const prof = await fetchMyProfile();
        if (on && prof?.ownerId && !initialGoal?.ownerId) {
          setForm((f) => ({ ...f, ownerId: prof.ownerId }));
        }
      } catch {}
    })();
    return () => { on = false; };
  }, [initialGoal?.$id]);

  // keep form.reviewCadence in sync with dropdown value
  useEffect(() => {
    if (reviewValue !== form.reviewCadence) {
      setForm((f) => ({ ...f, reviewCadence: reviewValue || "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewValue]);

  const statusOptions = ["not_started", "active", "blocked", "done"];
  const isView = mode === "view";
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.successCriteria.trim()) e.successCriteria = "Success criteria is required.";
    if (!form.targetDate.trim()) e.targetDate = "Target date is required.";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.targetDate.trim()))
      e.targetDate = "Use YYYY-MM-DD format.";
    if (!form.ownerId.trim()) e.ownerId = "ownerId is required.";
    if (!Number.isInteger(form.priority) || form.priority < 0 || form.priority > 5)
      e.priority = "Priority must be 0–5.";
    if (form.timeBudgetMin !== "" && !/^\d+$/.test(form.timeBudgetMin))
      e.timeBudgetMin = "Enter whole minutes.";
    if (!form.reviewCadence) e.reviewCadence = "Review cadence is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const doSave = async () => {
    if (!validate()) {
      Alert.alert("Fix errors", "Please correct highlighted fields.");
      return;
    }
    const payload = {
      ...form,
      ownerId: form.ownerId, // ensure profile value
      timeBudgetMin: form.timeBudgetMin === "" ? null : parseInt(form.timeBudgetMin, 10),
    };
    try {
      setSaving(true);
      const saved = await onSave(payload);
      if (saved?.$id) setField("$id", saved.$id);
      setMode("view");
      Alert.alert("Saved", "Goal has been saved.");
    } catch (err) {
      console.log("Save error:", err);
      const msg = err?.message || err?.response?.message || "Unknown save error";
      Alert.alert("Save failed", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isView ? "Goal Details" : "Edit Goal"}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.btn, isView ? styles.btnPrimary : styles.btnGhost]}
            onPress={() => setMode(isView ? "edit" : "view")}
            disabled={saving}
          >
            <Text style={isView ? styles.btnPrimaryText : styles.btnGhostText}>
              {isView ? "Edit" : "Cancel"}
            </Text>
          </TouchableOpacity>
          {!isView && (
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={doSave}
              disabled={saving}
            >
              <Text style={styles.btnPrimaryText}>
                {saving ? "Saving…" : "Save"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Field
          label="Title *"
          value={form.title}
          onChangeText={(t) => setField("title", t)}
          placeholder="Short title"
          editable={!isView}
          errorText={errors.title}
        />
        <Field
          label="Why is this important to accomplish?"
          value={form.description}
          onChangeText={(t) => setField("description", t)}
          placeholder="When I accomplish this, I will..."
          editable={!isView}
          multiline
        />
        <Field
          label="What will you gain from this goal?"
          value={form.why}
          onChangeText={(t) => setField("why", t)}
          placeholder="I will gain..."
          editable={!isView}
          multiline
        />
        <Field
          label="Notes"
          value={form.notes}
          onChangeText={(t) => setField("notes", t)}
          placeholder="Dont forget to..."
          editable={!isView}
          multiline
        />
        <Field
          label="I can mark this completed when *"
          value={form.successCriteria}
          onChangeText={(t) => setField("successCriteria", t)}
          placeholder="e.g., I have done A, B, and C"
          editable={!isView}
          multiline
          errorText={errors.successCriteria}
        />

        {/* Priority a..5 */}
        <View style={styles.block}>
        <View style={styles.priorityRow}>
            {/* Label on the left */}
            <Text style={styles.priorityLabel}>Priority</Text>

            {/* Mountains on the right */}
            <View style={styles.mountainRow}>
            {[1, 2, 3, 4, 5].map((n) => {
                const selected = n <= form.priority;
                return (
                <TouchableOpacity
                    key={n}
                    disabled={isView}
                    onPress={() => setField("priority", n)}
                    style={styles.mountainTap}
                >
                    <SnowyMountain
                    width={40}
                    height={40}
                    mountainColor={selected ? "#3b3b52" : "#CBD5E1"}
                    snowColor={selected ? "#A5F3E2" : "#E2FAF5"}
                    strokeColor={selected ? "#222239" : "#CBD5E1"}
                    strokeWidth={2}
                    />
                </TouchableOpacity>
                );
            })}
            </View>
        </View>

        {/* Error text below */}
        {errors.priority ? <ErrorText text={errors.priority} /> : null}
        </View>

        {/* Target Date with pop-out calendar */}
        <View style={styles.block}>
          <Label text="Target Date *" />
          <TouchableOpacity
            disabled={isView}
            onPress={() => setDatePickerOpen(true)}
            style={[
              styles.input,
              styles.inputDate,
              isView && styles.inputDisabled,
              errors.targetDate && styles.inputError,
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.dateText, !form.targetDate && { color: "#9CA3AF" }]}>
              {form.targetDate || "Pick a date"}
            </Text>
            {!isView && form.targetDate ? (
              <TouchableOpacity
                onPress={() => setField("targetDate", "")}
                style={styles.clearChip}
              >
                <Text style={styles.clearChipText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
          {errors.targetDate ? <ErrorText text={errors.targetDate} /> : null}



          <DateTimePickerModal
            isVisible={datePickerOpen}
            mode="date"
            date={parseISODate(form.targetDate) || new Date()}
            onConfirm={(d) => {
              setDatePickerOpen(false);
              setField("targetDate", toISODate(d));
              if (errors.targetDate) setErrors((e) => ({ ...e, targetDate: undefined }));
            }}
            onCancel={() => setDatePickerOpen(false)}
            display={Platform.OS === "ios" ? "inline" : "default"}
          />
        </View>

        {/* Review Cadence (single-select dropdown) */}
        <View style={[styles.block, { zIndex: 3000 }]}>
          <Label text="Review Cadence *" />
          <DropDownPicker
            open={reviewOpen}
            value={reviewValue}
            items={reviewItems}
            setOpen={setReviewOpen}
            setValue={setReviewValue}
            setItems={setReviewItems}
            disabled={isView}
            placeholder="Select cadence..."
            style={[
              styles.dropdown,
              isView && styles.inputDisabled,
              errors.reviewCadence && styles.inputError,
            ]}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={3000}
            zIndexInverse={1000}
          />
          {errors.reviewCadence ? <ErrorText text={errors.reviewCadence} /> : null}
        </View>

        <Field
          label="Project"
          value={form.project}
          onChangeText={(t) => setField("project", t)}
          placeholder="Project name or relation label"
          editable={!isView}
          multiline
        />
        <View style={{ height: 28 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  header: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerButtons: { flexDirection: "row", gap: 8 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  btnPrimary: { backgroundColor: "#2563eb", borderColor: "#1d4ed8" },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnGhost: { backgroundColor: "#fff", borderColor: "#cbd5e1" },
  btnGhostText: { color: "#111827", fontWeight: "600" },

  container: { padding: 16, backgroundColor: "#fafafa" },
  block: { marginBottom: 16 },
  label: { fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputMultiline: { minHeight: 96, textAlignVertical: "top" },
  inputDisabled: { backgroundColor: "#f3f4f6", color: "#6b7280" },
  inputError: { borderColor: "#ef4444" },
  error: { color: "#b91c1c", marginTop: 6 },

  priorityRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepperBtn: {
    width: 44, height: 44, borderRadius: 12,
    borderWidth: 1, borderColor: "#d1d5db",
    alignItems: "center", justifyContent: "center", backgroundColor: "#fff",
  },
  disabledBtn: { opacity: 0.5 },
  stepperText: { fontSize: 22, fontWeight: "700" },
  priorityValue: { fontSize: 18, fontWeight: "700", minWidth: 22, textAlign: "center" },

  segmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  segmentItem: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#fff",
  },
  segmentItemSelected: { backgroundColor: "#111827", borderColor: "#111827" },
  segmentItemView: { opacity: 0.75 },
  segmentText: { fontSize: 14, color: "#111827", fontWeight: "600" },
  segmentTextSelected: { color: "#fff" },

  inputDate: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateText: { fontSize: 16, color: "#111827" },
  clearChip: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#fff",
  },
  clearChipText: { fontSize: 12, fontWeight: "600", color: "#374151" },

  dropdown: {
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  dropdownContainer: {
    borderColor: "#e5e7eb",
    borderRadius: 12,
  },

  readOnlyValue: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#374151",
  },
  mountainRow: {
  flexDirection: "row",
  alignItems: "flex-end",
  gap: 12,
  paddingVertical: 6,
},
mountainTap: { padding: 4 },
});
