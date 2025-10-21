/**
 * Bookmark Service with Supabase Sync
 * Handles bookmarking verses with offline support and cloud sync
 */

import { supabase } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const BOOKMARKS_STORAGE_KEY = 'quran_bookmarks';
const SYNC_QUEUE_KEY = 'bookmark_sync_queue';

export interface Bookmark {
  id: string;
  user_id?: string;
  surah: number;
  surah_name: string;
  surah_name_arabic: string;
  ayah: number;
  ayah_text: string;
  ayah_text_arabic: string;
  translation: string;
  transliteration?: string;
  note?: string;
  tags?: string[];
  color?: string;
  collection_id?: string;
  created_at: string;
  updated_at: string;
  sync_status: 'synced' | 'pending' | 'conflict';
}

class BookmarkService {
  private localBookmarks: Map<string, Bookmark> = new Map();
  private syncQueue: Set<string> = new Set();
  private isSyncing: boolean = false;

  constructor() {
    this.loadLocalBookmarks();
    this.setupAutoSync();
  }

  /**
   * Load bookmarks from local storage
   */
  private async loadLocalBookmarks() {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (stored) {
        const bookmarks = JSON.parse(stored) as Bookmark[];
        bookmarks.forEach(b => this.localBookmarks.set(b.id, b));
      }
    } catch (error) {
      console.error('Error loading local bookmarks:', error);
    }
  }

  /**
   * Save bookmarks to local storage
   */
  private async saveLocalBookmarks() {
    try {
      const bookmarks = Array.from(this.localBookmarks.values());
      await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving local bookmarks:', error);
    }
  }

  /**
   * Setup automatic sync when online
   */
  private setupAutoSync() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isSyncing) {
        this.syncWithSupabase();
      }
    });
  }

  /**
   * Add a new bookmark
   */
  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'created_at' | 'updated_at' | 'sync_status'>): Promise<Bookmark> {
    const id = `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const newBookmark: Bookmark = {
      ...bookmark,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      sync_status: 'pending',
    };

    // Add to local storage immediately
    this.localBookmarks.set(id, newBookmark);
    await this.saveLocalBookmarks();

    // Try to sync with Supabase
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await this.syncBookmark(newBookmark);
    } else {
      this.syncQueue.add(id);
    }

    return newBookmark;
  }

  /**
   * Remove a bookmark
   */
  async removeBookmark(id: string): Promise<void> {
    const bookmark = this.localBookmarks.get(id);
    if (!bookmark) return;

    // Remove from local storage
    this.localBookmarks.delete(id);
    await this.saveLocalBookmarks();

    // Try to remove from Supabase
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected && bookmark.sync_status === 'synced') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('bookmarks')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        }
      } catch (error) {
        console.error('Error removing bookmark from Supabase:', error);
      }
    }
  }

  /**
   * Update a bookmark
   */
  async updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark | null> {
    const bookmark = this.localBookmarks.get(id);
    if (!bookmark) return null;

    const updatedBookmark: Bookmark = {
      ...bookmark,
      ...updates,
      updated_at: new Date().toISOString(),
      sync_status: 'pending',
    };

    // Update local storage
    this.localBookmarks.set(id, updatedBookmark);
    await this.saveLocalBookmarks();

    // Try to sync with Supabase
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await this.syncBookmark(updatedBookmark);
    } else {
      this.syncQueue.add(id);
    }

    return updatedBookmark;
  }

  /**
   * Get all bookmarks
   */
  async getBookmarks(): Promise<Bookmark[]> {
    // Sync first if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await this.syncWithSupabase();
    }

    return Array.from(this.localBookmarks.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Get bookmarks for a specific surah
   */
  async getBookmarksBySurah(surah: number): Promise<Bookmark[]> {
    const allBookmarks = await this.getBookmarks();
    return allBookmarks.filter(b => b.surah === surah);
  }

  /**
   * Check if a verse is bookmarked
   */
  isBookmarked(surah: number, ayah: number): boolean {
    return Array.from(this.localBookmarks.values()).some(
      b => b.surah === surah && b.ayah === ayah
    );
  }

  /**
   * Get bookmark for a specific verse
   */
  getBookmark(surah: number, ayah: number): Bookmark | undefined {
    return Array.from(this.localBookmarks.values()).find(
      b => b.surah === surah && b.ayah === ayah
    );
  }

  /**
   * Sync a single bookmark with Supabase
   */
  private async syncBookmark(bookmark: Bookmark): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookmarks')
        .upsert({
          ...bookmark,
          user_id: user.id,
        })
        .select()
        .single();

      if (!error && data) {
        // Update local bookmark with synced status
        this.localBookmarks.set(bookmark.id, {
          ...data,
          sync_status: 'synced',
        });
        await this.saveLocalBookmarks();
        
        // Remove from sync queue
        this.syncQueue.delete(bookmark.id);
      }
    } catch (error) {
      console.error('Error syncing bookmark:', error);
    }
  }

  /**
   * Sync all bookmarks with Supabase
   */
  async syncWithSupabase(): Promise<void> {
    if (this.isSyncing) return;
    
    try {
      this.isSyncing = true;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch remote bookmarks
      const { data: remoteBookmarks, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching remote bookmarks:', error);
        return;
      }

      // Create a map of remote bookmarks
      const remoteMap = new Map<string, Bookmark>();
      remoteBookmarks?.forEach(b => remoteMap.set(b.id, b));

      // Merge local and remote bookmarks
      const localBookmarks = Array.from(this.localBookmarks.values());
      
      for (const localBookmark of localBookmarks) {
        const remoteBookmark = remoteMap.get(localBookmark.id);
        
        if (!remoteBookmark) {
          // Local bookmark doesn't exist remotely, upload it
          if (localBookmark.sync_status === 'pending') {
            await this.syncBookmark(localBookmark);
          }
        } else if (new Date(localBookmark.updated_at) > new Date(remoteBookmark.updated_at)) {
          // Local bookmark is newer, upload it
          await this.syncBookmark(localBookmark);
        } else if (new Date(remoteBookmark.updated_at) > new Date(localBookmark.updated_at)) {
          // Remote bookmark is newer, update local
          this.localBookmarks.set(remoteBookmark.id, {
            ...remoteBookmark,
            sync_status: 'synced',
          });
        }
        
        // Remove from remote map as it's been processed
        remoteMap.delete(localBookmark.id);
      }

      // Add any remaining remote bookmarks that don't exist locally
      remoteMap.forEach((remoteBookmark, id) => {
        this.localBookmarks.set(id, {
          ...remoteBookmark,
          sync_status: 'synced',
        });
      });

      // Save merged bookmarks
      await this.saveLocalBookmarks();

      // Sync any queued bookmarks
      for (const id of this.syncQueue) {
        const bookmark = this.localBookmarks.get(id);
        if (bookmark) {
          await this.syncBookmark(bookmark);
        }
      }
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Search bookmarks
   */
  async searchBookmarks(query: string): Promise<Bookmark[]> {
    const bookmarks = await this.getBookmarks();
    const lowerQuery = query.toLowerCase();
    
    return bookmarks.filter(b => 
      b.surah_name.toLowerCase().includes(lowerQuery) ||
      b.ayah_text.toLowerCase().includes(lowerQuery) ||
      b.translation.toLowerCase().includes(lowerQuery) ||
      b.note?.toLowerCase().includes(lowerQuery) ||
      b.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get bookmarks by tag
   */
  async getBookmarksByTag(tag: string): Promise<Bookmark[]> {
    const bookmarks = await this.getBookmarks();
    return bookmarks.filter(b => b.tags?.includes(tag));
  }

  /**
   * Get bookmark statistics
   */
  async getStats(): Promise<{
    totalBookmarks: number;
    bookmarksBySurah: Map<number, number>;
    recentBookmarks: Bookmark[];
    tags: string[];
  }> {
    const bookmarks = await this.getBookmarks();
    
    const bookmarksBySurah = new Map<number, number>();
    const allTags = new Set<string>();
    
    bookmarks.forEach(b => {
      // Count by surah
      const count = bookmarksBySurah.get(b.surah) || 0;
      bookmarksBySurah.set(b.surah, count + 1);
      
      // Collect tags
      b.tags?.forEach(tag => allTags.add(tag));
    });
    
    return {
      totalBookmarks: bookmarks.length,
      bookmarksBySurah,
      recentBookmarks: bookmarks.slice(0, 5),
      tags: Array.from(allTags),
    };
  }
}

// Export singleton instance
export const bookmarkService = new BookmarkService();

// Export convenience functions
export const addBookmark = bookmarkService.addBookmark.bind(bookmarkService);
export const removeBookmark = bookmarkService.removeBookmark.bind(bookmarkService);
export const updateBookmark = bookmarkService.updateBookmark.bind(bookmarkService);
export const getBookmarks = bookmarkService.getBookmarks.bind(bookmarkService);
export const getBookmarksBySurah = bookmarkService.getBookmarksBySurah.bind(bookmarkService);
export const isBookmarked = bookmarkService.isBookmarked.bind(bookmarkService);
export const getBookmark = bookmarkService.getBookmark.bind(bookmarkService);
export const searchBookmarks = bookmarkService.searchBookmarks.bind(bookmarkService);
export const getBookmarksByTag = bookmarkService.getBookmarksByTag.bind(bookmarkService);
export const getBookmarkStats = bookmarkService.getStats.bind(bookmarkService);
export const syncBookmarks = bookmarkService.syncWithSupabase.bind(bookmarkService);
