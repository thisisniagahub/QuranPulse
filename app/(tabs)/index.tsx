import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VerseOfTheDay } from '../../components/VerseOfTheDay';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [nextPrayer, setNextPrayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Tengahari');
    else if (hour < 19) setGreeting('Selamat Petang');
    else setGreeting('Selamat Malam');

    loadNextPrayer();
  }, []);

  const loadNextPrayer = async () => {
    try {
      const storedPrayers = await AsyncStorage.getItem('prayerTimes');
      if (storedPrayers) {
        const prayers = JSON.parse(storedPrayers);
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
            setNextPrayer(prayer);
            break;
          }
        }
      }
    } catch (error) {
      console.log('Error loading next prayer:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: 'Baca Al-Quran',
      subtitle: 'Terjemahan Bahasa Melayu',
      icon: 'book-outline',
      color: '#10B981',
      route: '/quran',
    },
    {
      title: 'Waktu Solat',
      subtitle: 'Jadual solat harian',
      icon: 'time-outline',
      color: '#3B82F6',
      route: '/prayer',
    },
    {
      title: 'Arah Kiblat',
      subtitle: 'Cari arah Kaabah',
      icon: 'compass-outline',
      color: '#8B5CF6',
      route: '/more?tab=qibla',
    },
    {
      title: 'Koleksi Hadis',
      subtitle: 'Hadis Sahih & Hasan',
      icon: 'library-outline',
      color: '#F59E0B',
      route: '/hadith',
    },
  ];

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
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.appName}>QuranPulse!</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Next Prayer Card */}
        {!loading && nextPrayer && (
          <View style={styles.prayerCard}>
            <View style={styles.prayerCardHeader}>
              <Ionicons name="time" size={24} color="#10B981" />
              <Text style={styles.prayerCardTitle}>Next Prayer</Text>
            </View>
            <View style={styles.prayerCardContent}>
              <Text style={styles.prayerName}>{nextPrayer.name}</Text>
              <Text style={styles.prayerTime}>{nextPrayer.time}</Text>
            </View>
          </View>
        )}

        {/* Quick Access Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Akses Pantas</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                onPress={() => router.push(feature.route as any)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}
                >
                  <Ionicons name={feature.icon as any} size={32} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Verse Card - Using Component */}
        <VerseOfTheDay />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prayerCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  prayerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prayerCardTitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  prayerCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  prayerTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: '47%',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  verseCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseLabel: {
    fontSize: 14,
    color: '#F59E0B',
    marginLeft: 8,
    fontWeight: '600',
  },
  verseArabic: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  verseTranslation: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  verseReference: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
