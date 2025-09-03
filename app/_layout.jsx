import { Stack, useRouter, SplashScreen } from "expo-router";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import GlobalProvider, { useGlobalContext } from "../context/GlobalProvider";
import { useEffect } from "react";
import { RightDrawerProvider } from "../components/RightDrawerContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  // STEP 1: Get the 'user' object from your context
  const { isLoading, isLoggedIn, user } = useGlobalContext();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    Pacifico_400Regular,
    Oswald_600SemiBold,
    OpenSans_700Bold
  });

  useEffect(() => {
    if (fontError) throw fontError;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (isLoading ||!fontsLoaded) return;

    // STEP 2: This is the new, smarter redirect logic
    if (isLoggedIn) {
      // Check a preference on the user object (e.g., from Appwrite)
      const hasCompletedOnboarding = user?.prefs?.hasCompletedOnboarding || false;

      if (hasCompletedOnboarding) {
        // If they finished onboarding, go to the main app
        router.replace('/(tabs)');
      } else {
        // If they haven't, send them to onboarding
        router.replace('/onboarding/step');
      }
    } else {
      // If not logged in, go to the welcome screen
      router.replace('/welcomescreen');
    }
    // Add 'user' to the dependency array so this runs when the user object updates
  }, [isLoggedIn, isLoading, fontsLoaded, user]);

  if (!fontsLoaded || isLoading) {
    return null; 
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="welcomescreen" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: true }} />
      <Stack.Screen name="login" options={{ headerShown: true }} />
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      {/* STEP 3: Make sure the onboarding route is defined here */}
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <GlobalProvider>
      <RightDrawerProvider>
        <RootLayoutNav />
      </RightDrawerProvider>
    </GlobalProvider>
  );
}