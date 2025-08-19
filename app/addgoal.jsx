import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function AddGoal() {
  const [inputText, setInputText] = useState('');

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Add a New Goal</Text>

      <TextInput style={styles.textInput} placeholder="Enter your goal title..." value={inputText} onChangeText={(text) => setInputText(text)}/>

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
    paddingTop: 100,
    alignItems: 'center',
  },

   title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },

  textInput: {
      width: '80%',
      height: 50,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      marginBottom: 80,
    },

  button: {
    position: 'absolute',
    alignSelf: 'center',
    width: 300,
    paddingVertical: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    bottom: 280,
    alignItems: 'center',
  },
  cancelButton: {
    bottom: 170,
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
