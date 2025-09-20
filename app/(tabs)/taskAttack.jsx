// app/(tabs)/taskAttack.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { listTasksUpToDuration } from "../../lib/taskRepo";

const ACTIVE_STATUSES = ["todo", "in_progress", "paused"];
const MAX_MINUTES = 60; // stop at 1 hour

export default function TaskAttack() {
  const [minutes, setMinutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  // --- NEW: simple click handlers you can connect to your repo later ---
  const handleTaskPress = (task) => {
    console.log("Card pressed:", task.$id);
    // e.g., navigate to details or expand the card
    Alert.alert("Task", task.title || "(Untitled Task)");
  };
  const handleStart = (task) => {
    console.log("Start pressed:", task.$id);
    // TODO: await updateTaskStatus(task.$id, 'in_progress')
  };
  const handlePause = (task) => {
    console.log("Pause pressed:", task.$id);
    // TODO: await updateTaskStatus(task.$id, 'paused')
  };
  const handleDone = (task) => {
    console.log("Done pressed:", task.$id);
    // TODO: await updateTaskStatus(task.$id, 'done')
  };

  // Build enum list from 10/15/30-minute increments (deduped) up to 60
  const minuteOptions = useMemo(() => {
    const s = new Set();
    for (let i = 10; i <= MAX_MINUTES; i += 10) s.add(i);
    for (let i = 15; i <= MAX_MINUTES; i += 15) s.add(i);
    for (let i = 30; i <= MAX_MINUTES; i += 30) s.add(i);
    return Array.from(s).sort((a, b) => a - b); // -> [10,15,20,30,40,45,50,60]
  }, []);

  // Filter options by the dropdown's search box
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return minuteOptions;
    if (q === "1h" || q === "60m" || q === "60") return [60];
    const digits = q.replace(/\D/g, ""); // '30m' -> '30'
    if (!digits) return minuteOptions;
    return minuteOptions.filter((m) => String(m).includes(digits));
  }, [search, minuteOptions]);

  // Auto-run when a duration is chosen
  useEffect(() => {
    const run = async () => {
      if (minutes == null) return;
      setError("");
      try {
        setLoading(true);
        const docs = await listTasksUpToDuration(minutes);
        setTasks(docs);
      } catch (e) {
        setError(e?.message || "Something went wrong fetching tasks.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [minutes]);

  const TaskCard = ({ item }) => {
    const isDone = ["done", "completed"].includes(String(item.status || "").toLowerCase());
    const canStart = !isDone && item.status !== "in_progress";
    const canPause = !isDone && item.status === "in_progress";

    return (
      <Pressable
        onPress={() => handleTaskPress(item)}
        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
        style={({ pressed }) => [
          styles.card,
          pressed && { transform: [{ scale: 0.995 }] },
        ]}
      >
        <View style={styles.cardLeftIcon}>
          <Ionicons name={isDone ? "checkmark-done-outline" : "flash-outline"} size={22} color="#2B8C7E" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || "(Untitled Task)"}
          </Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {`${item.estimateMinutes ?? "—"} min`}
            {item.dueDate ? `  •  ${item.dueDate}` : ""}
            {item.priority != null ? `  •  P${item.priority}` : ""}
          </Text>

          {item.notes ? <Text style={styles.cardNotes} numberOfLines={2}>{item.notes}</Text> : null}

          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: "0%" }]} /></View>
          <Text style={styles.progressLabel}>0% Complete</Text>

          {/* --- NEW: clickable actions row --- */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => handleStart(item)}
              disabled={!canStart}
              style={[styles.actionBtn, !canStart && styles.actionBtnDisabled]}
              activeOpacity={0.7}
            >
              <Ionicons name="play" size={16} color={canStart ? "#0F766E" : "#94A3B8"} />
              <Text style={[styles.actionText, !canStart && styles.actionTextDisabled]}>Start</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePause(item)}
              disabled={!canPause}
              style={[styles.actionBtn, !canPause && styles.actionBtnDisabled]}
              activeOpacity={0.7}
            >
              <Ionicons name="pause" size={16} color={canPause ? "#92400E" : "#94A3B8"} />
              <Text style={[styles.actionText, !canPause && styles.actionTextDisabled]}>Pause</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDone(item)}
              style={styles.actionBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={16} color="#166534" />
              <Text style={styles.actionText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  };

  /* --- Select (enum dropdown with search) --- */
  const Select = () => (
    <>
      <TouchableOpacity
        style={styles.selectTrigger}
        onPress={() => { setSearch(""); setPickerOpen(true); }}
        accessibilityRole="button"
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} // easier to tap
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={18} color="#6B7280" />
        <Text style={styles.selectText}>
          {minutes ? `${minutes} min` : "Select time…"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheetWrap}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Select Duration</Text>
                <TouchableOpacity onPress={() => setPickerOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchRow}>
                <Ionicons name="search-outline" size={18} color="#6B7280" />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search (e.g., 15, 30, 1h)"
                  keyboardType="default"
                  returnKeyType="done"
                />
              </View>

              <FlatList
                data={filteredOptions}
                keyExtractor={(m) => String(m)}
                renderItem={({ item: m }) => {
                  const selected = minutes === m;
                  return (
                    <TouchableOpacity
                      style={[styles.optionRow, selected && styles.optionRowActive]}
                      onPress={() => { setMinutes(m); setPickerOpen(false); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextActive]}>{m} minutes</Text>
                      {selected && <Ionicons name="checkmark" size={18} color="#37C6AD" />}
                    </TouchableOpacity>
                  );
                }}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => <View style={styles.optionSep} />}
                style={{ maxHeight: 280 }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.h1}>Task Attack</Text>
        <Text style={styles.sub}>Spend your time to spare show you care!</Text>
        <Select />
        {loading && <ActivityIndicator size="large" style={{ marginTop: 6 }} />}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <FlatList
        data={tasks.filter((t) => ACTIVE_STATUSES.includes(String(t.status || "").toLowerCase()))}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <TaskCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"   // <--- ensure taps not swallowed
        ListEmptyComponent={
          minutes == null
            ? <Text style={styles.hint}>Select a time above to get started.</Text>
            : !loading && <Text style={styles.empty}>No tasks estimated at {minutes} minutes.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* page */
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  headerBlock: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  h1: { fontSize: 28, fontWeight: "800", color: "#1E1E1E", marginBottom: 4 },
  sub: { color: "#6B7280", marginBottom: 8 },

  /* select trigger */
  selectTrigger: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectText: { flex: 1, color: "#111827", fontWeight: "600" },

  /* modal sheet */
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  sheetWrap: { width: "100%" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: { flex: 1, color: "#111827" },

  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  optionRowActive: {
    backgroundColor: "#EAF8F5",
  },
  optionText: { color: "#1F2937", fontWeight: "600" },
  optionTextActive: { color: "#1F2937" },
  optionSep: { height: 8 },

  /* cards */
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E9EEF5",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardLeftIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDF3EE",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  cardSub: { marginTop: 4, color: "#6B7280" },
  cardNotes: { marginTop: 6, color: "#6B7280" },
  progressTrack: { height: 6, backgroundColor: "#EEF2F7", borderRadius: 999, marginTop: 10, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#E2E8F0", borderRadius: 999 },
  progressLabel: { marginTop: 6, color: "#9CA3AF", fontSize: 12 },

  /* NEW: actions row + buttons */
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionBtnDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  actionText: { fontWeight: "700", color: "#111827" },
  actionTextDisabled: { color: "#94A3B8" },

  error: { color: "#EF4444", marginTop: 6 },
  empty: { color: "#6B7280", marginTop: 16, textAlign: "center" },
  hint: { color: "#9CA3AF", marginTop: 16, textAlign: "center" },
});
