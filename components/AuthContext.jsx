import { createContext, useContext, useMemo, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const AuthCtx = createContext({
  isSignedIn: false,
  signIn: async (_token) => {},
  signOut: async () => {},
  loading: true,
});

export function AuthProvider({ children }) {
  const [isSignedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("auth_token");
      setSignedIn(!!token);
      setLoading(false);
    })();
  }, []);

  const signIn = async (token = "demo") => {
    await SecureStore.setItemAsync("auth_token", token);
    setSignedIn(true);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("auth_token");
    setSignedIn(false);
  };

  const value = useMemo(() => ({ isSignedIn, signIn, signOut, loading }), [isSignedIn, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
