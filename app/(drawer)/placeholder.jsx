// app/(drawer)/placeholder.jsx
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
  const [taskATitle, setTaskATitle] = useState("Write outline");
  const [taskBTitle, setTaskBTitle] = useState("Draft chapter");
  const [lagMinutes, setLagMinutes] = useState("0");
  const [tagName, setTagName] = useState("");
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function append(msg) {
    setLog((prev) => prev + (prev ? "\n" : "") + msg);
  }

  async function onCheck() {
    setLoading(true);
    setError("");
    setLog("");
    try {
      await logSession();
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
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    setLoading(true);
    setError("");
    setLog("");

    try {
      const me = await account.get();
      const userId = me.$id;
      append(`User: ${userId}`);

      const goalDoc = await databases.createDocument(
        DB_ID,
        COL.GOALS,
        ID.unique(),
        { ownerId: userId, title: goalTitle, status: "active" },
        ownerPerms(userId)
      );
      append(`Goal created: ${goalDoc.$id}`);

      const taskA = await databases.createDocument(
        DB_ID,
        COL.TASKS,
        ID.unique(),
        {
          ownerId: userId,
          title: taskATitle,
          status: "todo",
          goal: goalDoc.$id,
          goalId: goalDoc.$id,
        },
        ownerPerms(userId)
      );
      append(`Task A created: ${taskA.$id}`);

      const taskB = await databases.createDocument(
        DB_ID,
        COL.TASKS,
        ID.unique(),
        {
          ownerId: userId,
          title: taskBTitle,
          status: "todo",
          goal: goalDoc.$id,
          goalId: goalDoc.$id,
        },
        ownerPerms(userId)
      );
      append(`Task B created: ${taskB.$id}`);

      const dep = await databases.createDocument(
        DB_ID,
        COL.DEPS,
        ID.unique(),
        {
          ownerId: userId,
          task: taskB.$id,
          taskId: taskB.$id,
          dependsOn: taskA.$id,
          dependsOnId: taskA.$id,
          type: "finish_to_start",
          lagMinutes: parseInt(lagMinutes || "0", 10) || 0,
        },
        ownerPerms(userId)
      );
      append(`Dependency created: ${dep.$id} (B depends on A)`);

      if (tagName.trim()) {
        const tag = await databases.createDocument(
          DB_ID,
          COL.TAGS,
          ID.unique(),
          { ownerId: userId, name: tagName.trim() },
          ownerPerms(userId)
        );
        append(`Tag created: ${tag.$id} (${tag.name})`);

        const tt = await databases.createDocument(
          DB_ID,
          COL.TASK_TAGS,
          ID.unique(),
          {
            ownerId: userId,
            task: taskB.$id,
            taskId: taskB.$id,
            tag: tag.$id,
            tagId: tag.$id,
          },
          ownerPerms(userId)
        );
        append(`Tag attached to Task B: ${tt.$id}`);
      }

      append("✅ Done! Check Appwrite Console for new docs.");
    } catch (e) {
      console.error("Appwrite error", e.code, e.message, e.response);
      setError(e?.message ?? "Unknown error");
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
      <Text style={s.h1}>Test Data Porting</Text>

      <Field label="Goal title">
        <TextInput style={s.input} value={goalTitle} onChangeText={setGoalTitle} />
      </Field>
      <Field label="Task A (blocker) title">
        <TextInput style={s.input} value={taskATitle} onChangeText={setTaskATitle} />
      </Field>
      <Field label="Task B (depends on A) title">
        <TextInput style={s.input} value={taskBTitle} onChangeText={setTaskBTitle} />
      </Field>
      <Field label="Lag minutes (optional)">
        <TextInput
          style={s.input}
          keyboardType="number-pad"
          value={String(lagMinutes)}
          onChangeText={setLagMinutes}
        />
      </Field>
      <Field label="Tag name (optional)">
        <TextInput style={s.input} value={tagName} onChangeText={setTagName} placeholder="e.g., DeepWork" />
      </Field>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable style={[s.btn, loading && s.btndis]} disabled={loading} onPress={onCheck}>
          {loading ? <ActivityIndicator /> : <Text style={s.btnText}>Check Connection</Text>}
        </Pressable>
        <Pressable style={[s.btn, loading && s.btndis]} disabled={loading} onPress={onSave}>
          {loading ? <ActivityIndicator /> : <Text style={s.btnText}>Save Test Data</Text>}
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
  err: { color: "#c53030", marginTop: 10 },
  log: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
    fontSize: 12,
    color: "#333",
  },
});
