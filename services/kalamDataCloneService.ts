/**
 * Kalam Al-Quran AI Data Cloning Service
 * Clones data from https://kalam.alquran.ai/
 * 
 * This service provides functionality to clone Quranic data including:
 * - Surah information
 * - Verse data with Arabic text and translations
 * - Audio files
 * - Tafsir (interpretations)
 * - Reciter information
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiClient, executeWithRetry, ApiError } from '../utils/apiClient';

// Kalam Al-Quran AI API endpoints
const KALAM_API_BASE = 'https://kalam.alquran.ai/api';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

// Create API client for Kalam API
const kalamClient = createApiClient(KALAM_API_BASE, { 
  timeout: 30000,
  headers: {
    'User-Agent': 'Al-Quran-Mobile-App/1.0',
    'Accept': 'application/json',
  }
});

export interface KalamSurah {
  id: number;
  name: string;
  nameArabic: string;
  nameEnglish: string;
  nameTransliteration: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  revelationOrder: number;
  bismillahPre: boolean;
  description?: string;
}

export interface KalamAyah {
  id: number;
  surahId: number;
  ayahNumber: number;
  arabicText: string;
  translations: {
    [language: string]: string;
  };
  audioUrl?: string;
  tafsir?: {
    [language: string]: string;
  };
  transliteration?: string;
}

export interface KalamReciter {
  id: number;
  name: string;
  nameArabic: string;
  language: string;
  region: string;
  style: string;
  description?: string;
}

export interface KalamTranslation {
  id: number;
  name: string;
  nameArabic: string;
  language: string;
  author: string;
  description?: string;
}

/**
 * Clone all Surah data from Kalam API
 */
export async function cloneSurahs(): Promise<KalamSurah[]> {
  try {
    console.log('🔄 Starting Surah data cloning from Kalam API...');
    
    const cacheKey = 'kalam_surahs_cloned';
    
    // Check if already cloned recently
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('✅ Using cached Surah data');
        return data;
      }
    }

    // Fetch Surah list
    const response = await executeWithRetry(
      () => kalamClient.get('/surahs'),
      { maxRetries: 3, retryDelay: 2000 }
    );

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from Kalam API');
    }

    const surahs: KalamSurah[] = response.data.map((surah: any) => ({
      id: surah.id || surah.number,
      name: surah.name || surah.englishName,
      nameArabic: surah.nameArabic || surah.arabicName,
      nameEnglish: surah.nameEnglish || surah.englishName,
      nameTransliteration: surah.nameTransliteration || surah.transliteration,
      numberOfAyahs: surah.numberOfAyahs || surah.ayahCount,
      revelationType: surah.revelationType || (surah.revelationPlace === 'Mecca' ? 'Meccan' : 'Medinan'),
      revelationOrder: surah.revelationOrder || surah.order,
      bismillahPre: surah.bismillahPre || false,
      description: surah.description,
    }));

    // Cache the data
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: surahs,
        timestamp: Date.now(),
      })
    );

    console.log(`✅ Successfully cloned ${surahs.length} Surahs from Kalam API`);
    return surahs;

  } catch (error) {
    console.error('❌ Error cloning Surahs from Kalam API:', error);
    throw new Error(`Failed to clone Surah data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clone verses for a specific Surah
 */
export async function cloneSurahVerses(surahId: number): Promise<KalamAyah[]> {
  try {
    console.log(`🔄 Cloning verses for Surah ${surahId}...`);
    
    const cacheKey = `kalam_verses_${surahId}`;
    
    // Check cache
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`✅ Using cached verses for Surah ${surahId}`);
        return data;
      }
    }

    // Fetch verses with multiple translations
    const [versesResponse, translationsResponse] = await Promise.all([
      executeWithRetry(
        () => kalamClient.get(`/surahs/${surahId}/verses`),
        { maxRetries: 3, retryDelay: 2000 }
      ),
      executeWithRetry(
        () => kalamClient.get(`/surahs/${surahId}/translations`),
        { maxRetries: 3, retryDelay: 2000 }
      )
    ]);

    const verses = versesResponse.data || [];
    const translations = translationsResponse.data || {};

    const ayahs: KalamAyah[] = verses.map((verse: any, index: number) => ({
      id: verse.id || verse.number,
      surahId: surahId,
      ayahNumber: verse.ayahNumber || verse.numberInSurah || (index + 1),
      arabicText: verse.arabicText || verse.text,
      translations: {
        en: translations.en?.[index] || verse.translation || '',
        ms: translations.ms?.[index] || verse.malayTranslation || '',
        id: translations.id?.[index] || verse.indonesianTranslation || '',
        ar: verse.arabicText || verse.text,
      },
      audioUrl: verse.audioUrl,
      tafsir: verse.tafsir ? {
        en: verse.tafsir.en,
        ms: verse.tafsir.ms,
        id: verse.tafsir.id,
      } : undefined,
      transliteration: verse.transliteration,
    }));

    // Cache the data
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: ayahs,
        timestamp: Date.now(),
      })
    );

    console.log(`✅ Successfully cloned ${ayahs.length} verses for Surah ${surahId}`);
    return ayahs;

  } catch (error) {
    console.error(`❌ Error cloning verses for Surah ${surahId}:`, error);
    throw new Error(`Failed to clone verses for Surah ${surahId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clone all verses for all Surahs
 */
export async function cloneAllVerses(): Promise<{ [surahId: number]: KalamAyah[] }> {
  try {
    console.log('🔄 Starting complete verse cloning from Kalam API...');
    
    const surahs = await cloneSurahs();
    const allVerses: { [surahId: number]: KalamAyah[] } = {};
    
    // Clone verses for each Surah with rate limiting
    for (let i = 0; i < surahs.length; i++) {
      const surah = surahs[i];
      
      try {
        console.log(`📖 Cloning verses for ${surah.nameEnglish} (${i + 1}/${surahs.length})...`);
        const verses = await cloneSurahVerses(surah.id);
        allVerses[surah.id] = verses;
        
        // Rate limiting - wait 1 second between requests
        if (i < surahs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`⚠️ Failed to clone verses for Surah ${surah.id}:`, error);
        // Continue with other Surahs
        allVerses[surah.id] = [];
      }
    }

    console.log(`✅ Successfully cloned verses for ${Object.keys(allVerses).length} Surahs`);
    return allVerses;

  } catch (error) {
    console.error('❌ Error cloning all verses:', error);
    throw new Error(`Failed to clone all verses: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clone reciter information
 */
export async function cloneReciters(): Promise<KalamReciter[]> {
  try {
    console.log('🔄 Cloning reciter data from Kalam API...');
    
    const cacheKey = 'kalam_reciters_cloned';
    
    // Check cache
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('✅ Using cached reciter data');
        return data;
      }
    }

    const response = await executeWithRetry(
      () => kalamClient.get('/reciters'),
      { maxRetries: 3, retryDelay: 2000 }
    );

    const reciters: KalamReciter[] = (response.data || []).map((reciter: any) => ({
      id: reciter.id,
      name: reciter.name || reciter.englishName,
      nameArabic: reciter.nameArabic || reciter.arabicName,
      language: reciter.language || 'Arabic',
      region: reciter.region || reciter.country,
      style: reciter.style || reciter.recitationStyle,
      description: reciter.description,
    }));

    // Cache the data
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: reciters,
        timestamp: Date.now(),
      })
    );

    console.log(`✅ Successfully cloned ${reciters.length} reciters from Kalam API`);
    return reciters;

  } catch (error) {
    console.error('❌ Error cloning reciters:', error);
    throw new Error(`Failed to clone reciter data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clone translation information
 */
export async function cloneTranslations(): Promise<KalamTranslation[]> {
  try {
    console.log('🔄 Cloning translation data from Kalam API...');
    
    const cacheKey = 'kalam_translations_cloned';
    
    // Check cache
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('✅ Using cached translation data');
        return data;
      }
    }

    const response = await executeWithRetry(
      () => kalamClient.get('/translations'),
      { maxRetries: 3, retryDelay: 2000 }
    );

    const translations: KalamTranslation[] = (response.data || []).map((translation: any) => ({
      id: translation.id,
      name: translation.name || translation.englishName,
      nameArabic: translation.nameArabic || translation.arabicName,
      language: translation.language || translation.lang,
      author: translation.author || translation.translator,
      description: translation.description,
    }));

    // Cache the data
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: translations,
        timestamp: Date.now(),
      })
    );

    console.log(`✅ Successfully cloned ${translations.length} translations from Kalam API`);
    return translations;

  } catch (error) {
    console.error('❌ Error cloning translations:', error);
    throw new Error(`Failed to clone translation data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clone complete dataset from Kalam API
 */
export async function cloneCompleteDataset(): Promise<{
  surahs: KalamSurah[];
  verses: { [surahId: number]: KalamAyah[] };
  reciters: KalamReciter[];
  translations: KalamTranslation[];
}> {
  try {
    console.log('🚀 Starting complete dataset cloning from Kalam API...');
    
    // Clone all data in parallel where possible
    const [surahs, reciters, translations] = await Promise.all([
      cloneSurahs(),
      cloneReciters(),
      cloneTranslations(),
    ]);

    // Clone verses sequentially to avoid overwhelming the API
    const verses = await cloneAllVerses();

    const result = {
      surahs,
      verses,
      reciters,
      translations,
    };

    // Save complete dataset
    await AsyncStorage.setItem(
      'kalam_complete_dataset',
      JSON.stringify({
        data: result,
        timestamp: Date.now(),
      })
    );

    console.log('🎉 Complete dataset cloning finished successfully!');
    console.log(`📊 Cloned data summary:`);
    console.log(`   • ${surahs.length} Surahs`);
    console.log(`   • ${Object.keys(verses).length} Surahs with verses`);
    console.log(`   • ${reciters.length} Reciters`);
    console.log(`   • ${translations.length} Translations`);

    return result;

  } catch (error) {
    console.error('❌ Error cloning complete dataset:', error);
    throw new Error(`Failed to clone complete dataset: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get cloned data from cache
 */
export async function getClonedData(): Promise<{
  surahs: KalamSurah[];
  verses: { [surahId: number]: KalamAyah[] };
  reciters: KalamReciter[];
  translations: KalamTranslation[];
} | null> {
  try {
    const cached = await AsyncStorage.getItem('kalam_complete_dataset');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting cloned data:', error);
    return null;
  }
}

/**
 * Clear all cloned data from cache
 */
export async function clearClonedData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const kalamKeys = keys.filter(key => key.startsWith('kalam_'));
    await AsyncStorage.multiRemove(kalamKeys);
    console.log('✅ Cleared all cloned Kalam data from cache');
  } catch (error) {
    console.error('❌ Error clearing cloned data:', error);
  }
}

/**
 * Export cloned data to JSON file
 */
export async function exportClonedData(): Promise<string> {
  try {
    const data = await getClonedData();
    if (!data) {
      throw new Error('No cloned data found. Please clone data first.');
    }

    const exportData = {
      ...data,
      exportInfo: {
        exportedAt: new Date().toISOString(),
        source: 'kalam.alquran.ai',
        version: '1.0',
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    // In a real app, you would save this to a file
    // For now, we'll return the JSON string
    console.log('✅ Data exported successfully');
    return jsonString;

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}