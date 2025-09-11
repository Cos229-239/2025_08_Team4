import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { account } from "../lib/appwrite";
import { getOrCreateProfile } from "../lib/profile";

const GlobalContext = createContext(null);
export const useGlobalContext = () => useContext(GlobalContext);

export default function GlobalProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const p = await getOrCreateProfile();
      setProfile(p);
      return p;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await account.get();
      setUser(me);
      setIsLoggedIn(true);
    } catch {
      setUser(null);
      setIsLoggedIn(false);
      setProfile(null);
      setProfileLoading(false);
      throw new Error("No session");
    }
    await loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch {}
      finally {
        setIsLoading(false);
      }
    })();
  }, [refresh]);

  const signIn = useCallback(async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
    } catch {
      await account.deleteSession("current").catch(() => {});
      await account.createEmailPasswordSession(email, password);
    }
    await refresh();
  }, [refresh]);

  const signInAnon = useCallback(async () => {
    await account.createAnonymousSession();
    await refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await account.deleteSession("current").catch(() => {});
    setUser(null);
    setIsLoggedIn(false);
    setProfile(null);
  }, []);

  const logSession = useCallback(async () => {
    try {
      const me = await account.get();
      console.log(`[AUTH] session: TRUE userId=${me.$id}`);
      return me;
    } catch (e) {
      console.log(`[AUTH] session: FALSE (${e.message})`);
      return null;
    }
  }, []);

  const value = useMemo(() => ({
    isLoading,
    isLoggedIn,
    user,
    profile,
    profileLoading,
    signIn,
    signInAnon,
    signOut,
    refresh,
    logSession,
  }), [isLoading, isLoggedIn, user, profile, profileLoading, signIn, signInAnon, signOut, refresh, logSession]);

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}
