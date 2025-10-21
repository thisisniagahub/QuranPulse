/**
 * Jest Test Setup
 * Global configuration and mocks for all tests
 */

import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test_anon_key_for_jest_testing_only';
process.env.EXPO_PUBLIC_GLM_API_KEY = 'test_glm_api_key_for_jest';
process.env.EXPO_PUBLIC_GLM_API_URL = 'https://test.api.com';
process.env.EXPO_PUBLIC_QURAN_API_BASE = 'https://test.quran.api';
process.env.EXPO_PUBLIC_PRAYER_API_BASE = 'https://test.prayer.api';
process.env.EXPO_PUBLIC_HADITH_API_BASE = 'https://test.hadith.api';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
  clear: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test_anon_key',
      glmApiKey: 'test_glm_key',
      glmApiUrl: 'https://test.api.com',
    },
  },
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: {
    Balanced: 3,
  },
}));

// Mock expo-av (Audio)
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
    setAudioModeAsync: jest.fn(),
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: 'Stack',
}));

// Suppress console errors in tests unless explicitly needed
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
