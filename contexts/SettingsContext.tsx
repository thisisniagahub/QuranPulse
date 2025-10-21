/**
 * Settings Context
 * Manage app settings including font size
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'app_settings';

export interface AppSettings {
  // Font sizes
  arabicFontSize: number;
  translationFontSize: number;
  transliterationFontSize: number;
  
  // Display settings
  showTranslation: boolean;
  showTransliteration: boolean;
  showTajweed: boolean;
  showVerseNumbers: boolean;
  
  // Reading settings
  autoScroll: boolean;
  autoScrollSpeed: number;
  highlightVerse: boolean;
  wordByWord: boolean;
  
  // Audio settings
  repeatVerse: boolean;
  repeatCount: number;
  autoPlayNext: boolean;
  playbackSpeed: number;
  
  // Notification settings
  dailyReminder: boolean;
  reminderTime: string;
  prayerNotifications: boolean;
  
  // Privacy settings
  shareStatistics: boolean;
  publicProfile: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  // Font sizes
  arabicFontSize: 28,
  translationFontSize: 16,
  transliterationFontSize: 14,
  
  // Display settings
  showTranslation: true,
  showTransliteration: false,
  showTajweed: false,
  showVerseNumbers: true,
  
  // Reading settings
  autoScroll: false,
  autoScrollSpeed: 1,
  highlightVerse: true,
  wordByWord: false,
  
  // Audio settings
  repeatVerse: false,
  repeatCount: 3,
  autoPlayNext: true,
  playbackSpeed: 1,
  
  // Notification settings
  dailyReminder: true,
  reminderTime: '09:00',
  prayerNotifications: true,
  
  // Privacy settings
  shareStatistics: true,
  publicProfile: true,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  
  // Font size helpers
  increaseFontSize: (type: 'arabic' | 'translation' | 'transliteration') => Promise<void>;
  decreaseFontSize: (type: 'arabic' | 'translation' | 'transliteration') => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    await saveSettings(DEFAULT_SETTINGS);
  };

  const increaseFontSize = async (type: 'arabic' | 'translation' | 'transliteration') => {
    const key = `${type}FontSize` as keyof AppSettings;
    const currentSize = settings[key] as number;
    const maxSize = type === 'arabic' ? 48 : 24;
    
    if (currentSize < maxSize) {
      await updateSetting(key, (currentSize + 2) as any);
    }
  };

  const decreaseFontSize = async (type: 'arabic' | 'translation' | 'transliteration') => {
    const key = `${type}FontSize` as keyof AppSettings;
    const currentSize = settings[key] as number;
    const minSize = type === 'arabic' ? 18 : 12;
    
    if (currentSize > minSize) {
      await updateSetting(key, (currentSize - 2) as any);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateSettings,
        resetSettings,
        increaseFontSize,
        decreaseFontSize,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Font size presets
export const FONT_SIZE_PRESETS = {
  arabic: {
    small: 24,
    medium: 28,
    large: 32,
    xlarge: 36,
  },
  translation: {
    small: 14,
    medium: 16,
    large: 18,
    xlarge: 20,
  },
  transliteration: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
  },
};

// Utility functions
export function getFontSizeLabel(size: number, type: 'arabic' | 'translation' | 'transliteration'): string {
  const presets = FONT_SIZE_PRESETS[type];
  
  if (size <= presets.small) return 'Small';
  if (size <= presets.medium) return 'Medium';
  if (size <= presets.large) return 'Large';
  return 'Extra Large';
}
