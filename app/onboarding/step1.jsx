import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';

const OnboardingStep1 = () => {
  const router = useRouter();
  const [name, setName] = useState('');

  
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageValue, setLanguageValue] = useState(null);
  const [languageItems, setLanguageItems] = useState([
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
  const [pronounItems, setPronounItems] = useState([
    { label: 'She/Her', value: 'she/her' },
    { label: 'He/Him', value: 'he/him' },
    { label: 'They/Them', value: 'they/them' },
    { label: 'Other', value: 'other' },
  ]);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState(null);
  const [countryItems, setCountryItems] = useState([
     { label: 'Afghanistan', value: 'af' },
  { label: 'Albania', value: 'al' },
  { label: 'Algeria', value: 'dz' },
  { label: 'Andorra', value: 'ad' },
  { label: 'Angola', value: 'ao' },
  { label: 'Antigua and Barbuda', value: 'ag' },
  { label: 'Argentina', value: 'ar' },
  { label: 'Armenia', value: 'am' },
  { label: 'Australia', value: 'au' },
  { label: 'Austria', value: 'at' },
  { label: 'Azerbaijan', value: 'az' },
  { label: 'Bahamas', value: 'bs' },
  { label: 'Bahrain', value: 'bh' },
  { label: 'Bangladesh', value: 'bd' },
  { label: 'Barbados', value: 'bb' },
  { label: 'Belarus', value: 'by' },
  { label: 'Belgium', value: 'be' },
  { label: 'Belize', value: 'bz' },
  { label: 'Benin', value: 'bj' },
  { label: 'Bhutan', value: 'bt' },
  { label: 'Bolivia', value: 'bo' },
  { label: 'Bosnia and Herzegovina', value: 'ba' },
  { label: 'Botswana', value: 'bw' },
  { label: 'Brazil', value: 'br' },
  { label: 'Brunei', value: 'bn' },
  { label: 'Bulgaria', value: 'bg' },
  { label: 'Burkina Faso', value: 'bf' },
  { label: 'Burundi', value: 'bi' },
  { label: 'Cabo Verde', value: 'cv' },
  { label: 'Cambodia', value: 'kh' },
  { label: 'Cameroon', value: 'cm' },
  { label: 'Canada', value: 'ca' },
  { label: 'Central African Republic', value: 'cf' },
  { label: 'Chad', value: 'td' },
  { label: 'Chile', value: 'cl' },
  { label: 'China', value: 'cn' },
  { label: 'Colombia', value: 'co' },
  { label: 'Comoros', value: 'km' },
  { label: 'Congo, Democratic Republic of the', value: 'cd' },
  { label: 'Congo, Republic of the', value: 'cg' },
  { label: 'Costa Rica', value: 'cr' },
  { label: 'Cote d\'Ivoire', value: 'ci' },
  { label: 'Croatia', value: 'hr' },
  { label: 'Cuba', value: 'cu' },
  { label: 'Cyprus', value: 'cy' },
  { label: 'Czech Republic', value: 'cz' },
  { label: 'Denmark', value: 'dk' },
  { label: 'Djibouti', value: 'dj' },
  { label: 'Dominica', value: 'dm' },
  { label: 'Dominican Republic', value: 'do' },
  { label: 'Ecuador', value: 'ec' },
  { label: 'Egypt', value: 'eg' },
  { label: 'El Salvador', value: 'sv' },
  { label: 'Equatorial Guinea', value: 'gq' },
  { label: 'Eritrea', value: 'er' },
  { label: 'Estonia', value: 'ee' },
  { label: 'Eswatini', value: 'sz' },
  { label: 'Ethiopia', value: 'et' },
  { label: 'Fiji', value: 'fj' },
  { label: 'Finland', value: 'fi' },
  { label: 'France', value: 'fr' },
  { label: 'Gabon', value: 'ga' },
  { label: 'Gambia', value: 'gm' },
  { label: 'Georgia', value: 'ge' },
  { label: 'Germany', value: 'de' },
  { label: 'Ghana', value: 'gh' },
  { label: 'Greece', value: 'gr' },
  { label: 'Grenada', value: 'gd' },
  { label: 'Guatemala', value: 'gt' },
  { label: 'Guinea', value: 'gn' },
  { label: 'Guinea-Bissau', value: 'gw' },
  { label: 'Guyana', value: 'gy' },
  { label: 'Haiti', value: 'ht' },
  { label: 'Honduras', value: 'hn' },
  { label: 'Hungary', value: 'hu' },
  { label: 'Iceland', value: 'is' },
  { label: 'India', value: 'in' },
  { label: 'Indonesia', value: 'id' },
  { label: 'Iran', value: 'ir' },
  { label: 'Iraq', value: 'iq' },
  { label: 'Ireland', value: 'ie' },
  { label: 'Israel', value: 'il' },
  { label: 'Italy', value: 'it' },
  { label: 'Jamaica', value: 'jm' },
  { label: 'Japan', value: 'jp' },
  { label: 'Jordan', value: 'jo' },
  { label: 'Kazakhstan', value: 'kz' },
  { label: 'Kenya', value: 'ke' },
  { label: 'Kiribati', value: 'ki' },
  { label: 'Kuwait', value: 'kw' },
  { label: 'Kyrgyzstan', value: 'kg' },
  { label: 'Laos', value: 'la' },
  { label: 'Latvia', value: 'lv' },
  { label: 'Lebanon', value: 'lb' },
  { label: 'Lesotho', value: 'ls' },
  { label: 'Liberia', value: 'lr' },
  { label: 'Libya', value: 'ly' },
  { label: 'Liechtenstein', value: 'li' },
  { label: 'Lithuania', value: 'lt' },
  { label: 'Luxembourg', value: 'lu' },
  { label: 'Madagascar', value: 'mg' },
  { label: 'Malawi', value: 'mw' },
  { label: 'Malaysia', value: 'my' },
  { label: 'Maldives', value: 'mv' },
  { label: 'Mali', value: 'ml' },
  { label: 'Malta', value: 'mt' },
  { label: 'Marshall Islands', value: 'mh' },
  { label: 'Mauritania', value: 'mr' },
  { label: 'Mauritius', value: 'mu' },
  { label: 'Mexico', value: 'mx' },
  { label: 'Micronesia', value: 'fm' },
  { label: 'Moldova', value: 'md' },
  { label: 'Monaco', value: 'mc' },
  { label: 'Mongolia', value: 'mn' },
  { label: 'Montenegro', value: 'me' },
  { label: 'Morocco', value: 'ma' },
  { label: 'Mozambique', value: 'mz' },
  { label: 'Myanmar (Burma)', value: 'mm' },
  { label: 'Namibia', value: 'na' },
  { label: 'Nauru', value: 'nr' },
  { label: 'Nepal', value: 'np' },
  { label: 'Netherlands', value: 'nl' },
  { label: 'New Zealand', value: 'nz' },
  { label: 'Nicaragua', value: 'ni' },
  { label: 'Niger', value: 'ne' },
  { label: 'Nigeria', value: 'ng' },
  { label: 'North Korea', value: 'kp' },
  { label: 'North Macedonia', value: 'mk' },
  { label: 'Norway', value: 'no' },
  { label: 'Oman', value: 'om' },
  { label: 'Pakistan', value: 'pk' },
  { label: 'Palau', value: 'pw' },
  { label: 'Palestine', value: 'ps' },
  { label: 'Panama', value: 'pa' },
  { label: 'Papua New Guinea', value: 'pg' },
  { label: 'Paraguay', value: 'py' },
  { label: 'Peru', value: 'pe' },
  { label: 'Philippines', value: 'ph' },
  { label: 'Poland', value: 'pl' },
  { label: 'Portugal', value: 'pt' },
  { label: 'Qatar', value: 'qa' },
  { label: 'Romania', value: 'ro' },
  { label: 'Russia', value: 'ru' },
  { label: 'Rwanda', value: 'rw' },
  { label: 'Saint Kitts and Nevis', value: 'kn' },
  { label: 'Saint Lucia', value: 'lc' },
  { label: 'Saint Vincent and the Grenadines', value: 'vc' },
  { label: 'Samoa', value: 'ws' },
  { label: 'San Marino', value: 'sm' },
  { label: 'Sao Tome and Principe', value: 'st' },
  { label: 'Saudi Arabia', value: 'sa' },
  { label: 'Senegal', value: 'sn' },
  { label: 'Serbia', value: 'rs' },
  { label: 'Seychelles', value: 'sc' },
  { label: 'Sierra Leone', value: 'sl' },
  { label: 'Singapore', value: 'sg' },
  { label: 'Slovakia', value: 'sk' },
  { label: 'Slovenia', value: 'si' },
  { label: 'Solomon Islands', value: 'sb' },
  { label: 'Somalia', value: 'so' },
  { label: 'South Africa', value: 'za' },
  { label: 'South Korea', value: 'kr' },
  { label: 'South Sudan', value: 'ss' },
  { label: 'Spain', value: 'es' },
  { label: 'Sri Lanka', value: 'lk' },
  { label: 'Sudan', value: 'sd' },
  { label: 'Suriname', value: 'sr' },
  { label: 'Sweden', value: 'se' },
  { label: 'Switzerland', value: 'ch' },
  { label: 'Syria', value: 'sy' },
  { label: 'Taiwan', value: 'tw' },
  { label: 'Tajikistan', value: 'tj' },
  { label: 'Tanzania', value: 'tz' },
  { label: 'Thailand', value: 'th' },
  { label: 'Timor-Leste', value: 'tl' },
  { label: 'Togo', value: 'tg' },
  { label: 'Tonga', value: 'to' },
  { label: 'Trinidad and Tobago', value: 'tt' },
  { label: 'Tunisia', value: 'tn' },
  { label: 'Turkey', value: 'tr' },
  { label: 'Turkmenistan', value: 'tm' },
  { label: 'Tuvalu', value: 'tv' },
  { label: 'Uganda', value: 'ug' },
  { label: 'Ukraine', value: 'ua' },
  { label: 'United Arab Emirates', value: 'ae' },
  { label: 'United Kingdom', value: 'gb' },
  { label: 'United States', value: 'us' },
  { label: 'Uruguay', value: 'uy' },
  { label: 'Uzbekistan', value: 'uz' },
  { label: 'Vanuatu', value: 'vu' },
  { label: 'Vatican City', value: 'va' },
  { label: 'Venezuela', value: 've' },
  { label: 'Vietnam', value: 'vn' },
  { label: 'Yemen', value: 'ye' },
  { label: 'Zambia', value: 'zm' },
  { label: 'Zimbabwe', value: 'zw' },
  ]);

  const handleContinue = () => {
 
    if (!name.trim() || !languageValue || !pronounsValue || !countryValue) {
      Alert.alert("Incomplete", "Please fill out all fields to continue.");
      return; 
    }
    

    console.log('User Info:', {
      name: name,
      pronouns: pronounsValue,
      country: countryValue,
      language: languageValue,
    });
    router.push('/onboarding/step2');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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

          <DropDownPicker
            open={languageOpen}
            value={languageValue}
            items={languageItems}
            setOpen={setLanguageOpen}
            setValue={setLanguageValue}
            onOpen={() => { setPronounsOpen(false); setCountryOpen(false); }}
            placeholder="Select a Language"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={3000}
            zIndexInverse={1000}
          />

          <DropDownPicker
            open={pronounsOpen}
            value={pronounsValue}
            items={pronounItems}
            setOpen={setPronounsOpen}
            setValue={setPronounsValue}
            onOpen={() => { setLanguageOpen(false); setCountryOpen(false); }}
            placeholder="Select your Pronouns"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={2000}
            zIndexInverse={2000}
          />

          <DropDownPicker
            open={countryOpen}
            value={countryValue}
            items={countryItems}
            setOpen={setCountryOpen}
            setValue={setCountryValue}
            onOpen={() => { setLanguageOpen(false); setPronounsOpen(false); }}
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