import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export default function PrayerScreen() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [hijriDate, setHijriDate] = useState<string>('');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get accurate prayer times.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {} },
          ]
        );
        setLoading(false);
        return;
      }

      await fetchPrayerTimes();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLoading(false);
    }
  };

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);
      const locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;

      // Get address from coordinates
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const city = address[0].city || address[0].subregion || 'Unknown';
        const country = address[0].country || 'Unknown';
        setLocation(`${city}, ${country}`);
      }

      // Fetch prayer times
      const response = await axios.get(
        `https://api.aladhan.com/v1/timings`,
        {
          params: {
            latitude,
            longitude,
            method: 2, // ISNA method
          },
        }
      );

      if (response.data.code === 200) {
        const timings = response.data.data.timings;
        const prayers: PrayerTimes = {
          Fajr: timings.Fajr,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha,
        };
        setPrayerTimes(prayers);
        await AsyncStorage.setItem('prayerTimes', JSON.stringify(prayers));

        // Set Hijri date
        const hijri = response.data.data.date.hijri;
        setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year}`);

        // Calculate next prayer
        calculateNextPrayer(prayers);
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      Alert.alert('Error', 'Failed to fetch prayer times. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPrayer = (prayers: PrayerTimes) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayerList = [
      { name: 'Fajr', time: prayers.Fajr },
      { name: 'Dhuhr', time: prayers.Dhuhr },
      { name: 'Asr', time: prayers.Asr },
      { name: 'Maghrib', time: prayers.Maghrib },
      { name: 'Isha', time: prayers.Isha },
    ];

    for (const prayer of prayerList) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      if (prayerMinutes > currentTime) {
        setNextPrayer(prayer.name);
        return;
      }
    }
    setNextPrayer('Fajr'); // If no prayer left today, next is Fajr tomorrow
  };

  const isPrayerNext = (prayerName: string) => prayerName === nextPrayer;

  const prayerIcons: { [key: string]: any } = {
    Fajr: 'partly-sunny-outline',
    Dhuhr: 'sunny-outline',
    Asr: 'sunny-outline',
    Maghrib: 'moon-outline',
    Isha: 'moon-outline',
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Fetching prayer times...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Prayer Times</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color="#10B981" />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchPrayerTimes}
          >
            <Ionicons name="refresh" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Hijri Date Card */}
        {hijriDate && (
          <View style={styles.dateCard}>
            <Ionicons name="calendar" size={20} color="#10B981" />
            <Text style={styles.dateText}>{hijriDate}</Text>
          </View>
        )}

        {/* Prayer Times List */}
        {prayerTimes && (
          <View style={styles.prayersList}>
            {Object.entries(prayerTimes).map(([name, time]) => {
              const isNext = isPrayerNext(name);
              return (
                <View
                  key={name}
                  style={[
                    styles.prayerCard,
                    isNext && styles.prayerCardNext,
                  ]}
                >
                  <View style={styles.prayerLeft}>
                    <View
                      style={[
                        styles.prayerIconContainer,
                        isNext && styles.prayerIconContainerNext,
                      ]}
                    >
                      <Ionicons
                        name={prayerIcons[name]}
                        size={24}
                        color={isNext ? '#FFFFFF' : '#10B981'}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.prayerName,
                          isNext && styles.prayerNameNext,
                        ]}
                      >
                        {name}
                      </Text>
                      {isNext && (
                        <Text style={styles.nextLabel}>Next Prayer</Text>
                      )}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.prayerTime,
                      isNext && styles.prayerTimeNext,
                    ]}
                  >
                    {time}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            Prayer times are calculated based on your current location using ISNA calculation method.
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    fontWeight: '600',
  },
  prayersList: {
    gap: 12,
    marginBottom: 20,
  },
  prayerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  prayerCardNext: {
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#34D399',
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  prayerIconContainerNext: {
    backgroundColor: '#FFFFFF20',
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  prayerNameNext: {
    fontWeight: 'bold',
  },
  nextLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 2,
    opacity: 0.8,
  },
  prayerTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  prayerTimeNext: {
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 12,
    lineHeight: 20,
  },
});
