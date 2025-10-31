import type { Surah, Ayah, ApiResponse } from '../types';
import { SURAHS } from '../constants/surahs';
import { createApiClient, executeWithRetry, ApiError } from '../utils/apiClient';
import { getValidatedEnv } from '../utils/env';
import { logger } from './loggingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = getValidatedEnv();
const QURAN_API_BASE = config.quranApiBase;
const TRANSLATION_ID = 131; // Dr. Mustafa Khattab (English)
const TAFSIR_ID = 169; // Tafsir Ibn Kathir (Indonesian)

// Create API client with retry logic
const quranClient = createApiClient(QURAN_API_BASE, { timeout: 10000 });

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data as T;
      }
    }
  } catch (error) {
    logger.error('Error getting from cache:', error);
  }
  return null;
}

async function setCache(key: string, data: any): Promise<void> {
  try {
    const item = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    logger.error('Error setting cache:', error);
  }
}

/**
 * Fetch a Surah by ID
 * @param surahId - The Surah number (1-114)
 * @returns Promise with Surah data
 */
export async function getSurah(surahId: number): Promise<Surah> {
  const cacheKey = `quran_surah_${surahId}`;
  const cached = await getFromCache<Surah>(cacheKey);
  if (cached) return cached;

  try {
    const response = await executeWithRetry(
      () => quranClient.get(`/surah/${surahId}`),
      { maxRetries: 2, retryDelay: 1000 }
    );
    const data = response.data.data;

    const surah: Surah = {
      number: data.number,
      name: data.name,
      englishName: data.englishName,
      englishNameTranslation: data.englishNameTranslation,
      numberOfAyahs: data.numberOfAyahs,
      revelationType: data.revelationType,
      arabicName: data.name,
    };

    await setCache(cacheKey, surah);
    return surah;
  } catch (error) {
    const apiError = error as ApiError;
    logger.error('Error fetching Surah:', apiError.userMessage);
    // Fallback to constants
    const surah = SURAHS.find(s => s.number === surahId);
    if (surah) return surah;
    throw new Error(apiError.userMessage || 'Failed to fetch Surah');
  }
}

/**
 * Fetch verses for a Surah with translation
 * @param surahId - The Surah number (1-114)
 * @returns Promise with array of verses
 */
export async function getSurahVerses(surahId: number): Promise<Ayah[]> {
  const cacheKey = `quran_verses_${surahId}`;
  const cached = await getFromCache<Ayah[]>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch Arabic text and translation with retry logic
    const [arabicResponse, translationResponse] = await Promise.all([
      executeWithRetry(
        () => quranClient.get(`/surah/${surahId}`),
        { maxRetries: 2 }
      ),
      executeWithRetry(
        () => quranClient.get(`/surah/${surahId}/en.asad`),
        { maxRetries: 2 }
      )
    ]);

    const arabicVerses = arabicResponse.data.data.ayahs;
    const translatedVerses = translationResponse.data.data.ayahs;

    const verses: Ayah[] = arabicVerses.map((verse: any, index: number) => ({
      id: verse.number,
      verseNumber: verse.numberInSurah,
      verse_key: `${surahId}:${verse.numberInSurah}`,
      arabicText: verse.text,
      translationText: translatedVerses[index]?.text || 'Translation not available',
      surahNumber: surahId,
    }));

    await setCache(cacheKey, verses);
    return verses;
  } catch (error) {
    const apiError = error as ApiError;
    logger.error('Error fetching Surah verses:', apiError.userMessage);
    throw new Error(apiError.userMessage || 'Failed to fetch verses. Please check your connection and try again.');
  }
}

/**
 * Fetch a specific verse by key (e.g., "2:255")
 * @param verseKey - The verse key in format "surah:verse"
 * @returns Promise with verse data
 */
/**
 * Get transliteration for a verse (Rumi/Latin style)
 */
export async function getTransliteration(verseKey: string): Promise<string> {
  const cacheKey = `quran_transliteration_${verseKey}`;
  const cached = await getFromCache<string>(cacheKey);

  if (cached) return cached;

  try {
    // Using en.transliteration edition from AlQuran Cloud
    const response = await fetch(
      `${QURAN_API_BASE}/ayah/${verseKey}/en.transliteration`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch transliteration');
    }

    const data = await response.json();

    if (data.code === 200 && data.data) {
      const transliteration = data.data.text || '';

      // Cache the result
      await setCache(cacheKey, transliteration);

      return transliteration;
    }

    throw new Error('Invalid response from API');
  } catch (error) {
    logger.error('Error fetching transliteration:', error);
    return 'Transliteration unavailable';
  }
}

export async function getVerse(verseKey: string): Promise<Ayah> {
  const cacheKey = `quran_verse_${verseKey}`;
  const cached = await getFromCache<Ayah>(cacheKey);
  if (cached) return cached;

  try {
    const [surahId, verseNumber] = verseKey.split(':').map(Number);

    const [arabicResponse, translationResponse] = await Promise.all([
      executeWithRetry(() => quranClient.get(`/ayah/${verseKey}`)),
      executeWithRetry(() => quranClient.get(`/ayah/${verseKey}/en.asad`))
    ]);

    const arabicData = arabicResponse.data.data;
    const translationData = translationResponse.data.data;

    const verse: Ayah = {
      id: arabicData.number,
      verseNumber: arabicData.numberInSurah,
      verse_key: verseKey,
      arabicText: arabicData.text,
      translationText: translationData.text,
      surahNumber: surahId,
    };

    await setCache(cacheKey, verse);
    return verse;
  } catch (error) {
    const apiError = error as ApiError;
    logger.error('Error fetching verse:', apiError.userMessage);
    throw new Error(apiError.userMessage || 'Failed to fetch verse. Please check your connection and try again.');
  }
}

/**
 * Get audio URL for a verse
 * @param verseKey - The verse key in format "surah:verse"
 * @param reciterId - The reciter ID (default: 7 - Mishary Al-Afasy)
 * @returns Promise with audio URL
 */
export async function getVerseAudio(verseKey: string, reciterId: number = 7): Promise<string> {
  try {
    const response = await executeWithRetry(
      () => quranClient.get(`/ayah/${verseKey}/ar.alafasy`)
    );

    const audioUrl = response.data.data.audio;
    if (!audioUrl) {
      throw new Error('Audio URL not found');
    }

    return audioUrl;
  } catch (error) {
    const apiError = error as ApiError;
    logger.error('Error fetching verse audio:', apiError.userMessage);
    throw new Error(apiError.userMessage || 'Failed to fetch audio. Please try again.');
  }
}

/**
 * Get audio URL for entire Surah
 * @param surahId - The Surah number
 * @param reciterId - The reciter ID
 * @returns Promise with audio URL
 */
export async function getSurahAudio(surahId: number, reciterId: number = 7): Promise<string> {
  // For now, using a placeholder URL structure
  // In production, you would have actual audio files hosted
  const paddedSurahId = String(surahId).padStart(3, '0');
  return `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${paddedSurahId}.mp3`;
}

/**
 * Get Tafsir (interpretation) for a verse
 * @param verseKey - The verse key in format "surah:verse"
 * @returns Promise with Tafsir text
 */
export async function getTafsir(verseKey: string): Promise<string> {
  const cacheKey = `quran_tafsir_${verseKey}`;
  const cached = await getFromCache<string>(cacheKey);
  if (cached) return cached;

  try {
    const response = await executeWithRetry(
      () => quranClient.get(`/ayah/${verseKey}/editions/id.indonesian`)
    );

    const tafsirHtml = response.data.data[0]?.text || 'Tafsir not available for this verse.';

    // Clean HTML tags (React Native safe way)
    const tafsirText = tafsirHtml
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp;
      .replace(/&amp;/g, '&')  // Replace &amp;
      .replace(/&lt;/g, '<')   // Replace &lt;
      .replace(/&gt;/g, '>')   // Replace &gt;
      .replace(/&quot;/g, '"') // Replace &quot;
      .trim();

    await setCache(cacheKey, tafsirText);
    return tafsirText;
  } catch (error) {
    const apiError = error as ApiError;
    logger.error('Error fetching Tafsir:', apiError.userMessage);
    return apiError.userMessage || 'Tafsir not available at the moment. Please try again later.';
  }
}

/**
 * Get a random verse (Verse of the Day)
 * @returns Promise with random verse data
 */
export async function getRandomVerse(): Promise<{ verse: Ayah; surah: Surah }> {
  try {
    const randomSurah = SURAHS[Math.floor(Math.random() * SURAHS.length)];
    const randomVerseNumber = Math.floor(Math.random() * randomSurah.numberOfAyahs) + 1;
    const verseKey = `${randomSurah.number}:${randomVerseNumber}`;

    const verse = await getVerse(verseKey);

    return { verse, surah: randomSurah };
  } catch (error) {
    logger.error('Error fetching random verse:', error);
    // Fallback to Al-Fatihah 1:1
    const verse = await getVerse('1:1');
    return { verse, surah: SURAHS[0] };
  }
}

/**
 * Search tafsir by keyword
 * @param keyword - The keyword to search
 * @returns Promise with tafsir search results
 */
export async function searchTafsir(keyword: string): Promise<any[]> {
  try {
    // This is a simplified implementation
    const results = [];
    const lowerKeyword = keyword.toLowerCase();

    // Search through first 10 surahs for demo
    for (let i = 1; i <= 10; i++) {
      try {
        const tafsir = await getTafsir(`${i}:1`);
        if (tafsir && tafsir.toLowerCase().includes(lowerKeyword)) {
          const surah = SURAHS.find(s => s.number === i);
          results.push({
            surah: i,
            ayah: 1,
            surahName: surah?.englishName || `Surah ${i}`,
            tafsir: tafsir,
            arabicText: '',
            translation: '',
          });
        }
      } catch (error) {
        // Skip if tafsir not available
      }
    }

    return results;
  } catch (error) {
    logger.error('Error searching tafsir:', error);
    return [];
  }
}

/**
 * Search verses by keyword
 * @param keyword - The keyword to search
 * @param language - Language for search (en, ar)
 * @returns Promise with search results
 */
export async function searchVerses(keyword: string, language: string = 'en'): Promise<Ayah[]> {
  try {
    const response = await executeWithRetry(
      () => quranClient.get(`/search/${encodeURIComponent(keyword)}/all/${language}.asad`)
    );

    const matches = response.data.data.matches;

    return matches.map((match: any) => ({
      id: match.number,
      verseNumber: match.numberInSurah,
      verse_key: `${match.surah.number}:${match.numberInSurah}`,
      arabicText: match.text,
      translationText: match.text,
      surahNumber: match.surah.number,
    }));
  } catch (error) {
    const apiError = error as ApiError;
    logger.error('Error searching verses:', apiError.userMessage);
    throw new Error(apiError.userMessage || 'Search failed. Please try again.');
  }
}

/**
 * Download audio file with progress tracking
 * @param url - Audio URL
 * @param onProgress - Progress callback
 * @returns Promise with Blob
 */
export async function downloadAudioFile(
  url: string,
  onProgress?: (progress: { loaded: number; total: number }) => void
): Promise<Blob> {
  try {
    const response = await quranClient.get(url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
          });
        }
      },
    });

    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    logger.error('Error downloading audio file:', apiError.userMessage);
    throw new Error(apiError.userMessage || 'Failed to download audio file.');
  }
}
