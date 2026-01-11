import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { AudioProvider } from '../contexts/AudioContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { LoadingProvider, GlobalLoadingOverlay } from '../contexts/LoadingContext';
import AudioWidget from '../components/audio/AudioWidget';
import { initializeNotifications, scheduleDailyRefresh } from '../services/notificationService';

function RootLayoutContent() {
  useEffect(() => {
    // Initialize notifications on app start
    initializeNotifications();
    
    // Schedule daily refresh for prayer times
    scheduleDailyRefresh();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
        <Stack.Screen name="almathurat" options={{ title: 'Al-Ma\'thurat' }} />
      </Stack>
      <AudioWidget />
      <GlobalLoadingOverlay />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SettingsProvider>
            <LanguageProvider>
              <LoadingProvider>
                <AuthProvider>
                  <AudioProvider>
                    <RootLayoutContent />
                  </AudioProvider>
                </AuthProvider>
              </LoadingProvider>
            </LanguageProvider>
          </SettingsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

