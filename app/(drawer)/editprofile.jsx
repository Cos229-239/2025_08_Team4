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
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../../context/GlobalProvider';
import { useTheme } from '../../context/ThemeContext';
import { account } from '../../lib/appwrite';
import { updateProfile, BARRIER_LABEL_TO_CODE } from '../../lib/profile';


export default function EditProfileScreen() {
  const router = useRouter();
  const { user, profile, refresh } = useGlobalContext();
  const { colors } = useTheme();
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
const [showPassword, setShowPassword] = useState(false);

// Barriers state (from step2)
const [selectedBarriers, setSelectedBarriers] = useState([]);

// Goal habits state (from step3)
const [timeSpentValue, setTimeSpentValue] = useState(null);
const [timeGoalValue, setTimeGoalValue] = useState(null);
const [reminderValue, setReminderValue] = useState(null);

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

  // Goal habits dropdown states
  const [timeSpentOpen, setTimeSpentOpen] = useState(false);
  const [timeSpentItems] = useState([
    { label: 'Less than 1 hour', value: 'lt1' },
    { label: '1-5 hours', value: '1-5' },
    { label: '5-10 hours', value: '5-10' },
    { label: '10+ hours', value: '10+' },
  ]);

  const [timeGoalOpen, setTimeGoalOpen] = useState(false);
  const [timeGoalItems] = useState([
    { label: '1-5 hours', value: '1-5' },
    { label: '5-10 hours', value: '5-10' },
    { label: '10-20 hours', value: '10-20' },
    { label: '20+ hours', value: '20+' },
  ]);

  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderItems] = useState([
    { label: 'Daily', value: 'daily' },
    { label: 'Every few days', value: 'fewdays' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ]);

  // Barriers data
  const barriers = [
    'Lack of Motivation',
    'Time Management Issues',
    'Fear of Failure',
    'Lack of Clear Goals',
    'Procrastination',
    'Self-Doubt',
    'Distractions',
    'Overwhelming',
  ];

  // Convert barrier codes back to labels for display
  const convertBarrierCodesToLabels = (barrierCodes) => {
    if (!Array.isArray(barrierCodes)) return [];
    const codeToLabel = Object.fromEntries(
      Object.entries(BARRIER_LABEL_TO_CODE).map(([label, code]) => [code, label])
    );
    return barrierCodes
      .map(code => codeToLabel[code])
      .filter(Boolean);
  };

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
    
    // Load profile data from database
    if (profile) {
      console.log('Loading profile data:', profile);
      setLanguageValue(profile.language || null);
      setPronounsValue(profile.pronouns || null);
      setCountryValue(profile.country || null);
      // Convert barrier codes back to labels for display
      const convertedBarriers = convertBarrierCodesToLabels(profile.barriers || []);
      console.log('Converted barriers:', convertedBarriers);
      setSelectedBarriers(convertedBarriers);
      setTimeSpentValue(profile.timeSpentMonthly || null);
      setTimeGoalValue(profile.timeGoalMonthly || null);
      setReminderValue(profile.reminderFrequency || null);
    }
  }, [user, profile]);

  const handleToggleBarrier = (barrier) => {
    setSelectedBarriers((prev) =>
      prev.includes(barrier) ? prev.filter((b) => b !== barrier) : [...prev, barrier]
    );
  };

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
      // Update the users name in Appwrite
      await account.updateName(name.trim());
      
      // Update email if it has changed (requires password)
      if (email !== user.email) {
        await account.updateEmail(email.trim(), password);
      }
  
      // Convert barrier labels back to codes for saving
      const barrierCodes = selectedBarriers
        .map(label => BARRIER_LABEL_TO_CODE[label])
        .filter(Boolean);

      // Update profile database with the new information
      console.log('Updating profile with data:', {
        name: name.trim(),
        email: email.trim(),
        language: languageValue,
        pronouns: pronounsValue,
        country: countryValue,
        barriers: barrierCodes,
        timeSpentMonthly: timeSpentValue,
        timeGoalMonthly: timeGoalValue,
        reminderFrequency: reminderValue,
      });

      const updatedProfile = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        language: languageValue,
        pronouns: pronounsValue,
        country: countryValue,
        barriers: barrierCodes,
        timeSpentMonthly: timeSpentValue,
        timeGoalMonthly: timeGoalValue,
        reminderFrequency: reminderValue,
      });
      
      console.log('Profile updated successfully:', updatedProfile);
  
      // Update user preferences to keep them in sync
      const prefs = {
        language: languageValue,
        pronouns: pronounsValue,
        country: countryValue,
        onboardingCompleted: user?.prefs?.onboardingCompleted || false,
      };
      await account.updatePrefs(prefs);
  
      // Refresh user data from Appwrite to get the latest information
      await refresh();
  
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
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
            <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Update your personal information and preferences</Text>
              
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Name</Text>
                                  <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  autoCorrect={false}
                  autoComplete="name"
                />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>

                {/* Show email change info when email is being changed */}
                {email !== user?.email && (
                  <View style={[styles.emailChangeContainer, { backgroundColor: colors.background, borderLeftColor: colors.primary }]}>
                    <Text style={[styles.emailChangeTitle, { color: colors.text }]}>Email Change Confirmation</Text>
                    <View style={styles.emailDisplayColumn}>
                      <View style={styles.emailDisplayItem}>
                        <Text style={[styles.emailDisplayLabel, { color: colors.textSecondary }]}>Current Email:</Text>
                        <Text style={[styles.emailDisplayValue, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}>{user?.email || 'Not set'}</Text>
                      </View>
                      <View style={styles.emailDisplayItem}>
                        <Text style={[styles.emailDisplayLabel, { color: colors.textSecondary }]}>New Email:</Text>
                        <Text style={[styles.emailDisplayValue, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}>{email}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {email !== user?.email && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Current Password (required for email change)</Text>
                    <View style={[styles.passwordInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <TextInput
                        style={[styles.passwordInput, { color: colors.text }]}
                        placeholder="Enter your current password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        placeholderTextColor={colors.textSecondary}
                        returnKeyType="done"
                        blurOnSubmit={true}
                        autoCorrect={false}
                        autoComplete="current-password"
                      />
                      <TouchableOpacity 
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons 
                          name={showPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color={colors.primary} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Language</Text>
                  <DropDownPicker
                    open={languageOpen}
                    value={languageValue}
                    items={languageItems}
                    setOpen={setLanguageOpen}
                    setValue={setLanguageValue}
                    onOpen={() => { setPronounsOpen(false); setCountryOpen(false); }}
                    placeholder="Select your preferred language"
                    style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
                    dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: colors.background, borderColor: colors.border }]}
                    textStyle={{ color: colors.text }}
                    placeholderStyle={{ color: colors.textSecondary }}
                    zIndex={3000}
                    zIndexInverse={1000}
                    listMode="SCROLLVIEW"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Pronouns</Text>
                  <DropDownPicker
                    open={pronounsOpen}
                    value={pronounsValue}
                    items={pronounItems}
                    setOpen={setPronounsOpen}
                    setValue={setPronounsValue}
                    onOpen={() => { setLanguageOpen(false); setCountryOpen(false); }}
                    placeholder="Select your pronouns"
                    style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
                    dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: colors.background, borderColor: colors.border }]}
                    textStyle={{ color: colors.text }}
                    placeholderStyle={{ color: colors.textSecondary }}
                    zIndex={2000}
                    zIndexInverse={2000}
                    listMode="SCROLLVIEW"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Country</Text>
                  <DropDownPicker
                    open={countryOpen}
                    value={countryValue}
                    items={countryItems}
                    setOpen={setCountryOpen}
                    setValue={setCountryValue}
                    onOpen={() => { setLanguageOpen(false); setPronounsOpen(false); }}
                    placeholder="Select your country"
                    style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
                    dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: colors.background, borderColor: colors.border }]}
                    textStyle={{ color: colors.text }}
                    placeholderStyle={{ color: colors.textSecondary }}
                    zIndex={1000}
                    zIndexInverse={3000}
                    listMode="SCROLLVIEW"
                  />
                </View>

                <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Challenges & Goals</Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>What's Holding You Back?</Text>
                  <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Select any challenges you face in achieving your goals.</Text>
                  <View style={styles.barriersContainer}>
                    {barriers.map((barrier) => (
                      <TouchableOpacity
                        key={barrier}
                        style={[styles.barrierItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                        onPress={() => handleToggleBarrier(barrier)}
                      >
                        <View style={[
                          styles.checkbox,
                          { borderColor: colors.border },
                          selectedBarriers.includes(barrier) && [styles.checkboxChecked, { backgroundColor: colors.primary, borderColor: colors.primary }]
                        ]}>
                          {selectedBarriers.includes(barrier) && (
                            <Ionicons name="checkmark" size={18} color="white" />
                          )}
                        </View>
                        <Text style={[styles.barrierLabel, { color: colors.text }]}>{barrier}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>How much time do you currently spend on your goals per month?</Text>
                  <DropDownPicker
                    open={timeSpentOpen}
                    value={timeSpentValue}
                    items={timeSpentItems}
                    setOpen={setTimeSpentOpen}
                    setValue={setTimeSpentValue}
                    onOpen={() => { setTimeGoalOpen(false); setReminderOpen(false); setLanguageOpen(false); setPronounsOpen(false); setCountryOpen(false); }}
                    placeholder="Select an option"
                    style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
                    dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: colors.background, borderColor: colors.border }]}
                    textStyle={{ color: colors.text }}
                    placeholderStyle={{ color: colors.textSecondary }}
                    zIndex={6000}
                    zIndexInverse={1000}
                    listMode="SCROLLVIEW"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>How much time would you like to spend?</Text>
                  <DropDownPicker
                    open={timeGoalOpen}
                    value={timeGoalValue}
                    items={timeGoalItems}
                    setOpen={setTimeGoalOpen}
                    setValue={setTimeGoalValue}
                    onOpen={() => { setTimeSpentOpen(false); setReminderOpen(false); setLanguageOpen(false); setPronounsOpen(false); setCountryOpen(false); }}
                    placeholder="Select an option"
                    style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
                    dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: colors.background, borderColor: colors.border }]}
                    textStyle={{ color: colors.text }}
                    placeholderStyle={{ color: colors.textSecondary }}
                    zIndex={5000}
                    zIndexInverse={2000}
                    listMode="SCROLLVIEW"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>How often do you want to be reminded?</Text>
                  <DropDownPicker
                    open={reminderOpen}
                    value={reminderValue}
                    items={reminderItems}
                    setOpen={setReminderOpen}
                    setValue={setReminderValue}
                    onOpen={() => { setTimeSpentOpen(false); setTimeGoalOpen(false); setLanguageOpen(false); setPronounsOpen(false); setCountryOpen(false); }}
                    placeholder="Select an option"
                    style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
                    dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: colors.background, borderColor: colors.border }]}
                    textStyle={{ color: colors.text }}
                    placeholderStyle={{ color: colors.textSecondary }}
                    zIndex={4000}
                    zIndexInverse={3000}
                    listMode="SCROLLVIEW"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: colors.primary }, isLoading && styles.saveButtonDisabled]} 
                  onPress={handleSave}
                  disabled={isLoading}
                  activeOpacity={0.8}
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
  sectionTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 20,
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'left',
  },
  sectionDivider: {
    height: 1,
    marginVertical: 20,
    marginHorizontal: -10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    fontFamily: 'OpenSans_700Bold',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: {
    borderWidth: 2,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
  dropdown: {
    borderRadius: 12,
    borderWidth: 1,
    height: 58,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
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
  emailChangeContainer: {
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
  emailChangeTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  emailDisplayColumn: {
    flexDirection: 'column',
    gap: 12,
  },
  emailDisplayItem: {
    width: '100%',
  },
  emailDisplayLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'OpenSans_700Bold',
  },
  emailDisplayValue: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  subLabel: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  barriersContainer: {
    marginTop: 8,
  },
  barrierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#04A777',
    borderColor: '#04A777',
  },
  barrierLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    flex: 1,
  },
});
