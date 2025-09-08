import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import { useGlobalContext } from '../../context/GlobalProvider';
import { account } from '../../lib/appwrite';
import { getOrCreateProfile, updateProfile } from '../../lib/profile';

export default function OnboardingStep4() {
  const router = useRouter();
  const { isLoading, refresh, logSession } = useGlobalContext();

  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const [saving, setSaving] = useState(false);

  const [fontsLoaded] = useFonts({
    Pacifico_400Regular,
    OpenSans_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    Animated.sequence([
      Animated.timing(titleFadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(buttonFadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, [fontsLoaded, titleFadeAnim, buttonFadeAnim]);

  useEffect(() => {
    if (isLoading) return;
    (async () => {
      try { await logSession(); } catch {}
    })();
  }, [isLoading, logSession]);

const handleFinishOnboarding = async () => {
  if (saving) return; // guard double taps
  setSaving(true);

  try {
    console.log('[Step4] start');
    // 1) Ensure a profile exists and mark onboardingCompleted in the profiles table
    const profile = await getOrCreateProfile();
    console.log('[Step4] profile ready:', profile.$id);
    await updateProfile({ onboardingCompleted: true });
    console.log('[Step4] profiles.onboardingCompleted = true');

    // 2) Mirror to account prefs (RootLayout uses user.prefs.onboardingCompleted)
    try {
      const me = await account.get();
      await account.updatePrefs({ ...me.prefs, onboardingCompleted: true });
      console.log('[Step4] account.prefs.onboardingCompleted = true');
    } catch (err) {
      // Not fatal if profile has been updated; just log
      console.log('[Step4] prefs mirror failed:', err?.message);
    }

    // 3) Refresh global user and continue
    await refresh();
    console.log('[Step4] refresh complete → navigating');
    router.replace('/');
  } catch (error) {
    console.error('Error finishing onboarding:', error);
  } finally {
    setSaving(false);
  }
};

  if (!fontsLoaded || isLoading) return null;

  return (
    <LinearGradient colors={['#3177C9', '#30F0C8']} style={styles.container}>
      <SafeAreaView style={styles.content}>
        <Animated.View style={{ opacity: titleFadeAnim }}>
          <Text style={styles.title}>Welcome to LucidPaths</Text>
        </Animated.View>

        <Animated.View style={{ opacity: buttonFadeAnim, marginTop: 100 }}>
          <TouchableOpacity style={[styles.button, saving && { opacity: 0.7 }]} onPress={handleFinishOnboarding} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Start My Journey'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 48,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#3177C9',
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
  },
});
