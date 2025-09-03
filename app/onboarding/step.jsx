import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';

const OnboardingStep1 = () => {
  const router = useRouter();
  
  // State for the Name input
  const [name, setName] = useState('');

  // --- THE FIX IS HERE: We are now providing the initial list of items for each dropdown ---

  // State for the Language dropdown
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageValue, setLanguageValue] = useState(null);
  const [languageItems, setLanguageItems] = useState();

  // State for the Pronouns dropdown
  const [pronounsOpen, setPronounsOpen] = useState(false);
  const [pronounsValue, setPronounsValue] = useState(null);
  const [pronounItems, setPronounItems] = useState();

  // State for the Country dropdown
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState(null);
  const [countryItems, setCountryItems] = useState();
  // -------------------------------------------------------------------------

  const handleContinue = () => {
    console.log('User Info:', { 
      name: name, 
      pronouns: pronounsValue, 
      country: countryValue,
      language: languageValue 
    });
    router.push('/onboarding/step2'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios"? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to LucidPaths</Text>
          <Text style={styles.subtitle}>Let's start by setting up your profile.</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#8E8E93"
          />

          {/* Language Picker */}
          <DropDownPicker
            open={languageOpen}
            value={languageValue}
            items={languageItems}
            setOpen={setLanguageOpen}
            setValue={setLanguageValue}
            setItems={setLanguageItems}
            placeholder="Select a Language"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={3000}
            zIndexInverse={1000}
          />

          {/* Pronouns Picker */}
          <DropDownPicker
            open={pronounsOpen}
            value={pronounsValue}
            items={pronounItems}
            setOpen={setPronounsOpen}
            setValue={setPronounsValue}
            setItems={setPronounItems}
            placeholder="Select your Pronouns"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={2000}
            zIndexInverse={2000}
          />

          {/* Country Picker */}
          <DropDownPicker
            open={countryOpen}
            value={countryValue}
            items={countryItems}
            setOpen={setCountryOpen}
            setValue={setCountryValue}
            setItems={setCountryItems}
            placeholder="Select your Country"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={1000}
            zIndexInverse={3000}
          />

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#636366',
    textAlign: 'center',
    marginBottom: 48,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
    height: 58,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
  },
  button: {
    backgroundColor: '#3177C9',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingStep1;