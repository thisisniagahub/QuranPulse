/**
 * Enhanced Offline Manager Service
 * Manages offline content including Quran verses, translations, and audio
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { SURAHS } from '../constants/surahs';

const OFFLINE_STORAGE_KEY = 'offline_content';
const OFFLINE_DIR = `${FileSystem.documentDirectory}offline/`;

export interface OfflineContent {
  surahs: number[];
  audio: {
    [surahId: number]: {
      reciterId: number;
      downloaded: boolean;
      filePath: string;
      size: number;
    };
  };
  translations: {
    [language: string]: boolean;
  };
  lastUpdated: string;
}

export interface DownloadProgress {
  surahId: number;
  progress: number; // 0-100
  status: 'downloading' | 'completed' | 'failed';
  error?: string;
}

/**
 * Initialize offline directory
 */
export async function initializeOfflineStorage(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Error initializing offline storage:', error);
    throw new Error('Failed to initialize offline storage');
  }
}

/**
 * Get offline content status
 */
export async function getOfflineStatus(): Promise<OfflineContent> {
  try {
    const stored = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Default empty status
    return {
      surahs: [],
      audio: {},
      translations: {
        en: false,
        ms: false,
        id: false,
      },
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting offline status:', error);
    throw error;
  }
}

/**
 * Update offline content status
 */
async function updateOfflineStatus(updates: Partial<OfflineContent>): Promise<void> {
  try {
    const current = await getOfflineStatus();
    const updated = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating offline status:', error);
    throw error;
  }
}

/**
 * Download a Surah for offline use
 */
export async function downloadSurah(
  surahId: number,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  try {
    const surah = SURAHS.find(s => s.number === surahId);
    if (!surah) {
      throw new Error(`Surah ${surahId} not found`);
    }

    // Initialize
    await initializeOfflineStorage();

    // Report progress
    onProgress?.({
      surahId,
      progress: 0,
      status: 'downloading',
    });

    // Download verses (from local data/kalam)
    const versesFile = `${FileSystem.documentDirectory}../data/kalam/verses_${surahId}.json`;
    const versesInfo = await FileSystem.getInfoAsync(versesFile);
    
    if (!versesInfo.exists) {
      throw new Error(`Verses file for Surah ${surahId} not found`);
    }

    // Copy to offline directory
    const offlineVersesPath = `${OFFLINE_DIR}verses_${surahId}.json`;
    await FileSystem.copyAsync({
      from: versesFile,
      to: offlineVersesPath,
    });

    // Update progress
    onProgress?.({
      surahId,
      progress: 100,
      status: 'completed',
    });

    // Update offline status
    const status = await getOfflineStatus();
    if (!status.surahs.includes(surahId)) {
      status.surahs.push(surahId);
      await updateOfflineStatus(status);
    }
  } catch (error) {
    onProgress?.({
      surahId,
      progress: 0,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Download audio for a Surah
 */
export async function downloadSurahAudio(
  surahId: number,
  audioUrl: string,
  reciterId: number,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    await initializeOfflineStorage();

    const fileName = `audio_${surahId}_${reciterId}.mp3`;
    const filePath = `${OFFLINE_DIR}${fileName}`;

    // Download with progress tracking
    const downloadResumable = FileSystem.createDownloadResumable(
      audioUrl,
      filePath,
      {},
      (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        onProgress?.(Math.round(progress * 100));
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result) {
      throw new Error('Download failed');
    }

    // Update offline status
    const status = await getOfflineStatus();
    status.audio[surahId] = {
      reciterId,
      downloaded: true,
      filePath: result.uri,
      size: (await FileSystem.getInfoAsync(result.uri)).size || 0,
    };
    await updateOfflineStatus(status);

    return result.uri;
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw error;
  }
}

/**
 * Download multiple Surahs (batch download)
 */
export async function downloadMultipleSurahs(
  surahIds: number[],
  onProgress?: (surahId: number, progress: DownloadProgress) => void
): Promise<void> {
  for (const surahId of surahIds) {
    try {
      await downloadSurah(surahId, (progress) => {
        onProgress?.(surahId, progress);
      });
    } catch (error) {
      console.error(`Failed to download Surah ${surahId}:`, error);
      // Continue with next surah
    }
  }
}

/**
 * Download entire Juz
 */
export async function downloadJuz(
  juzNumber: number,
  onProgress?: (surahId: number, progress: DownloadProgress) => void
): Promise<void> {
  // Get surahs in this juz (simplified - in production, use proper juz mapping)
  const surahsInJuz = SURAHS.filter(s => {
    // This is a simplified mapping - you should use proper juz data
    return s.number >= (juzNumber - 1) * 4 && s.number < juzNumber * 4;
  }).map(s => s.number);

  await downloadMultipleSurahs(surahsInJuz, onProgress);
}

/**
 * Check if a Surah is available offline
 */
export async function isSurahAvailableOffline(surahId: number): Promise<boolean> {
  try {
    const status = await getOfflineStatus();
    return status.surahs.includes(surahId);
  } catch (error) {
    return false;
  }
}

/**
 * Get offline Surah data
 */
export async function getOfflineSurah(surahId: number): Promise<any> {
  try {
    const filePath = `${OFFLINE_DIR}verses_${surahId}.json`;
    const content = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading offline surah:', error);
    throw new Error('Surah not available offline');
  }
}

/**
 * Delete offline content for a Surah
 */
export async function deleteSurahOffline(surahId: number): Promise<void> {
  try {
    // Delete verses
    const versesPath = `${OFFLINE_DIR}verses_${surahId}.json`;
    const versesInfo = await FileSystem.getInfoAsync(versesPath);
    if (versesInfo.exists) {
      await FileSystem.deleteAsync(versesPath);
    }

    // Delete audio if exists
    const status = await getOfflineStatus();
    if (status.audio[surahId]) {
      const audioPath = status.audio[surahId].filePath;
      const audioInfo = await FileSystem.getInfoAsync(audioPath);
      if (audioInfo.exists) {
        await FileSystem.deleteAsync(audioPath);
      }
      delete status.audio[surahId];
    }

    // Update status
    status.surahs = status.surahs.filter(id => id !== surahId);
    await updateOfflineStatus(status);
  } catch (error) {
    console.error('Error deleting offline surah:', error);
    throw error;
  }
}

/**
 * Get total offline storage size
 */
export async function getOfflineStorageSize(): Promise<number> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);
    if (!dirInfo.exists) {
      return 0;
    }

    const files = await FileSystem.readDirectoryAsync(OFFLINE_DIR);
    let totalSize = 0;

    for (const file of files) {
      const filePath = `${OFFLINE_DIR}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      totalSize += fileInfo.size || 0;
    }

    return totalSize;
  } catch (error) {
    console.error('Error getting storage size:', error);
    return 0;
  }
}

/**
 * Clear all offline content
 */
export async function clearAllOfflineContent(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(OFFLINE_DIR, { idempotent: true });
      await initializeOfflineStorage();
    }

    // Reset status
    await AsyncStorage.removeItem(OFFLINE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing offline content:', error);
    throw error;
  }
}

/**
 * Get offline statistics
 */
export async function getOfflineStatistics(): Promise<{
  totalSurahs: number;
  totalAudio: number;
  totalSize: number;
  totalSizeMB: string;
}> {
  try {
    const status = await getOfflineStatus();
    const size = await getOfflineStorageSize();

    return {
      totalSurahs: status.surahs.length,
      totalAudio: Object.keys(status.audio).length,
      totalSize: size,
      totalSizeMB: (size / (1024 * 1024)).toFixed(2),
    };
  } catch (error) {
    return {
      totalSurahs: 0,
      totalAudio: 0,
      totalSize: 0,
      totalSizeMB: '0.00',
    };
  }
}

