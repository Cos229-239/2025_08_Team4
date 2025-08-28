import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans';

const GoalSelector = () => (
  <View style={styles.dropdown}>
    <Text style={styles.dropdownText}>Select one of your Summits</Text>
    <Ionicons name="chevron-down-outline" size={24} color="#333" />
  </View>
);

export default function AddGoal({ isVisible, onClose }) {
  const [activeTab, setActiveTab] = useState('goal');
  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
    OpenSans_700Bold,
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
      statusBarTranslucent={true}
    >
      <Pressable style={styles.fullScreenContainer} onPress={onClose}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalView}>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'goal' && styles.activeTab]} 
                onPress={() => setActiveTab('goal')}
              >
                <Text style={[styles.tabText, activeTab === 'goal' && styles.activeTabText]}>NEW GOAL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'task' && styles.activeTab]} 
                onPress={() => setActiveTab('task')}
              >
                <Text style={[styles.tabText, activeTab === 'task' && styles.activeTabText]}>NEW TASK</Text>
              </TouchableOpacity>
            </View>
            
            {activeTab === 'goal' ? (
              <>
                <Text style={styles.label}>Goal Title</Text>
                <TextInput style={styles.input} placeholder="Get Promotion" placeholderTextColor="#BDBDBD" />
              </>
            ) : (
              <>
                <Text style={styles.label}>Choose Goal</Text>
                <View style={styles.dropdown}>
                  <Text style={styles.dropdownText}>Select one of your Summits</Text>
                  <Ionicons name="chevron-down-outline" size={24} color="#333" />
                </View>
                <Text style={styles.label}>Task Title</Text>
                <TextInput style={styles.input} placeholder="Explain the goal in one to two words." placeholderTextColor="#BDBDBD" />
              </>
            )}

            <View style={styles.buttonRow}>
              <Pressable style={styles.button} onPress={onClose}>
                <View style={styles.buttonInnerShadow} />
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.button}>
                <View style={styles.buttonInnerShadow} />
                <Text style={styles.textStyle}>Add</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    paddingTop: 15,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    width: 350, 
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    justifyContent: 'space-around',
  },
  tab: {
    minWidth: 100,
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F2F2F2',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  tabText: {
    color: '#A0A0A0',
    fontSize: 14,
    fontFamily: 'Oswald_600SemiBold',
  },
  activeTabText: {
    color: '#000000',
    fontFamily: 'Oswald_600SemiBold',
  },
  label: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    fontFamily: 'Oswald_600SemiBold',
    height: 45,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 45,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  dropdownText: {
    color: '#BDBDBD',
    fontSize: 16,
    fontFamily: 'Oswald_600SemiBold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    backgroundColor: '#50E3C2',
    height: 48,
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonInnerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  textStyle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Oswald_600SemiBold',
  },
});