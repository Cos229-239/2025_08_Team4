import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { account } from '../../lib/appwrite';


export default function ChangePasswordScreen() {
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts({
    Pacifico_400Regular,
    Oswald_600SemiBold,
    OpenSans_700Bold,
  });

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation functions
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('At least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Contains uppercase letters');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Contains lowercase letters');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Contains at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Contains at least one special character');
    }
    
    return errors;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors.join(', ');
      }
    }
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the highlighted fields before continuing.');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Update password using Appwrite
      await account.updatePassword(newPassword, currentPassword);
      
      Alert.alert(
        'Success', 
        'Your password has been updated successfully!', 
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Clear form
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Password update error:', error);
      
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Invalid credentials')) {
          errorMessage = 'Current password is incorrect. Please try again.';
          setErrors({ currentPassword: 'Current password is incorrect' });
        } else if (error.message.includes('Password must be at least 8 characters')) {
          errorMessage = 'Password must be at least 8 characters long.';
          setErrors({ newPassword: 'Password must be at least 8 characters long' });
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  if (fontError) {
    console.error('Font loading error:', fontError);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Font loading error. Please restart the app.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3177C9" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
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
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          enabled={false}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            bounces={false}
            overScrollMode="never"
            keyboardDismissMode="on-drag"
            scrollEventThrottle={16}
          >
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Security</Text>
              <Text style={styles.subtitle}>Update your account password to keep your account secure</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={[
                  styles.passwordInputContainer,
                  errors.currentPassword && styles.inputError
                ]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChangeText={(text) => {
                      setCurrentPassword(text);
                      if (errors.currentPassword) {
                        setErrors(prev => ({ ...prev, currentPassword: undefined }));
                      }
                    }}
                    secureTextEntry={!showCurrentPassword}
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    autoCorrect={false}
                    autoComplete="current-password"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Text style={styles.eyeButtonText}>
                      {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.currentPassword && (
                  <Text style={styles.errorText}>{errors.currentPassword}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={[
                  styles.passwordInputContainer,
                  errors.newPassword && styles.inputError
                ]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errors.newPassword) {
                        setErrors(prev => ({ ...prev, newPassword: undefined }));
                      }
                    }}
                    secureTextEntry={!showNewPassword}
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    autoCorrect={false}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Text style={styles.eyeButtonText}>
                      {showNewPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.newPassword && (
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={[
                  styles.passwordInputContainer,
                  errors.confirmPassword && styles.inputError
                ]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    autoCorrect={false}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.eyeButtonText}>
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <Text style={styles.requirementText}>• At least 8 characters long</Text>
                <Text style={styles.requirementText}>• Contains uppercase and lowercase letters</Text>
                <Text style={styles.requirementText}>• Contains at least one number</Text>
                <Text style={styles.requirementText}>• Contains at least one special character</Text>
              </View>

              <TouchableOpacity 
                style={[styles.changeButton, isLoading && styles.changeButtonDisabled]} 
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.changeButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3177C9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 100,
    paddingHorizontal: 24,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    borderWidth: 2,
    borderColor: '#2A6BB8',
  },
  sectionTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 24,
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: '#333333',
  },
  eyeButton: {
    padding: 8,
  },
  eyeButtonText: {
    fontSize: 18,
  },
  requirementsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3177C9',
  },
  requirementsTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 18,
  },
  changeButton: {
    backgroundColor: '#3177C9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  changeButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Oswald_600SemiBold',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginTop: 6,
    fontFamily: 'OpenSans_700Bold',
  },
});
