import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { account } from '../lib/appwrite';
import { fetchMyProfile, getOrCreateProfile } from '../lib/profile';

const GlobalContext = createContext(null);
export const useGlobalContext = () => useContext(GlobalContext);

export default function GlobalProvider({ children }) {

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

 
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);


  const refreshAuth = async () => {
    const me = await account.get();
    setUser(me);
    setIsLoggedIn(true);
    console.log(`[AUTH] refreshAuth OK userId=${me.$id}`);
    return me;

  };

  const signIn = async (email, password) => {
    const current = await account.get().catch(() => null);
    if (current && (current.email || '').toLowerCase() !== (email || '').toLowerCase()) {
      try { await account.deleteSession('current'); } catch {}
    }
    if (!current || (current.email || '').toLowerCase() !== (email || '').toLowerCase()) {
      await account.createEmailPasswordSession(email, password);
    }
    await refreshAuth();
    await ensureProfile();
  };

  const signInAnon = async () => {
    const cur = await account.get().catch(() => null);
    if (!cur) await account.createAnonymousSession();
    await refreshAuth();
    await ensureProfile();
  };

  const signOut = async () => {
    try { await account.deleteSession('current'); } catch {}
    setUser(null);
    setIsLoggedIn(false);
    setProfile(null);
    console.log('[AUTH] signed out');
  };

  const logSession = async () => {
    try {
      const me = await account.get();
      console.log(`[AUTH] session: TRUE userId=${me.$id}`);
      return me;
    } catch (e) {
      console.log(`[AUTH] session: FALSE (${e?.message})`);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!isLoggedIn) return null;
    setProfileLoading(true);
    try {
      const p = await fetchMyProfile();
      setProfile(p);
      console.log('[PROFILE] refreshProfile ->', p ? p.$id : 'null');
      return p;
    } catch (e) {
      console.log('[PROFILE] refreshProfile error:', e?.message);
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  const ensureProfile = async () => {
    if (!isLoggedIn) return null;
    setProfileLoading(true);
    try {
      const p = await getOrCreateProfile();
      setProfile(p);
      console.log('[PROFILE] ensureProfile ->', p.$id);
      return p;
    } catch (e) {
      console.log('[PROFILE] ensureProfile error:', e?.message);
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshAuth();      
        await refreshProfile();   
      } catch {
        setUser(null);
        setIsLoggedIn(false);
        setProfile(null);
        console.log('[AUTH] bootstrap: no session');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const value = useMemo(() => ({
    isLoading,
    isLoggedIn,
    user,
    refresh: refreshAuth,
    signIn,
    signInAnon,
    signOut,
    logSession,
    profile,
    profileLoading,
    refreshProfile,
    ensureProfile,
  }), [isLoading, isLoggedIn, user, profile, profileLoading]);

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}
