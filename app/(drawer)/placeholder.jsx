
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { account, databases, ID } from "../../lib/appwrite";
import { DB_ID, COL } from "../../lib/ids";
import { ownerPerms } from "../../lib/perms";
import { useGlobalContext } from "../../context/GlobalProvider";

export default function TestDataPort() {
  const { isLoggedIn, isLoading, logSession } = useGlobalContext();

  const [goalTitle, setGoalTitle] = useState("Test Goal");
  const [successCriteria, setSuccessCriteria] = useState(""); 
  const [targetDateStr, setTargetDateStr] = useState("");     
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function append(msg) {
    setLog((prev) => prev + (prev ? "\n" : "") + msg);
  }


  function toIsoOrThrow(s) {
    const m = /^\d{4}-\d{2}-\d{2}$/.exec((s || "").trim());
    if (!m) throw new Error("Target date must be YYYY-MM-DD");

    const iso = new Date(`${s}T00:00:00Z`).toISOString();
    if (!iso) throw new Error("Invalid date");
    return iso;
  }

  async function onCheck() {
    setLoading(true);
    setError("");
    setLog("");
    try {
      if (typeof logSession === "function") await logSession();

      const me = await account.get();
      append(`account.get(): OK -> ${me.$id}`);
      append(`DB_ID: ${DB_ID}`);
      append(`COLS: ${JSON.stringify(COL, null, 2)}`);

      await databases.listDocuments(DB_ID, COL.TASKS, []);
      append("Tasks collection OK.");

      await databases.listDocuments(DB_ID, COL.GOALS, []);
      append("Goals collection OK.");

      append("✅ Connection + IDs look good.");
    } catch (e) {
      setError(e?.message ?? "Unknown error");
      append(`ERROR: ${e?.message ?? "Unknown error"}`);
      append("Tips:");
      append("• 'Database not found' → DB_ID is wrong.");
      append("• 'Collection not found' → a COL.* ID is wrong.");
      append("• 'Project is not accessible in this region' → endpoint region mismatch.");
      append("• 'Not authorized' (401) → no session; ensure login + platform IDs in Appwrite.");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveGoal() {
    setLoading(true);
    setError("");
    setLog("");
    try {
      const me = await account.get();
      const userId = me.$id;
      append(`User: ${userId}`);

      const targetDateIso = toIsoOrThrow(targetDateStr);

      const goalDoc = await databases.createDocument(
        DB_ID,
        COL.GOALS,
        ID.unique(),
        {
          ownerId: userId,
          title: goalTitle,
          status: "active",
          successCriteria: successCriteria || "Initial test criteria",
          targetDate: targetDateIso,
        },
        ownerPerms(userId)
      );
      append(`Goal created: ${goalDoc.$id}`);
      append("✅ Done! Check Appwrite Console for the new goal.");
    } catch (e) {
      setError(e?.message ?? "Unknown error");
      append(`ERROR: ${e?.message ?? "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Text style={{ textAlign: "center" }}>
          You’re not logged in. Sign in first, then return to this page.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h1}>Create Goal (test)</Text>

      <Field label="Goal title">
        <TextInput style={s.input} value={goalTitle} onChangeText={setGoalTitle} />
      </Field>

      <Field label='Success criteria (saved as "sucessCriteria")'>
        <TextInput
          style={s.input}
          value={successCriteria}
          onChangeText={setSuccessCriteria}
          placeholder="e.g., Complete A & B"
        />
      </Field>

      <Field label='Target date (YYYY-MM-DD)'>
        <TextInput
          style={s.input}
          value={targetDateStr}
          onChangeText={setTargetDateStr}
          placeholder="e.g., 2025-12-31"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />
      </Field>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable style={[s.btn, loading && s.btndis]} disabled={loading} onPress={onCheck}>
          {loading ? <ActivityIndicator /> : <Text style={s.btnText}>Check Connection</Text>}
        </Pressable>

        <Pressable style={[s.btn, loading && s.btndis]} disabled={loading} onPress={onSaveGoal}>
          {loading ? <ActivityIndicator /> : <Text style={s.btnText}>Save Goal</Text>}
        </Pressable>
      </View>

      {!!error && <Text style={s.err}>Error: {error}</Text>}
      {!!log && (
        <>
          <Text style={s.h2}>Log</Text>
          <Text style={s.log}>{log}</Text>
        </>
      )}
    </ScrollView>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 8 },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  h2: { fontSize: 16, fontWeight: "600", marginTop: 14, marginBottom: 4 },
  label: { fontSize: 13, color: "#555", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  btn: {
    marginTop: 8,
    backgroundColor: "#2b6cb0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  btndis: { opacity: 0.6 },
  btnText: { color: "white", fontWeight: "700" },
  err: { color: "tomato", marginTop: 10 },
  log: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: 12,
    color: "#333",
  },
});
