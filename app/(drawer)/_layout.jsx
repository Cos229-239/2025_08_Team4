// app/(drawer)/_layout.jsx
import { Stack } from "expo-router";

export default function DrawerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#3177C9" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontSize: 18, fontWeight: "600" },
      }}
    >
      <Stack.Screen 
        name="welcomescreen" 
        options={{ 
          title: "Welcome",
          headerTitleAlign: "center",
          headerStyle: { 
            backgroundColor: "#3177C9",
            height: 20 
          },
          headerTitleStyle: { 
            fontSize: 16,
            fontWeight: "600" 
          }
        }} 
      />
      <Stack.Screen 
        name="about" 
        options={{ 
          title: "About",
          headerTitleAlign: "center"
        }} 
      />
      <Stack.Screen 
        name="placeholder" 
        options={{ 
          title: "Placeholder",
          headerTitleAlign: "center"
        }} 
      />
      <Stack.Screen 
        name="test" 
        options={{ 
          title: "Test",
          headerTitleAlign: "center"
        }} 
      />
    </Stack>
  );
}
