import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RECITERS } from '../constants/reciters';
import { PRAYER_ZONES } from '../constants/prayerZones';
import {
  getNotificationSettings,
  updateNotificationSettings,
  showTestNotification
} from '../services/notificationService';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [settings, setSettings] = useState({
    arabicFontSize: 24,
    translationFontSize: 16,
    showTranslation: true,
    showTransliteration: false,
    defaultReciter: 7, // Mishary Al-Afasy
    prayerNotifications: true,
    prayerZone: 'WLY01', // Kuala Lumpur default
    playbackSpeed: 1.0,
    darkMode: true,
    autoScroll: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    offsetMinutes: 15,
    sound: true,
    vibrate: true,
  });

  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  useEffect(() => {
    loadSettings();
    loadNotificationSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const settings = await getNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const selectedReciter = RECITERS.find(r => r.id === settings.defaultReciter);
  const selectedZone = PRAYER_ZONES.find(z => z.code === settings.prayerZone);

  const renderSettingRow = (
    icon: string,
    title: string,
    description: string,
    content: React.ReactNode
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color="#10B981" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {content}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your app experience</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL</Text>

          {/* Language Selector */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="language" size={24} color="#0dcaf0" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingDescription}>
                {language === 'ms' ? 'Bahasa Melayu' : language === 'en' ? 'English' : 'Bahasa Indonesia'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {showLanguagePicker && (
            <View style={styles.picker}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  language === 'ms' && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  setLanguage('ms');
                  setShowLanguagePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    language === 'ms' && styles.pickerItemTextSelected,
                  ]}
                >
                  🇲🇾 Bahasa Melayu
                </Text>
                {language === 'ms' && (
                  <Ionicons name="checkmark" size={20} color="#0dcaf0" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  language === 'en' && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  setLanguage('en');
                  setShowLanguagePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    language === 'en' && styles.pickerItemTextSelected,
                  ]}
                >
                  🇬🇧 English
                </Text>
                {language === 'en' && (
                  <Ionicons name="checkmark" size={20} color="#0dcaf0" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  language === 'ar' && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  setLanguage('ar');
                  setShowLanguagePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    language === 'ar' && styles.pickerItemTextSelected,
                  ]}
                >
                  🇸🇦 العربية
                </Text>
                {language === 'ar' && (
                  <Ionicons name="checkmark" size={20} color="#0dcaf0" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quran Reading Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QURAN READING</Text>

          {renderSettingRow(
            'text',
            'Arabic Font Size',
            `Current: ${settings.arabicFontSize}px`,
            <View style={styles.fontSizeButtons}>
              <TouchableOpacity
                style={styles.fontButton}
                onPress={() => updateSetting('arabicFontSize', Math.max(18, settings.arabicFontSize - 2))}
              >
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.fontButton}
                onPress={() => updateSetting('arabicFontSize', Math.min(36, settings.arabicFontSize + 2))}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {renderSettingRow(
            'text-outline',
            'Translation Font Size',
            `Current: ${settings.translationFontSize}px`,
            <View style={styles.fontSizeButtons}>
              <TouchableOpacity
                style={styles.fontButton}
                onPress={() => updateSetting('translationFontSize', Math.max(12, settings.translationFontSize - 2))}
              >
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.fontButton}
                onPress={() => updateSetting('translationFontSize', Math.min(24, settings.translationFontSize + 2))}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {renderSettingRow(
            'language',
            'Show Translation',
            'Display English translation below Arabic',
            <Switch
              value={settings.showTranslation}
              onValueChange={(value) => updateSetting('showTranslation', value)}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          )}

          {renderSettingRow(
            'text',
            'Show Transliteration',
            'Display Rumi (Latin/Jawi style) pronunciation',
            <Switch
              value={settings.showTransliteration}
              onValueChange={(value) => updateSetting('showTransliteration', value)}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          )}

          {renderSettingRow(
            'swap-horizontal',
            'Auto Scroll',
            'Automatically scroll during audio playback',
            <Switch
              value={settings.autoScroll}
              onValueChange={(value) => updateSetting('autoScroll', value)}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          )}
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUDIO</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowReciterPicker(!showReciterPicker)}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="mic" size={24} color="#10B981" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Default Reciter</Text>
              <Text style={styles.settingDescription}>
                {selectedReciter?.name || 'Mishary Rashid Al-Afasy'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {showReciterPicker && (
            <View style={styles.picker}>
              {RECITERS.map((reciter) => (
                <TouchableOpacity
                  key={reciter.id}
                  style={[
                    styles.pickerItem,
                    settings.defaultReciter === reciter.id && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    updateSetting('defaultReciter', reciter.id);
                    setShowReciterPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      settings.defaultReciter === reciter.id && styles.pickerItemTextSelected,
                    ]}
                  >
                    {reciter.name}
                  </Text>
                  {settings.defaultReciter === reciter.id && (
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {renderSettingRow(
            'speedometer',
            'Playback Speed',
            `Current: ${settings.playbackSpeed}x`,
            <View style={styles.speedButtons}>
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedButton,
                    settings.playbackSpeed === speed && styles.speedButtonActive,
                  ]}
                  onPress={() => updateSetting('playbackSpeed', speed)}
                >
                  <Text
                    style={[
                      styles.speedButtonText,
                      settings.playbackSpeed === speed && styles.speedButtonTextActive,
                    ]}
                  >
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Prayer Times Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRAYER TIMES</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowZonePicker(!showZonePicker)}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="location" size={24} color="#10B981" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Prayer Zone</Text>
              <Text style={styles.settingDescription}>
                {selectedZone?.name || 'Johor Bahru'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {showZonePicker && (
            <View style={styles.picker}>
              <ScrollView style={styles.zoneScrollView} nestedScrollEnabled>
                {PRAYER_ZONES.map((zone) => (
                  <TouchableOpacity
                    key={zone.code}
                    style={[
                      styles.pickerItem,
                      settings.prayerZone === zone.code && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      updateSetting('prayerZone', zone.code);
                      setShowZonePicker(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          settings.prayerZone === zone.code && styles.pickerItemTextSelected,
                        ]}
                      >
                        {zone.name}
                      </Text>
                      <Text style={styles.pickerItemSubtext}>{zone.state}</Text>
                    </View>
                    {settings.prayerZone === zone.code && (
                      <Ionicons name="checkmark" size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {renderSettingRow(
            'notifications',
            'Prayer Notifications',
            'Get notified for prayer times',
            <Switch
              value={notificationSettings.enabled}
              onValueChange={(value) => {
                setNotificationSettings({ ...notificationSettings, enabled: value });
                updateNotificationSettings({ enabled: value });
              }}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          )}

          {notificationSettings.enabled && (
            <>
              {/* Prayer Specific Notifications */}
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>INDIVIDUAL PRAYER NOTIFICATIONS</Text>

                {renderSettingRow(
                  'sunny-outline',
                  'Fajr',
                  'Notification for Fajr prayer',
                  <Switch
                    value={notificationSettings.fajr}
                    onValueChange={(value) => {
                      setNotificationSettings({ ...notificationSettings, fajr: value });
                      updateNotificationSettings({ fajr: value });
                    }}
                    trackColor={{ false: '#374151', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                )}

                {renderSettingRow(
                  'sunny',
                  'Dhuhr',
                  'Notification for Dhuhr prayer',
                  <Switch
                    value={notificationSettings.dhuhr}
                    onValueChange={(value) => {
                      setNotificationSettings({ ...notificationSettings, dhuhr: value });
                      updateNotificationSettings({ dhuhr: value });
                    }}
                    trackColor={{ false: '#374151', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                )}

                {renderSettingRow(
                  'partly-sunny',
                  'Asr',
                  'Notification for Asr prayer',
                  <Switch
                    value={notificationSettings.asr}
                    onValueChange={(value) => {
                      setNotificationSettings({ ...notificationSettings, asr: value });
                      updateNotificationSettings({ asr: value });
                    }}
                    trackColor={{ false: '#374151', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                )}

                {renderSettingRow(
                  'sunset',
                  'Maghrib',
                  'Notification for Maghrib prayer',
                  <Switch
                    value={notificationSettings.maghrib}
                    onValueChange={(value) => {
                      setNotificationSettings({ ...notificationSettings, maghrib: value });
                      updateNotificationSettings({ maghrib: value });
                    }}
                    trackColor={{ false: '#374151', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                )}

                {renderSettingRow(
                  'moon',
                  'Isha',
                  'Notification for Isha prayer',
                  <Switch
                    value={notificationSettings.isha}
                    onValueChange={(value) => {
                      setNotificationSettings({ ...notificationSettings, isha: value });
                      updateNotificationSettings({ isha: value });
                    }}
                    trackColor={{ false: '#374151', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                )}
              </View>

              {/* Notification Settings */}
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>NOTIFICATION SETTINGS</Text>

                {renderSettingRow(
                  'time',
                  'Notification Offset',
                  `Minutes before prayer: ${notificationSettings.offsetMinutes}`,
                  <View style={styles.fontSizeButtons}>
                    <TouchableOpacity
                      style={styles.fontButton}
                      onPress={() => {
                        const newValue = Math.max(0, notificationSettings.offsetMinutes - 5);
                        setNotificationSettings({ ...notificationSettings, offsetMinutes: newValue });
                        updateNotificationSettings({ offsetMinutes: newValue });
                      }}
                    >
                      <Ionicons name="remove" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.fontButton}
                      onPress={() => {
                        const newValue = Math.min(60, notificationSettings.offsetMinutes + 5);
                        setNotificationSettings({ ...notificationSettings, offsetMinutes: newValue });
                        updateNotificationSettings({ offsetMinutes: newValue });
                      }}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}

                {renderSettingRow(
                  'volume-high',
                  'Sound',
                  'Play sound with notifications',
                  <Switch
                    value={notificationSettings.sound}
                    onValueChange={(value) => {
                      setNotificationSettings({ ...notificationSettings, sound: value });
                      updateNotificationSettings({ sound: value });
                    }}
                    trackColor={{ false: '#374151', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                )}

                {renderSettingRow(
                  'phone-portrait',
                  'Vibration',
                  'Vibrate with notifications',
                  <Switch
                    value={notificationSettings.vibrate}
                    onValueChange={(value) => {
                      setNotificationSettings({ ...notificationSettings, vibrate: value });
                      updateNotificationSettings({ vibrate: value });
                    }}
                    trackColor={{ false: '#374151', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                )}

                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={async () => {
                    await showTestNotification();
                    Alert.alert('Test Notification', 'Test notification sent!');
                  }}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons name="notifications" size={24} color="#10B981" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Test Notification</Text>
                    <Text style={styles.settingDescription}>Send a test notification</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Account Section */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/profile' as any)}
            >
              <View style={styles.settingIcon}>
                <Ionicons name="person" size={24} color="#10B981" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Profile</Text>
                <Text style={styles.settingDescription}>Manage your account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>

          {renderSettingRow(
            'information-circle',
            'Version',
            'Al-Quran Digital v1.0.0',
            <></>
          )}

          {renderSettingRow(
            'logo-github',
            'Open Source',
            'View on GitHub',
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 12,
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  fontButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    maxWidth: 180,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#374151',
  },
  speedButtonActive: {
    backgroundColor: '#10B981',
  },
  speedButtonText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  speedButtonTextActive: {
    color: '#FFFFFF',
  },
  picker: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    marginTop: -4,
  },
  zoneScrollView: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerItemSelected: {
    backgroundColor: '#1F2937',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  pickerItemTextSelected: {
    color: '#10B981',
    fontWeight: '600',
  },
  pickerItemSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  subSection: {
    marginLeft: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 8,
    letterSpacing: 1,
  },
});
