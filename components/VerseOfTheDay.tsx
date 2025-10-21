/**
 * Verse of the Day Component
 * Display a random inspiring verse on home screen
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { getRandomVerse } from '../services/quranApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslations } from '../constants/translations';
import { withMemo, useDebounce } from '../utils/performance';

interface VerseData {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  date: string;
}

function VerseOfTheDayComponent() {
  const router = useRouter();
  const { language } = useLanguage();
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get translations based on current language - memoized
  const translations = useMemo(() => getTranslations(language as any), [language]);
  const t = useCallback((key: string, fallback: string) => {
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || fallback;
  }, [translations]);

  useEffect(() => {
    loadVerseOfTheDay();
  }, []);

  const loadVerseOfTheDay = useCallback(async () => {
    try {
      const today = new Date().toDateString();
      const cached = await AsyncStorage.getItem('verse_of_the_day');

      if (cached) {
        const data = JSON.parse(cached);
        if (data.date === today) {
          setVerse(data);
          setLoading(false);
          return;
        }
      }

      // Fetch new verse
      const result = await getRandomVerse();
      const verseData: VerseData = {
        surahNumber: result.surah.number,
        surahName: result.surah.englishName,
        ayahNumber: result.verse.verseNumber,
        arabicText: result.verse.arabicText,
        translation: result.verse.translationText || '',
        date: today,
      };

      setVerse(verseData);
      await AsyncStorage.setItem('verse_of_the_day', JSON.stringify(verseData));
      setLoading(false);
    } catch (error) {
      console.error('Error loading verse of the day:', error);
      setLoading(false);
      // Set fallback verse on error
      const fallbackVerse: VerseData = {
        surahNumber: 1,
        surahName: 'Al-Fatihah',
        ayahNumber: 1,
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
        translation: 'In the name of Allah, the Most Gracious, the Most Merciful.',
        date: new Date().toDateString(),
      };
      setVerse(fallbackVerse);
    }
  }, []);

  const handlePress = useCallback(() => {
    if (verse) {
      router.push(`/surah/${verse.surahNumber}` as any);
    }
  }, [verse, router]);

  // Memoize the header title to prevent unnecessary re-renders
  const headerTitle = useMemo(() => 
    language === 'en' ? 'Verse of the Day' : 'Ayat Hari Ini', 
    [language]
  );

  // Memoize the footer text to prevent unnecessary re-renders
  const footerText = useMemo(() => 
    language === 'en' ? 'Tap to read full surah' : 'Tekan untuk baca surah penuh', 
    [language]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#10B981" />
      </View>
    );
  }

  if (!verse) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="star" size={20} color="#F59E0B" />
          <Text style={styles.headerTitle}>{headerTitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>

      <View style={styles.verseContent}>
        <Text style={styles.arabicText}>{verse.arabicText}</Text>
        <Text style={styles.translation} numberOfLines={3}>
          {verse.translation}
        </Text>

        <View style={styles.reference}>
          <Ionicons name="bookmark-outline" size={16} color="#10B981" />
          <Text style={styles.referenceText}>
            {verse.surahName} {verse.surahNumber}:{verse.ayahNumber}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{footerText}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Export memoized component
export const VerseOfTheDay = withMemo(VerseOfTheDayComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
    // Add subtle gradient effect via shadow
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verseContent: {
    marginBottom: 16,
  },
  arabicText: {
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'right',
    lineHeight: 36,
    marginBottom: 12,
    fontWeight: '500',
  },
  translation: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 24,
    marginBottom: 12,
  },
  reference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  referenceText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
