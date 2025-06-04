import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  setThemeOverride: (theme: ThemeType | null) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => { },
  setThemeOverride: () => { },
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const deviceTheme = useColorScheme() as ThemeType;
  const [themeOverride, setThemeOverride] = useState<ThemeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the effective theme
  const theme: ThemeType = themeOverride || deviceTheme || 'light';

  // Load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('themePreference');
        if (storedTheme) {
          setThemeOverride(storedTheme as ThemeType);
        }
      } catch (err) {
        console.error('ThemeProvider: Failed to load theme preference from AsyncStorage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeOverride(newTheme);

    try {
      await AsyncStorage.setItem('themePreference', newTheme);
    } catch (err) {
      console.error('Failed to save theme preference:', err);
    }
  };

  // Set theme override explicitly
  const handleSetThemeOverride = async (newTheme: ThemeType | null) => {
    setThemeOverride(newTheme);

    try {
      if (newTheme) {
        await AsyncStorage.setItem('themePreference', newTheme);
      } else {
        await AsyncStorage.removeItem('themePreference');
      }
    } catch (err) {
      console.error('Failed to save theme preference:', err);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: deviceTheme === 'dark' ? '#000' : '#fff' }}>
        {children}
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeOverride: handleSetThemeOverride }}>
      {children}
    </ThemeContext.Provider>
  );
};
