import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../lib/appwrite';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Light theme colors
const lightColors = {
  primary: '#04A777',
  primaryLight: '#E6F6F1',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#212529',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  danger: '#D9534F',
  success: '#28A745',
  warning: '#FFC107',
  info: '#17A2B8',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  // Additional colors for better dark mode support
  surface: '#FFFFFF',
  surfaceVariant: '#F1F3F5',
  onSurface: '#212529',
  onSurfaceVariant: '#6C757D',
  outline: '#E9ECEF',
  outlineVariant: '#F1F3F5',
};

// Dark theme colors
const darkColors = {
  primary: '#04A777',
  primaryLight: '#1A3A2E',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  danger: '#FF6B6B',
  success: '#4CAF50',
  warning: '#FFB74D',
  info: '#64B5F6',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  // Additional colors for better dark mode support
  surface: '#1E1E1E',
  surfaceVariant: '#2A2A2A',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#B0B0B0',
  outline: '#333333',
  outlineVariant: '#2A2A2A',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from user preferences
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const me = await account.get();
        const darkModePreference = me.prefs?.darkMode ?? false;
        setIsDarkMode(darkModePreference);
      } catch (error) {
        console.log('Error loading theme preference:', error);
        // Default to light mode if there's an error
        setIsDarkMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference to user preferences
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      
      // Save to user preferences
      const me = await account.get();
      const prefs = {
        ...me.prefs,
        darkMode: newTheme,
      };
      await account.updatePrefs(prefs);
    } catch (error) {
      console.error('Error saving theme preference:', error);
      // Revert the change if save failed
      setIsDarkMode(!isDarkMode);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  const value = {
    isDarkMode,
    colors,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
