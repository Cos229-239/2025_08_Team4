import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';


const HEADER_STYLE = { backgroundColor: "#3177C9" };
const HEADER_TITLE = () => (
  <Text
    style={{
      fontFamily: "Pacifico_400Regular", 
      fontSize: 36,
      color: "#FFFFFF",
      textAlign: "center",
    }}
  >
    LucidPaths
  </Text>
);


export default function LoginScreen() {
 
  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

 
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <LinearGradient 
      colors={['#3177C9', '#30F0C8']}
      locations={[0.37, 0.61]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          headerTitle: () => HEADER_TITLE(),
          headerStyle: HEADER_STYLE,
          headerTintColor: '#fff', 
          headerShadowVisible: false,
        }}
      />
      
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Someone@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="********"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Icon
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={22}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
          </View>
          
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  form: {
    width: '85%',
  },
  label: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
    lineHeight: 28,
    letterSpacing: -0.48,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#000000',
  },
  inputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center', 
  },
  button: {
    backgroundColor: '#004496',
    height: 43,
    width: 130,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
  },
});