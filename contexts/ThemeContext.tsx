/**
 * Theme Context
 * Manage app theme (dark/light mode)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app_theme';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  card: string;
  
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Borders
  border: string;
  borderLight: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Accent colors
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Special
  overlay: string;
  ripple: string;
  shadow: string;
}

const lightColors: ThemeColors = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: '#FFFFFF',
  
  // Text
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  
  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Primary colors
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',
  
  // Accent colors
  accent: '#0EA5E9',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Special
  overlay: 'rgba(0, 0, 0, 0.5)',
  ripple: 'rgba(16, 185, 129, 0.2)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const darkColors: ThemeColors = {
  // Backgrounds
  background: '#111827',
  surface: '#1F2937',
  card: '#1F2937',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  
  // Borders
  border: '#374151',
  borderLight: '#1F2937',
  
  // Primary colors
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',
  
  // Accent colors
  accent: '#0EA5E9',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Special
  overlay: 'rgba(0, 0, 0, 0.7)',
  ripple: 'rgba(16, 185, 129, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(darkColors);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    updateColors();
  }, [theme, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const updateColors = () => {
    let isDarkMode = false;
    
    if (theme === 'system') {
      isDarkMode = systemColorScheme === 'dark';
    } else {
      isDarkMode = theme === 'dark';
    }
    
    setIsDark(isDarkMode);
    setColors(isDarkMode ? darkColors : lightColors);
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        isDark,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme presets for specific screens
export const themePresets = {
  reading: {
    light: {
      background: '#FDF6E3',
      text: '#073642',
      accent: '#859900',
    },
    dark: {
      background: '#002B36',
      text: '#839496',
      accent: '#268BD2',
    },
    sepia: {
      background: '#F4ECD8',
      text: '#5C4033',
      accent: '#8B4513',
    },
  },
};

// Utility functions
export function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
