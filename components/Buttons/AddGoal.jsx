import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';

const GoalSelector = () => (
  <View style={styles.dropdown}>
    <Text style={[styles.dropdownText, { fontFamily: 'Oswald_600SemiBold' }]}>Select one of your Summits</Text>
    <Ionicons name="chevron-down-outline" size={24} color="#333" />
  </View>
);

export default function AddGoal({ isVisible, onClose }) {
  const [activeTab, setActiveTab] = useState('goal');

  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'goal' && styles.activeTab]} 
              onPress={() => setActiveTab('goal')}
            >
              <Text style={[styles.tabText, activeTab === 'goal' && styles.activeTabText, { fontFamily: 'Oswald_600SemiBold' }]}>NEW GOAL</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'task' && styles.activeTab]} 
              onPress={() => setActiveTab('task')}
            >
              <Text style={[styles.tabText, activeTab === 'task' && styles.activeTabText, { fontFamily: 'Oswald_600SemiBold' }]}>NEW TASK</Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'goal' ? (
            <>
              <Text style={[styles.label, { fontFamily: 'Oswald_600SemiBold' }]}>Goal Title</Text>
              <TextInput 
                style={[styles.input, { fontFamily: 'Oswald_600SemiBold' }]} 
                placeholder="Get Promotion" 
                placeholderTextColor="#A0A0A0"
              />
            </>
          ) : (
            <>
              <Text style={[styles.label, { fontFamily: 'Oswald_600SemiBold' }]}>Choose Goal</Text>
              <GoalSelector />
              <Text style={[styles.label, { fontFamily: 'Oswald_600SemiBold' }]}>Task Title</Text>
              <TextInput 
                style={[styles.input, { fontFamily: 'Oswald_600SemiBold' }]} 
                placeholder="Explain the goal in one to two words." 
                placeholderTextColor="#A0A0A0"
              />
            </>
          )}

          <View style={styles.buttonRow}>
            <Pressable
              style={styles.button} // Apply generic button style here
              onPress={onClose}
            >
              {/* Inner shadow overlay, adjusted for the wireframe's look */}
              <View style={[styles.buttonInnerShadow, styles.buttonCancelShadow]} /> 
              <Text style={[styles.textStyle, { fontFamily: 'Oswald_600SemiBold' }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.button} // Apply generic button style here
            >
              {/* Inner shadow overlay, adjusted for the wireframe's look */}
              <View style={[styles.buttonInnerShadow, styles.buttonAddShadow]} /> 
              <Text style={[styles.textStyle, { fontFamily: 'Oswald_600SemiBold' }]}>Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingBottom: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activeTab: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#3177C9',
  },
  tabText: {
    color: '#A0A0A0',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#3177C9',
  },
  label: {
    marginBottom: 8,
    fontSize: 20,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#D0D0D0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 18,
    color: '#333',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderColor: '#D0D0D0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  dropdownText: {
    color: '#A0A0A0',
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: { // THIS IS THE CONTAINER FOR THE BUTTON BACKGROUND AND SHADOW
    borderRadius: 25,
    flex: 0.45,
    backgroundColor: '#50E3C2', // Both buttons are green as per wireframe
    overflow: 'hidden', // Crucial for inner shadow
    height: 50, // Set explicit height for sleekness
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    // Outer shadow for the button itself (optional, can be removed if not desired)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonInnerShadow: { // THIS CREATES THE INNER SHADOW EFFECT
    position: 'absolute',
    left: 0,
    right: 0,
    height: 5, // Height of the shadow effect
    backgroundColor: 'rgba(0,0,0,0.1)', // Color of the shadow
    top: 0, // Position at the top for inner top shadow
  },
  textStyle: {
    color: 'white',
    fontSize: 20,
    // We already apply Oswald font in the component for the Text element
  },
});