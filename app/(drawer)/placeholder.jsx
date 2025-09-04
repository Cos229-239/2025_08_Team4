// app/(tabs)/testdata.jsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { account, databases, ID } from "../../lib/appwrite";
import { DB_ID, COL } from "../../lib/ids";         // make sure ids.js exports these
import { ownerPerms } from "../../lib/perms";       // helper we set up earlier

export default function TestDataPort() {
  const [goalTitle, setGoalTitle] = useState("Test Goal");
  const [taskATitle, setTaskATitle] = useState("Write outline");
  const [taskBTitle, setTaskBTitle] = useState("Draft chapter");
  const [lagMinutes, setLagMinutes] = useState("0");
  const [tagName, setTagName] = useState("");       // optional: leave blank to skip
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function append(msg) {
    setLog((prev) => prev + (prev ? "\n" : "") + msg);
  }

  async function onSave() {
    setLoading(true);
    setError("");
    setLog("");

    try {
      // 1) Who’s the user?
      const user = await account.get();
      append(`User: ${user.$id}`);

      // 2) Create a Goal
      const goalDoc = await databases.createDocument(
        DB_ID,
        COL.GOALS,
        ID.unique(),
        {
          ownerId: user.$id,
          title: goalTitle,
          status: "active",
        },
        ownerPerms(user.$id)
      );
      append(`Goal created: ${goalDoc.$id}`);

      // 3) Create Task A (blocker)
      const taskA = await databases.createDocument(
        DB_ID,
        COL.TASKS,
        ID.unique(),
        {
          ownerId: user.$id,
          title: taskATitle,
          status: "todo",
          goal: goalDoc.$id,       // relationship
          goalId: goalDoc.$id,     // shadow string for indexing
        },
        ownerPerms(user.$id)
      );
      append(`Task A created: ${taskA.$id}`);

      // 4) Create Task B (depends on A)
      const taskB = await databases.createDocument(
        DB_ID,
        COL.TASKS,
        ID.unique(),
        {
          ownerId: user.$id,
          title: taskBTitle,
          status: "todo",
          goal: goalDoc.$id,       // relationship
          goalId: goalDoc.$id,     // shadow string
        },
        ownerPerms(user.$id)
      );
      append(`Task B created: ${taskB.$id}`);

      // 5) Create dependency edge: B depends on A
      const dep = await databases.createDocument(
        DB_ID,
        COL.DEPS,
        ID.unique(),
        {
          ownerId: user.$id,
          task: taskB.$id,            // relationship (downstream)
          taskId: taskB.$id,          // shadow string (index)
          dependsOn: taskA.$id,       // relationship (upstream)
          dependsOnId: taskA.$id,     // shadow string (index)
          type: "finish_to_start",
          lagMinutes: parseInt(lagMinutes || "0", 10) || 0,
        },
        ownerPerms(user.$id)
      );
      append(`Dependency created: ${dep.$id}  (B depends on A)`);

      // 6) Optional: Create Tag + attach to Task B
      if (tagName.trim().length > 0) {
        // create/find tag
        const tag = await databases.createDocument(
          DB_ID,
          COL.TAGS,
          ID.unique(),
          {
            ownerId: user.$id,
            name: tagName.trim(),
          },
          ownerPerms(user.$id)
        );
        append(`Tag created: ${tag.$id} (${tag.name})`);

        // join row
        const tt = await databases.createDocument(
          DB_ID,
          COL.TASK_TAGS,
          ID.unique(),
          {
            ownerId: user.$id,
            task: taskB.$id,
            taskId: taskB.$id,  // shadow
            tag: tag.$id,
            tagId: tag.$id,     // shadow
          },
          ownerPerms(user.$id)
        );
        append(`Tag attached to Task B: ${tt.$id}`);
      }

      append("✅ Done! Check your Appwrite Console to verify documents.");
    } catch (e) {
      console.error(e);
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
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

      <Pressable style={[s.btn, loading && s.btndis]} disabled={loading} onPress={onSave}>
        {loading ? <ActivityIndicator /> : <Text style={s.btnText}>Save test data</Text>}
      </Pressable>

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
    borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, fontSize: 16,
    backgroundColor: "white",
  },
  btn: {
    marginTop: 8, backgroundColor: "#2b6cb0", borderRadius: 12, paddingVertical: 12, alignItems: "center",
  },
  btndis: { opacity: 0.6 },
  btnText: { color: "white", fontWeight: "700" },
  err: { color: "#c53030", marginTop: 10 },
  log: { fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }), fontSize: 12, color: "#333" },
});
