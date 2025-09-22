import { Stack, useRouter } from "expo-router";
import { Text, Pressable, StyleSheet } from "react-native";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { Oswald_600SemiBold } from "@expo-google-fonts/oswald";
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
    Oswald_600SemiBold,
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
          headerStyle: { backgroundColor: "#F8F9FA" }, 
          headerShadowVisible: false, 
          headerTitle: "Settings",
          headerTitleStyle: {
            fontFamily: "Oswald_600SemiBold",
            fontSize: 22,
          },
          headerTintColor: '#212529',
        }}
      />
      <Stack.Screen
        name="editprofile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="changepassword"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reminderschedule"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="about" 
        options={{ 
          headerShown: false,
          headerTitle: () => HEADER_TITLE("About LucidPaths"),
          headerLeft: () => (
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
          ),
        }} 
      />
    <Stack.Screen 
        name="placeholder" 
        options={{ 
          headerTitle: () => HEADER_TITLE("Test DB Connection"),
          headerLeft: () => (
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
          ),
        }} 
      />
      <Stack.Screen
      name="ExampleScreen"
      options={{
        headerTitle: () => HEADER_TITLE("Example Screen"),
        headerLeft: () => (
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </Pressable>
        ),
      }}
      />

         <Stack.Screen
      name="fullGoal"
      options={{
        headerTitle: () => HEADER_TITLE("Goal Details"),
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