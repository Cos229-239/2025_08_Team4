import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TextInput, TouchableOpacity, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans'; 
import { useGlobalContext } from '../context/GlobalProvider';
import Icon from 'react-native-vector-icons/Feather';

const LOGIN_SUCCESS_REDIRECT = '/';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useGlobalContext();
  const [fontsLoaded] = useFonts({ Oswald_600SemiBold, OpenSans_700Bold });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    try {
      setBusy(true);
      await signIn(email, password);
      router.replace(LOGIN_SUCCESS_REDIRECT);
    } catch (error) {
      Alert.alert('Error', error?.message ?? 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  if (!fontsLoaded) return <ActivityIndicator />;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>Glad to see you. Again!</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#8A8A8E"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        
        <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your password"
              placeholderTextColor="#8A8A8E"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(v => !v)}>
              <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={22} color="#9CA3AF" />
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>

        <Text style={styles.orText}>Or Login with</Text>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text style={[styles.signupText, styles.signupLink]}>Register Now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 32,
    color: '#37CAA9',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 16,
    color: '#8A8A8E',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 20,
  },
  inputField: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#37CAA9',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
  },
  orText: {
    fontSize: 14,
    color: '#8A8A8E',
    textAlign: 'center',
    marginVertical: 30,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  signupText: {
    color: '#8A8A8E',
    fontSize: 14,
  },
  signupLink: {
    color: '#3177C9',
    fontWeight: 'bold',
  },
});