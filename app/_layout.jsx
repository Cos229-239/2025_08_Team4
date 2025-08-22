import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../components/AuthContext";

function AuthGate() {
  const { isSignedIn, loading } = useAuth();
  const segments = useSegments();   // e.g. ["(auth)","login"] or ["(app)","index"]
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    const inApp  = segments[0] === "(app)";

    if (!isSignedIn && !inAuth) {
      router.replace("/(auth)/login");
    } else if (isSignedIn && inAuth) {
      router.replace("/(app)/index");
    }
  }, [isSignedIn, loading, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
