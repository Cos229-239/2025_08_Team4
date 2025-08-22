import { View, Text, StyleSheet } from "react-native";

export default function AddGoal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Goal Place holder</Text>
      <Text>This page will have the new goal layout.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
});