import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { LinearGradient } from 'expo-linear-gradient';
import { account } from '../lib/appwrite';

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
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
    Pacifico_400Regular,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }
    try {
      await account.createEmailPasswordSession(email, password);
      router.replace('/');
    } catch (error) {
      alert(error.message);
    }
  };

  if (!fontsLoaded) {
    return null;
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
          headerTransparent: true,
          headerTintColor: '#fff', 
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
              <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
          </View>
          
          {/* --- NEW SIGN UP LINK --- */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/signup')}>
              <Text style={[styles.signupText, styles.signupLink]}>Sign up here</Text>
            </Pressable>
          </View>
          
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  safeArea: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  form: { 
    width: '85%' 
  },
  label: { 
    fontFamily: 'Oswald_600SemiBold', 
    fontSize: 24, 
    color: '#FFFFFF', 
    lineHeight: 28, 
    letterSpacing: -0.48, 
    marginBottom: 8, 
    textShadowColor: 'rgba(0, 0, 0, 0.75)', 
    textShadowOffset: {width: -1, height: 1}, 
    textShadowRadius: 10 
  },
  input: { 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: 10, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    fontSize: 16, 
    color: '#111827', 
    marginBottom: 30, 
    borderWidth: 1, 
    borderColor: '#000000' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: 10, 
    paddingHorizontal: 15, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#000000' 
  },
  inputField: { 
    flex: 1, 
    paddingVertical: 12, 
    fontSize: 16, 
    color: '#111827' 
  },
  buttonContainer: { 
    width: '100%', 
    alignItems: 'center' 
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
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.30, 
    shadowRadius: 4.65, 
    elevation: 8 
  },
  buttonText: { 
    fontFamily: 'Oswald_600SemiBold', 
    fontSize: 24, 
    color: '#FFFFFF' 
  },
  // --- NEW STYLES FOR SIGN UP LINK ---
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  signupText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  signupLink: {
    fontWeight: 'bold',
  },
});