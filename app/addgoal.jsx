import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AddGoal() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => console.log("Add button pressed")}>
        <Text style={styles.buttonText}>Add</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.cancelButton]} onPress={() => console.log("Cancel button pressed")}>
        <Text style={styles.buttonText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    alignSelf: 'center',
    width: 200,
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    bottom: 280,
    alignItems: 'center',
  },
  cancelButton: {
    bottom: 190,
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
