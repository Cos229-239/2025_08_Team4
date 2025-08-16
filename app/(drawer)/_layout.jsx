// app/(drawer)/_layout.jsx
import { Stack } from "expo-router";

export default function HiddenGroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#004496" },
        headerTintColor: "#fff",
      }}
    />
  );
}
