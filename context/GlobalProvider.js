import { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../lib/appwrite';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentAccount = await account.get();
        if (currentAccount) {
          setIsLoggedIn(true);
          setUser(currentAccount);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        
        setIsLoggedIn(false);
        setUser(null);
        console.log('No active session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        isLoading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;