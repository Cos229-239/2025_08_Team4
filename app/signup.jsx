import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TextInput, TouchableOpacity, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import { useGlobalContext } from '../context/GlobalProvider';
import { account, ID } from '../lib/appwrite';
import { getOrCreateProfile } from '../lib/profile';

export default function SignUpScreen() {
  const router = useRouter();
  const { refresh } = useGlobalContext();
  const [fontsLoaded] = useFonts({ Oswald_600SemiBold, OpenSans_700Bold });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await account.create(ID.unique(), email, password);
      await account.createEmailPasswordSession(email, password);
      await getOrCreateProfile();
      await refresh();
      router.replace('/onboarding/step1');
    } catch (error) {
      Alert.alert('Error', error?.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return <ActivityIndicator />;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Hello!</Text>
        <Text style={styles.subtitle}>Register to get started.</Text>

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

        <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="Confirm your password"
              placeholderTextColor="#8A8A8E"
              secureTextEntry={!isConfirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(v => !v)}>
              <Icon name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={22} color="#9CA3AF" />
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
        </TouchableOpacity>

        <View style={styles.signinContainer}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/login')}>
            <Text style={[styles.signinText, styles.signinLink]}>Login Now</Text>
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
    marginBottom: 16,
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
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  signinText: {
    color: '#8A8A8E',
    fontSize: 14,
  },
  signinLink: {
    color: '#3177C9',
    fontWeight: 'bold',
  },
});