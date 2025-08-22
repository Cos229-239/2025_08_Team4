// app/(drawer)/_layout.jsx
import { Stack } from "expo-router";

export default function HiddenGroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      
    />
  );
}
