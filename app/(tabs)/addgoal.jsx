// In app/components/AddGoal.jsx

import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // For the button gradients

const COLORS = { 
  card: '#FFFFFF', 
  text: '#FFFFFF', 
  textSecondary: '#EAEAEB',
  overlay: 'rgba(0, 0, 0, 0.7)', // Darker overlay
};

export default function AddGoal({ isVisible, onClose }) {
  const router = useRouter();

  const handleNavigate = (path) => {
    onClose(); // Close the modal first
    // Use a small timeout to let the modal close smoothly before navigating
    setTimeout(() => {
      router.push(path);
    }, 150);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.container} onPress={onClose}>
        <Pressable>
          <Text style={styles.title}>What do you want to add?</Text>
          <View style={styles.buttonContainer}>
            {/* Add Goal Button */}
            <TouchableOpacity onPress={() => handleNavigate('/addgoal')}>
              <LinearGradient
                colors={['#FF8A65', '#FF5722']}
                style={styles.button}
              >
                <Ionicons name="flag-outline" size={32} color={COLORS.text} />
                <Text style={styles.buttonTitle}>Add Goal</Text>
                <Text style={styles.buttonSubtitle}>Set a new long-term objective</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Add Task Button */}
            <TouchableOpacity onPress={() => handleNavigate('/AddTaskFlowScreen')}>
              <LinearGradient
                colors={['#42A5F5', '#1976D2']}
                style={styles.button}
              >
                <Ionicons name="document-text-outline" size={32} color={COLORS.text} />
                <Text style={styles.buttonTitle}>Add Task</Text>
                <Text style={styles.buttonSubtitle}>Add a task to an existing goal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    width: 150,
    height: 150,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  buttonSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});