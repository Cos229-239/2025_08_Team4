import { Stack, useRouter, SplashScreen } from "expo-router";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import GlobalProvider, { useGlobalContext } from "../context/GlobalProvider";
import { useEffect } from "react";
import { RightDrawerProvider } from "../components/RightDrawerContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoading, isLoggedIn } = useGlobalContext();
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
    
    if (isLoading || !fontsLoaded) return;

    if (isLoggedIn) {
      router.replace('/(tabs)');
    } else {
      router.replace('/welcomescreen');
    }
  }, [isLoggedIn, isLoading, fontsLoaded]);

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