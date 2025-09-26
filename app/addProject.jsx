// app/addProject.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "@expo-google-fonts/pacifico";
import { Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { OpenSans_700Bold, OpenSans_400Regular } from "@expo-google-fonts/open-sans";
import { createProject } from "../lib/projectRepo.js";
import { ENUMS } from "../lib/ids.js";

const TYPE_OPTIONS = ENUMS.PROJECT_TYPES; // e.g. ["Personal","Work","School","Side","Other"]
const SWATCHES = ["#37C6AD", "#4F46E5", "#EF4444", "#F59E0B", "#10B981", "#111827"];

// ✅ keep your shared colors object (mint accent)
const colors = {
  background: "#F2F2F2",
  cardBackground: "#FFFFFF",
  textPrimary: "#333333",
  textSecondary: "#828282",
  primaryBlue: "#2F80ED",
  accent: "#37C6AD", // mint
  priority1: "#6FCF97",
  priority2: "#F2C94C",
  priority3: "#F2994A",
  priority4: "#EB5757",
  priority5: "#C22B34",
};

export default function AddProject() {
  const [fontsLoaded] = useFonts({ Pacifico_400Regular, OpenSans_700Bold, OpenSans_400Regular });

  const [name, setName] = useState("");
  const [type, setType] = useState(TYPE_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(SWATCHES[0]);
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onSave = async () => {
    setError("");
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    try {
      setSaving(true);
      await createProject({
        name: name.trim(),
        type: type?.trim(),
        description: description?.trim(),
        color: color?.trim(),
        parentId: parentId?.trim() || null,
      });
      Alert.alert("Project created", "Your project was added successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      setError(e?.message || "Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.h1}>New Project</Text>
          <Text style={styles.sub}>
            Stay organized and boost your productivity. Keep all your Goals in a project
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Project name"
            placeholderTextColor="#A0A4AB"
            style={styles.input}
            maxLength={120}
          />

          <Text style={styles.label}>Type *</Text>
          <View style={styles.pillsRow}>
            {TYPE_OPTIONS.map((t) => {
              const active = t === type;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  activeOpacity={0.8}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What is this project about?"
            placeholderTextColor="#A0A4AB"
            style={[styles.input, styles.textArea]}
            multiline
            maxLength={2000}
          />

          <Text style={styles.label}>Color</Text>
          <View style={styles.swatches}>
            {SWATCHES.map((c) => {
              const active = c === color;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  activeOpacity={0.9}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    active && { borderColor: colors.accent, borderWidth: 3 },
                  ]}
                />
              );
            })}
          </View>
          <TextInput
            value={color}
            onChangeText={setColor}
            placeholder="#37C6AD or any CSS color"
            placeholderTextColor="#A0A4AB"
            style={styles.input}
            maxLength={32}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Parent Project (optional)</Text>
          <TextInput
            value={parentId}
            onChangeText={setParentId}
            placeholder="Parent project ID"
            placeholderTextColor="#A0A4AB"
            style={styles.input}
            maxLength={36}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            onPress={onSave}
            disabled={saving || !name.trim() || !type?.trim()}
            style={[
              styles.primaryBtn,
              (saving || !name.trim() || !type?.trim()) && styles.btnDisabled,
            ]}
            activeOpacity={0.9}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Create Project</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------------- styles ---------------------- */
const styles = StyleSheet.create({
  /* page */
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },

  // Pacifico title in mint (matches Task Attack)
  h1: {
    fontSize: 40,
    color: colors.accent,
    marginBottom: 2,
    fontFamily: "Pacifico_400Regular",
  },
  sub: {
    color: colors.textSecondary,
    fontFamily: "OpenSans_400Regular",
  },

  form: { paddingHorizontal: 16, paddingTop: 10 },
  label: {
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "OpenSans_700Bold",
  },
  input: {
    backgroundColor: "#F8F8F8",
    borderColor: "#EAEAEB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontFamily: "OpenSans_400Regular",
  },
  textArea: { height: 110, textAlignVertical: "top" },

  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#EAEAEB",
    backgroundColor: colors.cardBackground,
  },
  pillActive: { backgroundColor: "#E6F6F1", borderColor: colors.accent },
  pillText: { color: colors.textPrimary, fontFamily: "OpenSans_700Bold" },
  pillTextActive: { color: colors.accent, fontFamily: "OpenSans_700Bold" },

  swatches: { flexDirection: "row", gap: 10, marginBottom: 10, marginTop: 2 },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  primaryBtn: {
    marginTop: 18,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  primaryText: { color: "#FFFFFF", fontFamily: "OpenSans_700Bold" },
  btnDisabled: { opacity: 0.6 },

  secondaryBtn: { marginTop: 10, paddingVertical: 12, alignItems: "center" },
  secondaryText: { color: colors.textSecondary, fontFamily: "OpenSans_700Bold" },

  error: { color: "#EF4444", marginTop: 10, fontFamily: "OpenSans_700Bold" },
});

export { colors }; // (optional) export if other screens import it
