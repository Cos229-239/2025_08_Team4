import React, { useState, useEffect } from 'react';
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
  Pressable,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from '../../context/GlobalProvider';
import { account } from '../../lib/appwrite';

const HEADER_TITLE = () => (
  <Text
    style={{
      fontFamily: "Pacifico_400Regular",
      fontSize: 36,
      color: "#FFFFFF",
      textAlign: "center",
    }}
  >
    Edit Profile
  </Text>
);

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useGlobalContext();
  const [fontsLoaded, fontError] = useFonts({
    Pacifico_400Regular,
    Oswald_600SemiBold,
    OpenSans_700Bold,
  });

// Form state
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [isLoading, setIsLoading] = useState(false);

  // Dropdown states
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageValue, setLanguageValue] = useState(null);
  const [languageItems] = useState([
    { label: 'Arabic', value: 'ar' },
    { label: 'Bengali', value: 'bn' },
    { label: 'Chinese (Simplified)', value: 'zh-Hans' },
    { label: 'Chinese (Traditional)', value: 'zh-Hant' },
    { label: 'Dutch', value: 'nl' },
    { label: 'English', value: 'en' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Indonesian', value: 'id' },
    { label: 'Italian', value: 'it' },
    { label: 'Japanese', value: 'ja' },
    { label: 'Korean', value: 'ko' },
    { label: 'Malay', value: 'ms' },
    { label: 'Polish', value: 'pl' },
    { label: 'Portuguese', value: 'pt' },
    { label: 'Punjabi', value: 'pa' },
    { label: 'Russian', value: 'ru' },
    { label: 'Spanish', value: 'es' },
    { label: 'Swedish', value: 'sv' },
    { label: 'Tamil', value: 'ta' },
    { label: 'Telugu', value: 'te' },
    { label: 'Thai', value: 'th' },
    { label: 'Turkish', value: 'tr' },
    { label: 'Ukrainian', value: 'uk' },
    { label: 'Urdu', value: 'ur' },
    { label: 'Vietnamese', value: 'vi' },
  ]);

  const [pronounsOpen, setPronounsOpen] = useState(false);
  const [pronounsValue, setPronounsValue] = useState(null);
  const [pronounItems] = useState([
    { label: 'She/Her', value: 'she/her' },
    { label: 'He/Him', value: 'he/him' },
    { label: 'They/Them', value: 'they/them' },
    { label: 'Other', value: 'other' },
  ]);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState(null);
  const [countryItems] = useState([
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'United Kingdom', value: 'gb' },
    { label: 'Australia', value: 'au' },
    { label: 'Germany', value: 'de' },
    { label: 'France', value: 'fr' },
    { label: 'Spain', value: 'es' },
    { label: 'Italy', value: 'it' },
    { label: 'Japan', value: 'jp' },
    { label: 'China', value: 'cn' },
    { label: 'India', value: 'in' },
    { label: 'Brazil', value: 'br' },
    { label: 'Mexico', value: 'mx' },
    { label: 'Argentina', value: 'ar' },
    { label: 'South Africa', value: 'za' },
    { label: 'Nigeria', value: 'ng' },
    { label: 'Egypt', value: 'eg' },
    { label: 'Russia', value: 'ru' },
    { label: 'Turkey', value: 'tr' },
    { label: 'Other', value: 'other' },
  ]);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      // Load preferences if they exist
      if (user.prefs) {
        setLanguageValue(user.prefs.language || null);
        setPronounsValue(user.prefs.pronouns || null);
        setCountryValue(user.prefs.country || null);
      }
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }
  
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
  
    // Check if email is changing and password is provided
    if (email !== user.email && !password.trim()) {
      Alert.alert('Error', 'Please enter your current password to change your email address.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Update user preferences
      const prefs = {
        language: languageValue,
        pronouns: pronounsValue,
        country: countryValue,
        onboardingCompleted: user?.prefs?.onboardingCompleted || false,
      };
  
      // Update the users name in Appwrite
      await account.updateName(name.trim());
      
      // Update email if it has changed (requires password)
      if (email !== user.email) {
        await account.updateEmail(email.trim(), password);
      }
  
      // Update user preferences
      await account.updatePrefs(prefs);
  
      // Update local user state
      const updatedUser = {
        ...user,
        name: name.trim(),
        email: email.trim(),
        prefs: prefs,
      };
      setUser(updatedUser);
  
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // font loading errors
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
      <Stack.Screen
        options={{
          headerTitle: () => HEADER_TITLE(),
          headerTransparent: true,
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
          ),
        }}
      />
      
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
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name</Text>
                                  <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  autoCorrect={false}
                  autoComplete="name"
                />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>

                 
                {email !== user?.email && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Current Password (required for email change)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your current password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={true}
                      placeholderTextColor="#9CA3AF"
                      returnKeyType="done"
                      blurOnSubmit={true}
                      autoCorrect={false}
                      autoComplete="current-password"
                    />
                  </View>
                )}

                <Text style={styles.sectionTitle}>Preferences</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Language</Text>
                  <DropDownPicker
                    open={languageOpen}
                    value={languageValue}
                    items={languageItems}
                    setOpen={setLanguageOpen}
                    setValue={setLanguageValue}
                    onOpen={() => { setPronounsOpen(false); setCountryOpen(false); }}
                    placeholder="Select your preferred language"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    zIndex={3000}
                    zIndexInverse={1000}
                    listMode="SCROLLVIEW"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Pronouns</Text>
                  <DropDownPicker
                    open={pronounsOpen}
                    value={pronounsValue}
                    items={pronounItems}
                    setOpen={setPronounsOpen}
                    setValue={setPronounsValue}
                    onOpen={() => { setLanguageOpen(false); setCountryOpen(false); }}
                    placeholder="Select your pronouns"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    zIndex={2000}
                    zIndexInverse={2000}
                    listMode="SCROLLVIEW"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Country</Text>
                  <DropDownPicker
                    open={countryOpen}
                    value={countryValue}
                    items={countryItems}
                    setOpen={setCountryOpen}
                    setValue={setCountryValue}
                    onOpen={() => { setLanguageOpen(false); setPronounsOpen(false); }}
                    placeholder="Select your country"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    zIndex={1000}
                    zIndexInverse={3000}
                    listMode="SCROLLVIEW"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
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
    paddingTop: 120,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Oswald_600SemiBold',
  },
  sectionTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 20,
    color: '#333333',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
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
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontFamily: 'OpenSans_700Bold',
    color: '#333333',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    height: 58,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: '#3177C9',
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
  saveButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Oswald_600SemiBold',
  },
});
