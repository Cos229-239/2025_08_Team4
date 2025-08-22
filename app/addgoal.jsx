import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Picker } from '@react-native-picker/picker';

const modalHeight = Dimensions.get('window').height * 0.4;

function TabOneContent({ inputText, setInputText }) {
  return (
    <View style={styles.tabContent}>
      <TextInput
        style={styles.input}
        placeholder="Enter your goal title..."
        value={inputText}
        onChangeText={setInputText}
      />
    </View>
  );
}

function TabTwoContent() {
  const [selectedValue, setSelectedValue] = useState('');
    const [inputText, setInputText] = useState('');

    return (
      <View style={styles.tabContent}>
        {/* Dropdown Picker */}
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => setSelectedValue(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select an option" value="" />
          {/* More options can be added here later */}
        </Picker>

        {/* Text input below the dropdown */}
        <TextInput
          style={styles.input}
          placeholder="Enter text here..."
          value={inputText}
          onChangeText={setInputText}
        />
      </View>
  );
}

export default function AddGoalModal() {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('tab1');
  const router = useRouter();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.wrapper}>
        <BlurView intensity={50} tint="dark" style={styles.blur} />
        <TouchableWithoutFeedback>
          <View style={[styles.modalContainer, { height: modalHeight }]}>
            {/* Tabs container - top 1/4 of modal */}
            <View style={styles.tabsContainer}>
              <Pressable
                style={[
                  styles.tabButton,
                  styles.tabButtonLeft,
                  activeTab === 'tab1' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('tab1')}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'tab1' && styles.tabButtonTextActive,
                  ]}
                >
                  New Goal
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.tabButton,
                  styles.tabButtonRight,
                  activeTab === 'tab2' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('tab2')}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'tab2' && styles.tabButtonTextActive,
                  ]}
                >
                  New Task
                </Text>
              </Pressable>
            </View>


            {/* Content container - bottom 3/4 of modal */}
            <View style={styles.contentContainer}>
              {activeTab === 'tab1' ? (
                <TabOneContent inputText={inputText} setInputText={setInputText} />
              ) : (
                <TabTwoContent />
              )}
            </View>

            {/* Bottom buttons */}
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.button}
                onPress={() => {
                  console.log('Add Button Pressed', inputText);
                  router.back();
                }}
              >
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  router.back();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blur: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    //paddingHorizontal: 24,
    //paddingTop: 24,
    paddingBottom: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    alignItems: 'center',
    flexDirection: 'column',
  },
  tabsContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '20%',
    marginBottom: 16,
    //borderRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
    borderWidth: 1.5,
    borderColor: 'black',
  },

  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },

  tabButtonActive: {
    backgroundColor: '#50E3C2',
  },

  tabButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },

  tabButtonTextActive: {
    color: '#fff',
  },

  tabButtonLeft: {
    //borderTopLeftRadius: 12,
    //borderBottomLeftRadius: 12,
    borderRightWidth: 1,
    borderRightColor: 'black',
  },

  tabButtonRight: {
    //borderTopRightRadius: 12,
    //borderBottomRightRadius: 12,
  },

  tabButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  tabContent: {
    flex: 1,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
  },
  button: {
    flex: 1,
    backgroundColor: '#50E3C2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
