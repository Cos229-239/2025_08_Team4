// app/_layout.jsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="addgoal"
        options={{
          presentation: 'transparentModal',
          animation: 'none',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
