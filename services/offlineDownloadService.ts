/**
 * Offline Audio Download Manager
 * Handles downloading, caching, and managing Quran audio files
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const AUDIO_CACHE_DIR = `${FileSystem.documentDirectory}quran_audio/`;
const DOWNLOAD_PROGRESS_KEY = 'download_progress';
const CACHED_SURAHS_KEY = 'cached_surahs';

export interface DownloadProgress {
  surahNumber: number;
  reciter: string;
  progress: number;
  totalSize: number;
  downloadedSize: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
}

export interface CachedSurah {
  surahNumber: number;
  surahName: string;
  reciter: string;
  reciterName: string;
  fileSize: number;
  downloadDate: string;
  localPath: string;
}

class OfflineDownloadService {
  private downloadQueue: DownloadProgress[] = [];
  private currentDownload: FileSystem.DownloadResumable | null = null;
  private downloadCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();

  constructor() {
    this.initializeCache();
  }

  private async initializeCache() {
    // Create cache directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
    }
  }

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  /**
   * Get all cached surahs
   */
  async getCachedSurahs(): Promise<CachedSurah[]> {
    try {
      const cached = await AsyncStorage.getItem(CACHED_SURAHS_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting cached surahs:', error);
      return [];
    }
  }

  /**
   * Check if a surah is cached
   */
  async isSurahCached(surahNumber: number, reciter: string): Promise<boolean> {
    const cached = await this.getCachedSurahs();
    return cached.some(s => s.surahNumber === surahNumber && s.reciter === reciter);
  }

  /**
   * Get local path for cached surah
   */
  async getCachedSurahPath(surahNumber: number, reciter: string): Promise<string | null> {
    const cached = await this.getCachedSurahs();
    const surah = cached.find(s => s.surahNumber === surahNumber && s.reciter === reciter);
    
    if (surah) {
      // Verify file still exists
      const fileInfo = await FileSystem.getInfoAsync(surah.localPath);
      if (fileInfo.exists) {
        return surah.localPath;
      } else {
        // File was deleted, remove from cache list
        await this.removeCachedSurah(surahNumber, reciter);
      }
    }
    
    return null;
  }

  /**
   * Download a surah audio file
   */
  async downloadSurah(
    surahNumber: number,
    surahName: string,
    reciter: string,
    reciterName: string,
    audioUrl: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    // Check if already cached
    const cachedPath = await this.getCachedSurahPath(surahNumber, reciter);
    if (cachedPath) {
      return cachedPath;
    }

    // Check internet connection
    if (!(await this.isOnline())) {
      throw new Error('No internet connection');
    }

    const fileName = `${reciter}_${surahNumber}.mp3`;
    const localPath = AUDIO_CACHE_DIR + fileName;
    const downloadKey = `${surahNumber}_${reciter}`;

    // Create download progress object
    const progress: DownloadProgress = {
      surahNumber,
      reciter,
      progress: 0,
      totalSize: 0,
      downloadedSize: 0,
      status: 'downloading',
    };

    // Store callback
    if (onProgress) {
      this.downloadCallbacks.set(downloadKey, onProgress);
    }

    try {
      // Create download resumable
      const downloadResumable = FileSystem.createDownloadResumable(
        audioUrl,
        localPath,
        {},
        (downloadProgress) => {
          const prog = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          progress.progress = prog;
          progress.downloadedSize = downloadProgress.totalBytesWritten;
          progress.totalSize = downloadProgress.totalBytesExpectedToWrite;
          
          // Call progress callback
          const callback = this.downloadCallbacks.get(downloadKey);
          if (callback) {
            callback(progress);
          }
        }
      );

      // Start download
      this.currentDownload = downloadResumable;
      const result = await downloadResumable.downloadAsync();
      
      if (result) {
        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        
        // Save to cached list
        const cachedSurah: CachedSurah = {
          surahNumber,
          surahName,
          reciter,
          reciterName,
          fileSize: fileInfo.size || 0,
          downloadDate: new Date().toISOString(),
          localPath: result.uri,
        };

        await this.addCachedSurah(cachedSurah);
        
        // Update progress
        progress.status = 'completed';
        progress.progress = 1;
        
        // Call final progress callback
        const callback = this.downloadCallbacks.get(downloadKey);
        if (callback) {
          callback(progress);
        }

        // Clean up
        this.downloadCallbacks.delete(downloadKey);
        this.currentDownload = null;

        return result.uri;
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      progress.status = 'failed';
      
      // Call error callback
      const callback = this.downloadCallbacks.get(downloadKey);
      if (callback) {
        callback(progress);
      }
      
      // Clean up
      this.downloadCallbacks.delete(downloadKey);
      this.currentDownload = null;
      
      throw error;
    }
  }

  /**
   * Pause current download
   */
  async pauseDownload(): Promise<void> {
    if (this.currentDownload) {
      await this.currentDownload.pauseAsync();
    }
  }

  /**
   * Resume current download
   */
  async resumeDownload(): Promise<void> {
    if (this.currentDownload) {
      await this.currentDownload.resumeAsync();
    }
  }

  /**
   * Cancel current download
   */
  async cancelDownload(): Promise<void> {
    if (this.currentDownload) {
      await this.currentDownload.pauseAsync();
      this.currentDownload = null;
    }
  }

  /**
   * Add surah to cached list
   */
  private async addCachedSurah(surah: CachedSurah): Promise<void> {
    const cached = await this.getCachedSurahs();
    
    // Remove old entry if exists
    const index = cached.findIndex(
      s => s.surahNumber === surah.surahNumber && s.reciter === surah.reciter
    );
    if (index > -1) {
      cached.splice(index, 1);
    }
    
    // Add new entry
    cached.push(surah);
    
    // Save to storage
    await AsyncStorage.setItem(CACHED_SURAHS_KEY, JSON.stringify(cached));
  }

  /**
   * Remove surah from cache
   */
  async removeCachedSurah(surahNumber: number, reciter: string): Promise<void> {
    const cached = await this.getCachedSurahs();
    const surah = cached.find(s => s.surahNumber === surahNumber && s.reciter === reciter);
    
    if (surah) {
      // Delete file
      try {
        await FileSystem.deleteAsync(surah.localPath, { idempotent: true });
      } catch (error) {
        console.error('Error deleting file:', error);
      }
      
      // Remove from list
      const newCached = cached.filter(
        s => !(s.surahNumber === surahNumber && s.reciter === reciter)
      );
      
      await AsyncStorage.setItem(CACHED_SURAHS_KEY, JSON.stringify(newCached));
    }
  }

  /**
   * Clear all cached audio
   */
  async clearAllCache(): Promise<void> {
    try {
      // Delete entire cache directory
      await FileSystem.deleteAsync(AUDIO_CACHE_DIR, { idempotent: true });
      
      // Recreate empty directory
      await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
      
      // Clear storage
      await AsyncStorage.removeItem(CACHED_SURAHS_KEY);
      await AsyncStorage.removeItem(DOWNLOAD_PROGRESS_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get total cache size
   */
  async getCacheSize(): Promise<number> {
    const cached = await this.getCachedSurahs();
    return cached.reduce((total, surah) => total + surah.fileSize, 0);
  }

  /**
   * Download multiple surahs
   */
  async downloadMultipleSurahs(
    surahs: Array<{
      number: number;
      name: string;
      audioUrl: string;
    }>,
    reciter: string,
    reciterName: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    let completed = 0;
    const total = surahs.length;

    for (const surah of surahs) {
      try {
        await this.downloadSurah(
          surah.number,
          surah.name,
          reciter,
          reciterName,
          surah.audioUrl
        );
        
        completed++;
        if (onProgress) {
          onProgress(completed, total);
        }
      } catch (error) {
        console.error(`Error downloading surah ${surah.number}:`, error);
      }
    }
  }

  /**
   * Check available storage space
   */
  async getAvailableStorage(): Promise<number> {
    const info = await FileSystem.getFreeDiskStorageAsync();
    return info;
  }
}

// Export singleton instance
export const offlineDownloadService = new OfflineDownloadService();

// Export helper functions
export const downloadSurah = offlineDownloadService.downloadSurah.bind(offlineDownloadService);
export const getCachedSurahs = offlineDownloadService.getCachedSurahs.bind(offlineDownloadService);
export const isSurahCached = offlineDownloadService.isSurahCached.bind(offlineDownloadService);
export const getCachedSurahPath = offlineDownloadService.getCachedSurahPath.bind(offlineDownloadService);
export const removeCachedSurah = offlineDownloadService.removeCachedSurah.bind(offlineDownloadService);
export const clearAllCache = offlineDownloadService.clearAllCache.bind(offlineDownloadService);
export const getCacheSize = offlineDownloadService.getCacheSize.bind(offlineDownloadService);
export const getAvailableStorage = offlineDownloadService.getAvailableStorage.bind(offlineDownloadService);
