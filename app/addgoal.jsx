import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function AddGoal() {
  const [inputText, setInputText] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Goal</Text>

      <TextInput
        style={styles.textInput}
        placeholder="Enter your goal title..."
        value={inputText}
        onChangeText={(text) => setInputText(text)}
      />

      {/* Add Button */}
      <Pressable
        style={[styles.button, { left: screenWidth / 3 - 80 }]}
        onPress={() => console.log('Add button pressed')}
      >
        <Text style={styles.buttonText}>Add</Text>
      </Pressable>

      {/* Cancel Button */}
      <Pressable
        style={[styles.button, styles.cancelButton, { left: (screenWidth * 2) / 3 - 60 }]}
        onPress={() => console.log('Cancel button pressed')}
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
  },

  title: {
    textAlign: 'center',
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
    alignSelf: 'center',
    marginBottom: 80,
  },

  button: {
    position: 'absolute',
    width: 130,
    paddingVertical: 15,
    backgroundColor: '#50E3C2',
    borderRadius: 8,
    bottom: 160,
    alignItems: 'center',

    elevation: 5,
  },

  cancelButton: {
    //bottom: 100,
    // Optional: backgroundColor: '#FF3B30',
  },

  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
