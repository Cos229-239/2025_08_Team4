import { Stack, useRouter } from "expo-router";
import { Text, Pressable, StyleSheet } from "react-native";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { Oswald_600SemiBold } from "@expo-google-fonts/oswald";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "../../context/ThemeContext";

const HEADER_TITLE = (txt, colors) => (
  <Text
    style={{
      fontFamily: "Pacifico_400Regular",
      fontSize: 40,
      color: colors.text,
    }}
  >
    {txt}
  </Text>
);

export default function DrawerLayout() {
  const router = useRouter();
  const { colors } = useTheme();
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
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen
        name="settings"
        options={{
          headerStyle: { backgroundColor: colors.background }, 
          headerShadowVisible: false, 
          headerTitle: "Settings",
          headerTitleStyle: {
            fontFamily: "Oswald_600SemiBold",
            fontSize: 22,
            color: colors.text,
          },
          headerTintColor: colors.text,
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
        name="test-notifications"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="about" 
        options={{ 
          headerShown: false,
          headerTitle: () => HEADER_TITLE("About LucidPaths", colors),
          headerLeft: () => (
            <Pressable style={[styles.backButton, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
          ),
        }} 
      />
    <Stack.Screen 
        name="placeholder" 
        options={{ 
          headerTitle: () => HEADER_TITLE("Test DB Connection", colors),
          headerLeft: () => (
            <Pressable style={[styles.backButton, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
          ),
        }} 
      />
      <Stack.Screen
      name="ExampleScreen"
      options={{
        headerTitle: () => HEADER_TITLE("Example Screen", colors),
        headerLeft: () => (
          <Pressable style={[styles.backButton, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </Pressable>
        ),
      }}
      />

         <Stack.Screen
      name="fullGoal"
      options={{
        headerTitle: () => HEADER_TITLE("Goal Details", colors),
        headerLeft: () => (
          <Pressable style={[styles.backButton, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => router.back()}>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    borderWidth: 2, 
  },
});