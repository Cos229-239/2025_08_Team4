// app/_layout.jsx
import { Stack, SplashScreen, Redirect } from "expo-router";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { Oswald_600SemiBold } from "@expo-google-fonts/oswald";
import { OpenSans_700Bold } from "@expo-google-fonts/open-sans";
import GlobalProvider, { useGlobalContext } from "../context/GlobalProvider";
import { useEffect, useState } from "react";
import { RightDrawerProvider } from "../components/RightDrawerContext";
import { getOrCreateProfile } from "../lib/profile";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoading, isLoggedIn } = useGlobalContext();
  const [profileDone, setProfileDone] = useState(null); // null = loading, true/false when known

  const [fontsLoaded, fontError] = useFonts({
    Pacifico_400Regular,
    Oswald_600SemiBold,
    OpenSans_700Bold,
  });

  useEffect(() => {
    if (fontError) throw fontError;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isLoggedIn) {
        setProfileDone(null);
        return;
      }
      try {
        const prof = await getOrCreateProfile();
        if (!cancelled) setProfileDone(!!prof?.onboardingCompleted);
      } catch (e) {
        if (!cancelled) setProfileDone(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  if (!fontsLoaded || isLoading) return null;

  let href = null;
  if (!isLoggedIn) href = "/welcomescreen";
  else if (profileDone === null) href = null; // still loading profile
  else if (profileDone) href = "/(tabs)";
  else href = "/onboarding/step1";

  return (
    <>
      {href && <Redirect href={href} />}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="welcomescreen" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GlobalProvider>
      <RightDrawerProvider>
        <RootLayoutNav />
      </RightDrawerProvider>
    </GlobalProvider>
  );
}
