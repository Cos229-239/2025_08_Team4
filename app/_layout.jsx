// app/_layout.jsx
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../components/AuthContext";

function AuthGate() {
  const { isSignedIn, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "(auth)";
    if (!isSignedIn && !inAuth) {
      router.replace("/(auth)/login");
    } else if (isSignedIn && inAuth) {
      router.replace("/(app)/index");
    }
  }, [isSignedIn, loading, segments, router]);

  if (loading) return null;
  return <Slot key={isSignedIn ? "app" : "auth"} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
