import { Stack, useRouter } from "expo-router";
import { Text, Pressable, StyleSheet } from "react-native";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { Ionicons } from '@expo/vector-icons';

const HEADER_TITLE = (txt) => (
  <Text
    style={{
      fontFamily: "Pacifico_400Regular",
      fontSize: 40,
      color: "#FFFFFF",
    }}
  >
    {txt}
  </Text>
);

export default function DrawerLayout() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Pacifico_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#3177C9" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerTitle: () => HEADER_TITLE("Settings"),
          headerLeft: () => (
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
          ),
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
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
});