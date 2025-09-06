// context/GlobalProvider.js
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { account } from "../lib/appwrite";

const GlobalContext = createContext(null);
export const useGlobalContext = () => useContext(GlobalContext);

export default function GlobalProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  async function refresh() {
    const me = await account.get(); // throws if no session
    setUser(me);
    setIsLoggedIn(true);
    return me;
  }

  async function signIn(email, password) {
    const current = await account.get().catch(() => null);
    if (current && (current.email || "").toLowerCase() !== (email || "").toLowerCase()) {
      try { await account.deleteSession("current"); } catch {}
    }
    if (!current || (current.email || "").toLowerCase() !== (email || "").toLowerCase()) {
      await account.createEmailPasswordSession(email, password);
    }
    return refresh();
  }

  async function signInAnon() {
    const current = await account.get().catch(() => null);
    if (current) return current;
    await account.createAnonymousSession();
    return refresh();
  }

  async function signOut() {
    try { await account.deleteSession("current"); } catch {}
    setUser(null);
    setIsLoggedIn(false);
  }

  // 🔊 One-liner you can call anywhere to log session status
  async function logSession() {
    try {
      const me = await account.get();
      console.log(`[AUTH] session: TRUE userId=${me.$id}`);
      return me;
    } catch (e) {
      console.log(`[AUTH] session: FALSE (${e.message})`);
      return null;
    }
  }

  useEffect(() => {
    (async () => {
      try { await refresh(); }
      catch { setUser(null); setIsLoggedIn(false); }
      finally { setIsLoading(false); }
    })();
  }, []);

  // 🔊 Also log on every auth state change
  useEffect(() => {
    if (isLoading) return;
    if (isLoggedIn && user) {
      console.log(`[AUTH] state -> TRUE userId=${user.$id}`);
    } else {
      console.log("[AUTH] state -> FALSE");
    }
  }, [isLoading, isLoggedIn, user]);

  const value = useMemo(
    () => ({ isLoading, isLoggedIn, user, signIn, signInAnon, signOut, refresh, logSession }),
    [isLoading, isLoggedIn, user]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}
