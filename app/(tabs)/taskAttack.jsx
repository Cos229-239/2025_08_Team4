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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFonts } from "@expo-google-fonts/oswald";
import { OpenSans_700Bold, OpenSans_400Regular } from "@expo-google-fonts/open-sans";
import { Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { listTasksUpToDuration } from "../../lib/taskRepo";

const COLORS = {
  primary: "#37C6AD",
  accent: '#27AE60',       
  primaryLight: "#E6F6F1",
  background: "#F8F9FA",
  card: "#FFFFFF",
  text: "#212529",
  textSecondary: "#6C757D",
  border: "#EAEAEB",
  muted: "#6B7280",
  sheetInputBg: "#F3F4F6",
};

const ACTIVE_STATUSES = ["active", "todo", "in_progress", "paused"];
const MAX_MINUTES = 60;

export default function TaskAttack() {
  const [fontsLoaded] = useFonts({
    OpenSans_700Bold,
    OpenSans_400Regular,
    Pacifico_400Regular, // Pacifico title
  });

  const [minutes, setMinutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleTaskPress = (task) => {
    router.push({
      pathname: "../ViewTask",
      params: { taskId: String(task.$id), initialTask: JSON.stringify(task) },
    });
  };

  const minuteOptions = useMemo(() => {
    const s = new Set();
    for (let i = 10; i <= MAX_MINUTES; i += 10) s.add(i);
    for (let i = 15; i <= MAX_MINUTES; i += 15) s.add(i);
    for (let i = 30; i <= MAX_MINUTES; i += 30) s.add(i);
    return Array.from(s).sort((a, b) => a - b);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return minuteOptions;
    if (q === "1h" || q === "60m" || q === "60") return [60];
    const digits = q.replace(/\D/g, "");
    if (!digits) return minuteOptions;
    return minuteOptions.filter((m) => String(m).includes(digits));
  }, [search, minuteOptions]);

  useEffect(() => {
    const run = async () => {
      if (minutes == null) return;
      setError("");
      try {
        setLoading(true);
        const docs = await listTasksUpToDuration(minutes);
        setTasks(docs || []);
      } catch (e) {
        setError(e?.message || "Something went wrong fetching tasks.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [minutes]);

  const TaskCard = ({ item }) => {
    const mins = Number.isFinite(item?.estimateMinutes) ? item.estimateMinutes : null;
    const due = item?.dueDate ? String(item.dueDate).split("T")[0] : null;

    return (
      <Pressable
        onPress={() => handleTaskPress(item)}
        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
        style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.995 }] }]}
      >
        {/* Badge with border */}
        <View style={styles.cardLeftIcon}>
          <Text style={styles.badgeText}>{mins != null ? `${mins}` : "—"}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || "(Untitled Task)"}
          </Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {`${item.estimateMinutes ?? "—"} min`}
            {due ? `  •  ${due}` : ""}
            {item.priority != null ? `  •  P${item.priority}` : ""}
          </Text>

          {item.notes ? (
            <Text style={styles.cardNotes} numberOfLines={2}>
              {item.notes}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const Select = () => (
    <>
      <TouchableOpacity
        style={styles.selectTrigger}
        onPress={() => {
          setSearch("");
          setPickerOpen(true);
        }}
        accessibilityRole="button"
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={18} color={COLORS.muted} />
        <Text style={styles.selectText}>
          {minutes ? `${minutes} min` : "Select time…"}
        </Text>
        <Ionicons name="chevron-down" size={18} color={COLORS.muted} />
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
                <TouchableOpacity
                  onPress={() => setPickerOpen(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={22} color={COLORS.muted} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchRow}>
                <Ionicons name="search-outline" size={18} color={COLORS.muted} />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search (e.g., 15, 30, 1h)"
                  placeholderTextColor={COLORS.textSecondary}
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
                      onPress={() => {
                        setMinutes(m);
                        setPickerOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                        {m} minutes
                      </Text>
                      {selected && (
                        <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => <View style={styles.optionSep} />}
                style={{ maxHeight: 300 }}
                contentContainerStyle={{ paddingBottom: 8 }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.h1}>Task Attack</Text>
        <Text style={styles.sub}>Spend your time to spare show you care!</Text>
        <Select />
        {loading && <ActivityIndicator size="large" style={{ marginTop: 10 }} color={COLORS.primary} />}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <FlatList
        data={tasks.filter((t) => ACTIVE_STATUSES.includes(String(t.status || "").toLowerCase()))}
        keyExtractor={(item) => String(item.$id)}
        renderItem={({ item }) => <TaskCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          minutes == null ? (
            <Text style={styles.hint}>Select a time above to get started.</Text>
          ) : !loading ? (
            <Text style={styles.empty}>No tasks estimated at {minutes} minutes.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* page */
  container: { flex: 1, backgroundColor: COLORS.background },
  headerBlock: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },

  // Pacifico title in mint
  h1: {
    fontSize: 40,
    color: COLORS.accent,
    marginBottom: 2,
    fontFamily: "Pacifico_400Regular",
  },
  sub: {
    color: COLORS.textSecondary,
    marginBottom: 12,
    fontFamily: "OpenSans_400Regular",
  },

  /* select trigger */
  selectTrigger: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectText: {
    flex: 1,
    color: COLORS.text,
    fontFamily: "OpenSans_700Bold",
  },

  /* modal sheet */
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheetWrap: { width: "100%" },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 18,
    color: COLORS.text,
    fontFamily: "OpenSans_700Bold",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.sheetInputBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontFamily: "OpenSans_400Regular",
  },

  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionRowActive: { backgroundColor: COLORS.primaryLight, borderColor: "#D0F0E7" },
  optionText: { color: COLORS.text, fontFamily: "OpenSans_700Bold" },
  optionTextActive: { color: COLORS.text },
  optionSep: { height: 10 },

  /* cards */
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Badge with visible border
  cardLeftIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,                 // <— border added
    borderColor: COLORS.primary,    // <— mint border
  },
  badgeText: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: "OpenSans_700Bold",
  },

  cardTitle: { fontSize: 16, color: COLORS.text, fontFamily: "OpenSans_700Bold" },
  cardSub: { marginTop: 4, color: COLORS.textSecondary, fontFamily: "OpenSans_400Regular" },
  cardNotes: { marginTop: 6, color: COLORS.textSecondary, fontFamily: "OpenSans_400Regular" },

  error: { color: "#EF4444", marginTop: 10, fontFamily: "OpenSans_700Bold" },
  empty: { color: COLORS.textSecondary, marginTop: 16, textAlign: "center", fontFamily: "OpenSans_400Regular" },
  hint: { color: "#9CA3AF", marginTop: 16, textAlign: "center", fontFamily: "OpenSans_400Regular" },
});
