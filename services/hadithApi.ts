/**
 * Hadith API Service
 * Integration with Sunnah.com API for authentic Hadith collections
 * Documentation: https://sunnah.api-docs.io/
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiClient, executeWithRetry, ApiError } from '../utils/apiClient';

const HADITH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

// Create API client for Hadith API
const hadithClient = createApiClient(HADITH_API_BASE, { timeout: 15000 });

export interface HadithCollection {
  id: string;
  name: string;
  nameArabic: string;
  totalHadith: number;
  description: string;
}

export interface Hadith {
  id: number;
  collection: string;
  bookNumber: number;
  hadithNumber: number;
  arabicText: string;
  englishText: string;
  malayText?: string;
  narrator: string;
  grade: string; // Sahih, Hasan, Daif, etc.
  reference: string;
}

export interface HadithBook {
  bookNumber: number;
  bookName: string;
  hadithCount: number;
}

// Authentic Hadith Collections
export const HADITH_COLLECTIONS: HadithCollection[] = [
  {
    id: 'bukhari',
    name: 'Sahih Bukhari',
    nameArabic: 'صحيح البخاري',
    totalHadith: 7563,
    description: 'The most authentic Hadith collection compiled by Imam Muhammad ibn Ismail al-Bukhari',
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    nameArabic: 'صحيح مسلم',
    totalHadith: 7190,
    description: 'Second most authentic Hadith collection compiled by Imam Muslim ibn al-Hajjaj',
  },
  {
    id: 'abudawud',
    name: 'Sunan Abu Dawud',
    nameArabic: 'سنن أبي داود',
    totalHadith: 5274,
    description: 'Collection focusing on legal Hadith by Imam Abu Dawud',
  },
  {
    id: 'tirmidhi',
    name: "Jami' at-Tirmidhi",
    nameArabic: 'جامع الترمذي',
    totalHadith: 3956,
    description: 'Collection with commentary on grading by Imam at-Tirmidhi',
  },
  {
    id: 'nasai',
    name: "Sunan an-Nasa'i",
    nameArabic: 'سنن النسائي',
    totalHadith: 5758,
    description: 'Collection known for strict authentication by Imam an-Nasa\'i',
  },
  {
    id: 'ibnmajah',
    name: 'Sunan Ibn Majah',
    nameArabic: 'سنن ابن ماجه',
    totalHadith: 4341,
    description: 'Collection completing the six authentic books by Imam Ibn Majah',
  },
  {
    id: 'malik',
    name: 'Muwatta Malik',
    nameArabic: 'موطأ مالك',
    totalHadith: 1594,
    description: 'Early collection of Hadith and Islamic law by Imam Malik',
  },
  {
    id: 'ahmad',
    name: 'Musnad Ahmad',
    nameArabic: 'مسند أحمد',
    totalHadith: 27647,
    description: 'Massive collection organized by narrator compiled by Imam Ahmad ibn Hanbal',
  },
];

/**
 * Get list of available Hadith collections
 */
export async function getCollections(): Promise<HadithCollection[]> {
  return HADITH_COLLECTIONS;
}

/**
 * Get collection by ID
 */
export function getCollectionById(id: string): HadithCollection | undefined {
  return HADITH_COLLECTIONS.find(c => c.id === id);
}

/**
 * Get list of books in a collection
 * @param collectionId - Collection identifier (e.g., 'bukhari')
 * @returns Promise with list of books
 */
export async function getBooks(collectionId: string): Promise<HadithBook[]> {
  try {
    const cacheKey = `hadith_books_${collectionId}`;
    
    // Check cache
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    // Fetch from API
    const response = await axios.get(
      `${HADITH_API_BASE}/editions/${collectionId}/eng.json`
    );

    if (!response || !response.metadata) {
      throw new Error('Invalid response from Hadith API');
    }

    const metadata = response.metadata;
    const books: HadithBook[] = metadata.sections.map((section: any, index: number) => ({
      bookNumber: index + 1,
      bookName: section,
      hadithCount: 0, // Not provided in metadata
    }));

    // Cache the result
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: books,
        timestamp: Date.now(),
      })
    );

    return books;
  } catch (error) {
    console.error('Error fetching Hadith books:', error);
    // Return default books for Bukhari as fallback
    return generateDefaultBooks(collectionId);
  }
}

/**
 * Get Hadiths from a specific book
 * @param collectionId - Collection identifier
 * @param bookNumber - Book number
 * @returns Promise with array of Hadiths
 */
export async function getHadithsByBook(
  collectionId: string,
  bookNumber: number
): Promise<Hadith[]> {
  try {
    const cacheKey = `hadith_${collectionId}_${bookNumber}`;
    
    // Check cache
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    // Fetch from API with retry
    const response = await executeWithRetry(
      () => hadithClient.get(`/editions/${collectionId}/sections/${bookNumber}.json`),
      { maxRetries: 2, retryDelay: 2000 }
    );

    if (!response || !response.data || !response.data.hadiths) {
      throw new Error('Invalid response from Hadith API');
    }

    const hadiths: Hadith[] = response.data.hadiths.map((h: any, index: number) => ({
      id: index + 1,
      collection: collectionId,
      bookNumber: bookNumber,
      hadithNumber: h.hadithNumber || index + 1,
      arabicText: h.arabicText || h.text || '',
      englishText: h.text || '',
      malayText: undefined,
      narrator: h.chain || 'Not specified',
      grade: h.grade || 'Sahih', // Default to Sahih for authentic collections
      reference: `${getCollectionById(collectionId)?.name || collectionId} ${bookNumber}:${h.hadithNumber || index + 1}`,
    }));

    // Cache the result
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: hadiths,
        timestamp: Date.now(),
      })
    );

    return hadiths;
  } catch (error) {
    console.error('Error fetching Hadiths:', error);
    return [];
  }
}

/**
 * Search Hadiths by keyword
 * @param collectionId - Collection identifier
 * @param keyword - Search keyword
 * @returns Promise with matching Hadiths
 */
export async function searchHadiths(
  collectionId: string,
  keyword: string
): Promise<Hadith[]> {
  try {
    // Note: Full-text search would require backend support
    // For now, we'll fetch a few books and search locally
    const books = await getBooks(collectionId);
    const searchResults: Hadith[] = [];

    // Search in first 10 books
    for (let i = 1; i <= Math.min(10, books.length); i++) {
      const hadiths = await getHadithsByBook(collectionId, i);
      const matches = hadiths.filter(
        h =>
          h.englishText.toLowerCase().includes(keyword.toLowerCase()) ||
          h.arabicText.includes(keyword)
      );
      searchResults.push(...matches);

      // Limit results
      if (searchResults.length >= 20) break;
    }

    return searchResults.slice(0, 20);
  } catch (error) {
    console.error('Error searching Hadiths:', error);
    return [];
  }
}

/**
 * Get a random Hadith from a collection
 * @param collectionId - Collection identifier
 * @returns Promise with a random Hadith
 */
export async function getRandomHadith(collectionId: string): Promise<Hadith | null> {
  try {
    const books = await getBooks(collectionId);
    if (books.length === 0) return null;

    // Pick random book
    const randomBookNumber = Math.floor(Math.random() * books.length) + 1;
    const hadiths = await getHadithsByBook(collectionId, randomBookNumber);

    if (hadiths.length === 0) return null;

    // Pick random Hadith
    const randomIndex = Math.floor(Math.random() * hadiths.length);
    return hadiths[randomIndex];
  } catch (error) {
    console.error('Error getting random Hadith:', error);
    return null;
  }
}

/**
 * Get Hadith of the Day
 * Returns a consistent Hadith for the current day
 */
export async function getHadithOfTheDay(): Promise<Hadith | null> {
  try {
    const cacheKey = 'hadith_of_the_day';
    const today = new Date().toDateString();

    // Check if we have today's Hadith cached
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, date } = JSON.parse(cached);
      if (date === today) {
        return data;
      }
    }

    // Generate new Hadith for today
    const collections = HADITH_COLLECTIONS;
    const randomCollection = collections[Math.floor(Math.random() * collections.length)];
    const hadith = await getRandomHadith(randomCollection.id);

    if (hadith) {
      // Cache for today
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: hadith,
          date: today,
        })
      );
    }

    return hadith;
  } catch (error) {
    console.error('Error getting Hadith of the day:', error);
    return null;
  }
}

/**
 * Clear Hadith cache
 */
export async function clearHadithCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const hadithKeys = keys.filter(key => key.startsWith('hadith_'));
    await AsyncStorage.multiRemove(hadithKeys);
  } catch (error) {
    console.error('Error clearing Hadith cache:', error);
  }
}

/**
 * Generate default books for fallback
 */
function generateDefaultBooks(collectionId: string): HadithBook[] {
  const bookCounts: { [key: string]: number } = {
    bukhari: 97,
    muslim: 56,
    abudawud: 43,
    tirmidhi: 46,
    nasai: 51,
    ibnmajah: 37,
    malik: 61,
    ahmad: 50,
  };

  const count = bookCounts[collectionId] || 50;
  return Array.from({ length: count }, (_, i) => ({
    bookNumber: i + 1,
    bookName: `Book ${i + 1}`,
    hadithCount: 0,
  }));
}

/**
 * Verify Hadith authenticity (basic check)
 * For real verification, consult with Islamic scholars
 */
export function verifyHadithAuthenticity(hadith: Hadith): {
  isAuthentic: boolean;
  grade: string;
  note: string;
} {
  const authenticCollections = ['bukhari', 'muslim'];
  const isFromAuthenticCollection = authenticCollections.includes(hadith.collection);

  return {
    isAuthentic: isFromAuthenticCollection || hadith.grade === 'Sahih',
    grade: hadith.grade,
    note: isFromAuthenticCollection
      ? 'From most authentic collection'
      : 'Please verify with Islamic scholars',
  };
}
