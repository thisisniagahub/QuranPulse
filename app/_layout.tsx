import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'reacimport { AuthProvider } from '../contexts/AuthContext';
import { AudioProvider } from '../contexts/AudioContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { LoadingProvider, GlobalLoadingOverlay } from '../contexts/LoadingContext';
import AudioWidget from '../components/audio/AudioWidget';
import { initializeNotifications, scheduleDailyRefresh } from '../services/notificationService';onService';

function RootLayoutContent() {
  useEffect(() => {
    // Initialize notifications on app start
    initializeNotifications();
    
    // Schedule daily refresh for prayer times
    scheduleDailyRefresh();  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      </Stack>
      <AudioWidget />
      <GlobalLoadingOverlay />
    </>
  );Widget />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
        </ThemeProvider>ider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
