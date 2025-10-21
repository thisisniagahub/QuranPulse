/**
 * Audio Download Service
 * Handles offline audio download and management
 */

import * as FileSystem from 'expo-file-system';
import { supabaseClient } from './supabaseClient';
import { AudioTrack, Reciter } from '../types';
import { createApiClient } from '../utils/apiClient';

const downloadClient = createApiClient('audio-download');

export interface DownloadProgress {
  trackId: string;
  progress: number;
  status: 'downloading' | 'completed' | 'failed' | 'paused';
  bytesDownloaded: number;
  totalBytes: number;
}

export interface DownloadQueueItem {
  trackId: string;
  reciterId: string;
  surahNumber: number;
  priority: 'high' | 'normal' | 'low';
  retryCount: number;
  maxRetries: number;
}

class AudioDownloadService {
  private downloadQueue: DownloadQueueItem[] = [];
  private activeDownloads: Map<string, DownloadProgress> = new Map();
  private maxConcurrentDownloads = 3;
  private downloadCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();
  private isProcessing = false;

  /**
   * Add track to download queue
   */
  async addToQueue(
    trackId: string,
    reciterId: string,
    surahNumber: number,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {
    try {
      // Check if already in queue or downloaded
      const existingItem = this.downloadQueue.find(item => item.trackId === trackId);
      if (existingItem) {
        throw new Error('Track already in download queue');
      }

      const isDownloaded = await this.isTrackDownloaded(trackId);
      if (isDownloaded) {
        throw new Error('Track already downloaded');
      }

      const queueItem: DownloadQueueItem = {
        trackId,
        reciterId,
        surahNumber,
        priority,
        retryCount: 0,
        maxRetries: 3,
      };

      this.downloadQueue.push(queueItem);
      this.sortQueueByPriority();

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processDownloadQueue();
      }

      // Save to database
      await this.saveDownloadQueue();
    } catch (error) {
      console.error('Error adding track to download queue:', error);
      throw error;
    }
  }

  /**
   * Remove track from download queue
   */
  async removeFromQueue(trackId: string): Promise<void> {
    try {
      this.downloadQueue = this.downloadQueue.filter(item => item.trackId !== trackId);
      await this.saveDownloadQueue();
    } catch (error) {
      console.error('Error removing track from queue:', error);
      throw error;
    }
  }

  /**
   * Get download queue
   */
  getDownloadQueue(): DownloadQueueItem[] {
    return [...this.downloadQueue];
  }

  /**
   * Get active downloads
   */
  getActiveDownloads(): DownloadProgress[] {
    return Array.from(this.activeDownloads.values());
  }

  /**
   * Get download progress for a track
   */
  getDownloadProgress(trackId: string): DownloadProgress | null {
    return this.activeDownloads.get(trackId) || null;
  }

  /**
   * Subscribe to download progress
   */
  subscribeToProgress(trackId: string, callback: (progress: DownloadProgress) => void): () => void {
    this.downloadCallbacks.set(trackId, callback);
    
    // Return unsubscribe function
    return () => {
      this.downloadCallbacks.delete(trackId);
    };
  }

  /**
   * Check if track is downloaded
   */
  async isTrackDownloaded(trackId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseClient
        .from('downloaded_audio')
        .select('id')
        .eq('track_id', trackId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking if track is downloaded:', error);
      return false;
    }
  }

  /**
   * Get downloaded tracks
   */
  async getDownloadedTracks(): Promise<AudioTrack[]> {
    try {
      const { data, error } = await supabaseClient
        .from('downloaded_audio')
        .select(`
          *,
          track:audio_tracks (*)
        `);

      if (error) throw error;

      return data?.map(item => item.track).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting downloaded tracks:', error);
      throw error;
    }
  }

  /**
   * Delete downloaded track
   */
  async deleteDownloadedTrack(trackId: string): Promise<void> {
    try {
      // Get local file path
      const { data: downloadData } = await supabaseClient
        .from('downloaded_audio')
        .select('local_path')
        .eq('track_id', trackId)
        .single();

      if (downloadData?.local_path) {
        // Delete local file
        await FileSystem.deleteAsync(downloadData.local_path, { idempotent: true });
      }

      // Remove from database
      const { error } = await supabaseClient
        .from('downloaded_audio')
        .delete()
        .eq('track_id', trackId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting downloaded track:', error);
      throw error;
    }
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{
    totalSize: number;
    totalTracks: number;
    availableSpace: number;
  }> {
    try {
      const downloadedTracks = await this.getDownloadedTracks();
      
      let totalSize = 0;
      for (const track of downloadedTracks) {
        if (track.fileSize) {
          totalSize += track.fileSize;
        }
      }

      const totalTracks = downloadedTracks.length;
      
      // Get available space (this is a simplified calculation)
      const availableSpace = await this.getAvailableSpace();

      return {
        totalSize,
        totalTracks,
        availableSpace,
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      throw error;
    }
  }

  /**
   * Clear all downloads
   */
  async clearAllDownloads(): Promise<void> {
    try {
      const downloadedTracks = await this.getDownloadedTracks();
      
      // Delete all local files
      for (const track of downloadedTracks) {
        if (track.localPath) {
          await FileSystem.deleteAsync(track.localPath, { idempotent: true });
        }
      }

      // Clear database
      const { error } = await supabaseClient
        .from('downloaded_audio')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      // Clear queue
      this.downloadQueue = [];
      await this.saveDownloadQueue();
    } catch (error) {
      console.error('Error clearing all downloads:', error);
      throw error;
    }
  }

  /**
   * Process download queue
   */
  private async processDownloadQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      while (this.downloadQueue.length > 0 && this.activeDownloads.size < this.maxConcurrentDownloads) {
        const item = this.downloadQueue.shift();
        if (!item) break;

        this.downloadTrack(item);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Download a single track
   */
  private async downloadTrack(item: DownloadQueueItem): Promise<void> {
    const { trackId, reciterId, surahNumber } = item;

    try {
      // Get track info
      const track = await this.getTrackInfo(trackId, reciterId, surahNumber);
      if (!track) {
        throw new Error('Track not found');
      }

      // Create progress entry
      const progress: DownloadProgress = {
        trackId,
        progress: 0,
        status: 'downloading',
        bytesDownloaded: 0,
        totalBytes: track.fileSize || 0,
      };

      this.activeDownloads.set(trackId, progress);
      this.notifyProgress(trackId, progress);

      // Create local file path
      const fileName = `${reciterId}_${surahNumber}.mp3`;
      const localPath = `${FileSystem.documentDirectory}audio/${fileName}`;

      // Ensure directory exists
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}audio/`, { intermediates: true });

      // Download file
      const downloadResult = await FileSystem.downloadAsync(
        track.fileUrl,
        localPath,
        {
          progressCallback: (downloadProgress) => {
            const newProgress: DownloadProgress = {
              ...progress,
              progress: downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpected,
              bytesDownloaded: downloadProgress.totalBytesWritten,
              totalBytes: downloadProgress.totalBytesExpected,
            };
            
            this.activeDownloads.set(trackId, newProgress);
            this.notifyProgress(trackId, newProgress);
          },
        }
      );

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      // Save to database
      await this.saveDownloadedTrack(trackId, localPath, track.fileSize || 0);

      // Update progress
      const completedProgress: DownloadProgress = {
        ...progress,
        progress: 1,
        status: 'completed',
        bytesDownloaded: track.fileSize || 0,
      };

      this.activeDownloads.set(trackId, completedProgress);
      this.notifyProgress(trackId, completedProgress);

      // Remove from active downloads after a delay
      setTimeout(() => {
        this.activeDownloads.delete(trackId);
      }, 2000);

    } catch (error) {
      console.error('Error downloading track:', error);
      
      // Update progress
      const failedProgress: DownloadProgress = {
        trackId,
        progress: 0,
        status: 'failed',
        bytesDownloaded: 0,
        totalBytes: 0,
      };

      this.activeDownloads.set(trackId, failedProgress);
      this.notifyProgress(trackId, failedProgress);

      // Retry if under max retries
      if (item.retryCount < item.maxRetries) {
        item.retryCount++;
        this.downloadQueue.push(item);
        this.sortQueueByPriority();
      }

      // Remove from active downloads
      setTimeout(() => {
        this.activeDownloads.delete(trackId);
      }, 2000);
    }

    // Continue processing queue
    this.processDownloadQueue();
  }

  /**
   * Get track info
   */
  private async getTrackInfo(trackId: string, reciterId: string, surahNumber: number): Promise<AudioTrack | null> {
    try {
      // Try to get from database first
      const { data: existingTrack } = await supabaseClient
        .from('audio_tracks')
        .select('*')
        .eq('id', trackId)
        .single();

      if (existingTrack) {
        return existingTrack;
      }

      // If not in database, create new track entry
      const track: Omit<AudioTrack, 'id'> = {
        reciterId,
        surahNumber,
        fileUrl: `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.${reciterId}`,
        fileSize: 0, // Will be updated after download
        durationSeconds: 0,
        quality: 'high',
        isDownloaded: false,
        localPath: null,
        createdAt: new Date().toISOString(),
      };

      const { data: newTrack, error } = await supabaseClient
        .from('audio_tracks')
        .insert(track)
        .select()
        .single();

      if (error) throw error;

      return newTrack;
    } catch (error) {
      console.error('Error getting track info:', error);
      return null;
    }
  }

  /**
   * Save downloaded track to database
   */
  private async saveDownloadedTrack(trackId: string, localPath: string, fileSize: number): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from('downloaded_audio')
        .insert({
          track_id: trackId,
          local_path: localPath,
          file_size: fileSize,
          downloaded_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update track as downloaded
      await supabaseClient
        .from('audio_tracks')
        .update({
          is_downloaded: true,
          local_path: localPath,
          file_size: fileSize,
        })
        .eq('id', trackId);

    } catch (error) {
      console.error('Error saving downloaded track:', error);
      throw error;
    }
  }

  /**
   * Save download queue to database
   */
  private async saveDownloadQueue(): Promise<void> {
    try {
      // This would typically save to AsyncStorage or a local database
      // For now, we'll just log it
      console.log('Download queue saved:', this.downloadQueue);
    } catch (error) {
      console.error('Error saving download queue:', error);
    }
  }

  /**
   * Load download queue from database
   */
  private async loadDownloadQueue(): Promise<void> {
    try {
      // This would typically load from AsyncStorage or a local database
      // For now, we'll just initialize empty
      this.downloadQueue = [];
    } catch (error) {
      console.error('Error loading download queue:', error);
    }
  }

  /**
   * Sort queue by priority
   */
  private sortQueueByPriority(): void {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    this.downloadQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Notify progress callbacks
   */
  private notifyProgress(trackId: string, progress: DownloadProgress): void {
    const callback = this.downloadCallbacks.get(trackId);
    if (callback) {
      callback(progress);
    }
  }

  /**
   * Get available space
   */
  private async getAvailableSpace(): Promise<number> {
    try {
      const info = await FileSystem.getFreeDiskStorageAsync();
      return info;
    } catch (error) {
      console.error('Error getting available space:', error);
      return 0;
    }
  }

  /**
   * Initialize service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadDownloadQueue();
      this.processDownloadQueue();
    } catch (error) {
      console.error('Error initializing audio download service:', error);
    }
  }
}

export default new AudioDownloadService();