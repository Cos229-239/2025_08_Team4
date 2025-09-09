import React from "react";
import { View, StyleSheet } from "react-native";
import MountainProgress from "../../components/MountainProgress";

export default function ExampleScreen() {
  const tasks = [
    { id: 1, title: "Research", completed: true },
    { id: 2, title: "Plan", completed: true },
    { id: 3, title: "Prototype", completed: false },
    { id: 4, title: "Test", completed: false },
    { id: 5, title: "Launch", completed: false },
  ];

  return (
    <View style={styles.container}>
      <MountainProgress tasks={tasks} width={360} showLabels />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f6fbff" },
});
