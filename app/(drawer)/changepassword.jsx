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
import { useTheme } from '../../context/ThemeContext';
import { account } from '../../lib/appwrite';


export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>Font loading error. Please restart the app.</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerSpacer} />
      </View>
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
          <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Update your account password to keep your account secure</Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
                <View style={[
                  styles.passwordInputContainer,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  errors.currentPassword && [styles.inputError, { borderColor: colors.danger }]
                ]}>
                  <TextInput
                    style={[styles.passwordInput, { color: colors.text }]}
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChangeText={(text) => {
                      setCurrentPassword(text);
                      if (errors.currentPassword) {
                        setErrors(prev => ({ ...prev, currentPassword: undefined }));
                      }
                    }}
                    secureTextEntry={!showCurrentPassword}
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    autoCorrect={false}
                    autoComplete="current-password"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Ionicons 
                      name={showCurrentPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={colors.primary} 
                    />
                  </TouchableOpacity>
                </View>
                {errors.currentPassword && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>{errors.currentPassword}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                <View style={[
                  styles.passwordInputContainer,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  errors.newPassword && [styles.inputError, { borderColor: colors.danger }]
                ]}>
                  <TextInput
                    style={[styles.passwordInput, { color: colors.text }]}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errors.newPassword) {
                        setErrors(prev => ({ ...prev, newPassword: undefined }));
                      }
                    }}
                    secureTextEntry={!showNewPassword}
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    autoCorrect={false}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons 
                      name={showNewPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={colors.primary} 
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>{errors.newPassword}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
                <View style={[
                  styles.passwordInputContainer,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  errors.confirmPassword && [styles.inputError, { borderColor: colors.danger }]
                ]}>
                  <TextInput
                    style={[styles.passwordInput, { color: colors.text }]}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    autoCorrect={false}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={colors.primary} 
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Password Requirements */}
              <View style={[styles.requirementsContainer, { backgroundColor: colors.background, borderLeftColor: colors.primary }]}>
                <Text style={[styles.requirementsTitle, { color: colors.text }]}>Password Requirements:</Text>
                <Text style={[styles.requirementText, { color: colors.textSecondary }]}>• At least 8 characters long</Text>
                <Text style={[styles.requirementText, { color: colors.textSecondary }]}>• Contains uppercase and lowercase letters</Text>
                <Text style={[styles.requirementText, { color: colors.textSecondary }]}>• Contains at least one number</Text>
                <Text style={[styles.requirementText, { color: colors.textSecondary }]}>• Contains at least one special character</Text>
              </View>

              <TouchableOpacity 
                style={[styles.changeButton, { backgroundColor: colors.primary }, isLoading && styles.changeButtonDisabled]} 
                onPress={handleChangePassword}
                disabled={isLoading}
                activeOpacity={0.8}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 100,
    paddingHorizontal: 24,
  },
  formContainer: {
    borderRadius: 15,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  pageTitle: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 16,
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
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderWidth: 2,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
  },
  eyeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(4, 167, 119, 0.1)',
  },
  requirementsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requirementsTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 14,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
  changeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
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
    fontSize: 14,
    marginTop: 6,
    fontFamily: 'OpenSans_700Bold',
  },
});
