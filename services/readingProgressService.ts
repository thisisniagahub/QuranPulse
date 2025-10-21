/**
 * Reading Progress Tracker Service
 * Tracks user's Quran reading progress with analytics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

const PROGRESS_KEY = 'reading_progress';
const HISTORY_KEY = 'reading_history';
const STATS_KEY = 'reading_stats';

export interface ReadingProgress {
  currentSurah: number;
  currentAyah: number;
  lastRead: string;
  totalAyahsRead: number;
  completedSurahs: number[];
  bookmarkedPositions: Array<{
    surah: number;
    ayah: number;
    timestamp: string;
    label?: string;
  }>;
}

export interface ReadingSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  surahsRead: number[];
  ayahsRead: number;
  date: string;
}

export interface ReadingStats {
  totalReadingTime: number; // in seconds
  totalAyahsRead: number;
  totalSurahsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
  averageSessionTime: number;
  favoriteReadingTime: string; // e.g., "Morning", "Evening"
  dailyGoal: number;
  dailyProgress: number;
  weeklyProgress: number[];
  monthlyProgress: Map<string, number>;
}

export interface ReadingGoal {
  type: 'daily' | 'weekly' | 'monthly' | 'khatam';
  target: number; // ayahs or pages
  current: number;
  startDate: string;
  endDate?: string;
  completed: boolean;
}

class ReadingProgressService {
  private currentSession: ReadingSession | null = null;
  private sessionStartTime: Date | null = null;
  private progress: ReadingProgress | null = null;
  private stats: ReadingStats | null = null;

  constructor() {
    this.loadProgress();
    this.loadStats();
  }

  /**
   * Load progress from storage
   */
  private async loadProgress() {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_KEY);
      if (stored) {
        this.progress = JSON.parse(stored);
      } else {
        this.progress = {
          currentSurah: 1,
          currentAyah: 1,
          lastRead: new Date().toISOString(),
          totalAyahsRead: 0,
          completedSurahs: [],
          bookmarkedPositions: [],
        };
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }

  /**
   * Load stats from storage
   */
  private async loadStats() {
    try {
      const stored = await AsyncStorage.getItem(STATS_KEY);
      if (stored) {
        this.stats = JSON.parse(stored);
      } else {
        this.stats = {
          totalReadingTime: 0,
          totalAyahsRead: 0,
          totalSurahsCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastReadDate: '',
          averageSessionTime: 0,
          favoriteReadingTime: 'Morning',
          dailyGoal: 10,
          dailyProgress: 0,
          weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
          monthlyProgress: new Map(),
        };
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  /**
   * Save progress to storage and sync
   */
  private async saveProgress() {
    if (!this.progress) return;
    
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
      
      // Sync with Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('reading_progress')
          .upsert({
            user_id: user.id,
            ...this.progress,
            updated_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  /**
   * Save stats to storage and sync
   */
  private async saveStats() {
    if (!this.stats) return;
    
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
      
      // Sync with Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('reading_stats')
          .upsert({
            user_id: user.id,
            ...this.stats,
            updated_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  }

  /**
   * Start a reading session
   */
  startSession(surah: number, ayah: number) {
    this.sessionStartTime = new Date();
    this.currentSession = {
      id: `session_${Date.now()}`,
      startTime: this.sessionStartTime.toISOString(),
      duration: 0,
      surahsRead: [surah],
      ayahsRead: 0,
      date: this.sessionStartTime.toDateString(),
    };

    // Update current position
    if (this.progress) {
      this.progress.currentSurah = surah;
      this.progress.currentAyah = ayah;
      this.saveProgress();
    }
  }

  /**
   * End current reading session
   */
  async endSession() {
    if (!this.currentSession || !this.sessionStartTime) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - this.sessionStartTime.getTime()) / 1000);

    this.currentSession.endTime = endTime.toISOString();
    this.currentSession.duration = duration;

    // Save session to history
    await this.saveSession(this.currentSession);

    // Update stats
    if (this.stats) {
      this.stats.totalReadingTime += duration;
      this.stats.totalAyahsRead += this.currentSession.ayahsRead;
      
      // Update daily progress
      this.stats.dailyProgress += this.currentSession.ayahsRead;
      
      // Update weekly progress
      const dayOfWeek = new Date().getDay();
      this.stats.weeklyProgress[dayOfWeek] += this.currentSession.ayahsRead;
      
      // Update streak
      this.updateStreak();
      
      // Calculate average session time
      const sessions = await this.getRecentSessions(30);
      const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
      this.stats.averageSessionTime = Math.floor(totalTime / sessions.length);
      
      // Determine favorite reading time
      this.updateFavoriteReadingTime();
      
      await this.saveStats();
    }

    // Clear current session
    this.currentSession = null;
    this.sessionStartTime = null;
  }

  /**
   * Update reading progress
   */
  updateProgress(surah: number, ayah: number, completed: boolean = false) {
    if (!this.progress) return;

    this.progress.currentSurah = surah;
    this.progress.currentAyah = ayah;
    this.progress.lastRead = new Date().toISOString();
    this.progress.totalAyahsRead++;

    if (this.currentSession) {
      this.currentSession.ayahsRead++;
      if (!this.currentSession.surahsRead.includes(surah)) {
        this.currentSession.surahsRead.push(surah);
      }
    }

    if (completed && !this.progress.completedSurahs.includes(surah)) {
      this.progress.completedSurahs.push(surah);
      if (this.stats) {
        this.stats.totalSurahsCompleted++;
      }
    }

    this.saveProgress();
  }

  /**
   * Add a bookmark position
   */
  addBookmark(surah: number, ayah: number, label?: string) {
    if (!this.progress) return;

    this.progress.bookmarkedPositions.push({
      surah,
      ayah,
      timestamp: new Date().toISOString(),
      label,
    });

    // Keep only last 10 bookmarks
    if (this.progress.bookmarkedPositions.length > 10) {
      this.progress.bookmarkedPositions.shift();
    }

    this.saveProgress();
  }

  /**
   * Get current progress
   */
  getProgress(): ReadingProgress | null {
    return this.progress;
  }

  /**
   * Get reading stats
   */
  getStats(): ReadingStats | null {
    return this.stats;
  }

  /**
   * Save session to history
   */
  private async saveSession(session: ReadingSession) {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      const history = stored ? JSON.parse(stored) : [];
      
      history.push(session);
      
      // Keep only last 100 sessions
      if (history.length > 100) {
        history.shift();
      }
      
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      
      // Sync with Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('reading_sessions')
          .insert({
            ...session,
            user_id: user.id,
          });
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Get recent reading sessions
   */
  async getRecentSessions(limit: number = 10): Promise<ReadingSession[]> {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      const history = stored ? JSON.parse(stored) : [];
      return history.slice(-limit);
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  /**
   * Update reading streak
   */
  private updateStreak() {
    if (!this.stats) return;

    const today = new Date().toDateString();
    const lastRead = this.stats.lastReadDate ? new Date(this.stats.lastReadDate).toDateString() : '';

    if (today === lastRead) {
      // Already read today, no change
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastRead === yesterdayStr) {
      // Continuing streak
      this.stats.currentStreak++;
    } else {
      // Streak broken, restart
      this.stats.currentStreak = 1;
    }

    // Update longest streak
    if (this.stats.currentStreak > this.stats.longestStreak) {
      this.stats.longestStreak = this.stats.currentStreak;
    }

    this.stats.lastReadDate = today;
  }

  /**
   * Determine favorite reading time
   */
  private updateFavoriteReadingTime() {
    const hour = new Date().getHours();
    
    if (hour >= 4 && hour < 12) {
      this.stats!.favoriteReadingTime = 'Morning';
    } else if (hour >= 12 && hour < 17) {
      this.stats!.favoriteReadingTime = 'Afternoon';
    } else if (hour >= 17 && hour < 20) {
      this.stats!.favoriteReadingTime = 'Evening';
    } else {
      this.stats!.favoriteReadingTime = 'Night';
    }
  }

  /**
   * Set daily reading goal
   */
  async setDailyGoal(ayahs: number) {
    if (!this.stats) return;
    
    this.stats.dailyGoal = ayahs;
    await this.saveStats();
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(): number {
    if (!this.stats) return 0;
    
    return Math.min(100, Math.round((this.stats.dailyProgress / this.stats.dailyGoal) * 100));
  }

  /**
   * Reset daily progress (call at midnight)
   */
  async resetDailyProgress() {
    if (!this.stats) return;
    
    // Save to monthly progress
    const month = new Date().toISOString().slice(0, 7);
    const currentMonthProgress = this.stats.monthlyProgress.get(month) || 0;
    this.stats.monthlyProgress.set(month, currentMonthProgress + this.stats.dailyProgress);
    
    // Reset daily
    this.stats.dailyProgress = 0;
    
    // Shift weekly progress if new week
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0) {
      this.stats.weeklyProgress = [0, 0, 0, 0, 0, 0, 0];
    }
    
    await this.saveStats();
  }

  /**
   * Get achievement milestones
   */
  getAchievements(): Array<{ name: string; description: string; unlocked: boolean }> {
    if (!this.stats) return [];
    
    return [
      {
        name: 'First Step',
        description: 'Read your first ayah',
        unlocked: this.stats.totalAyahsRead > 0,
      },
      {
        name: 'Dedicated Reader',
        description: 'Read 100 ayahs',
        unlocked: this.stats.totalAyahsRead >= 100,
      },
      {
        name: 'Quran Explorer',
        description: 'Read 1000 ayahs',
        unlocked: this.stats.totalAyahsRead >= 1000,
      },
      {
        name: 'Surah Master',
        description: 'Complete 10 surahs',
        unlocked: this.stats.totalSurahsCompleted >= 10,
      },
      {
        name: 'Week Warrior',
        description: 'Read 7 days in a row',
        unlocked: this.stats.currentStreak >= 7,
      },
      {
        name: 'Month Champion',
        description: 'Read 30 days in a row',
        unlocked: this.stats.currentStreak >= 30,
      },
      {
        name: 'Khatam Journey',
        description: 'Read all 6236 ayahs',
        unlocked: this.stats.totalAyahsRead >= 6236,
      },
    ];
  }
}

// Export singleton
export const readingProgressService = new ReadingProgressService();

// Export convenience functions
export const startReadingSession = readingProgressService.startSession.bind(readingProgressService);
export const endReadingSession = readingProgressService.endSession.bind(readingProgressService);
export const updateReadingProgress = readingProgressService.updateProgress.bind(readingProgressService);
export const addReadingBookmark = readingProgressService.addBookmark.bind(readingProgressService);
export const getReadingProgress = readingProgressService.getProgress.bind(readingProgressService);
export const getReadingStats = readingProgressService.getStats.bind(readingProgressService);
export const getRecentSessions = readingProgressService.getRecentSessions.bind(readingProgressService);
export const setDailyGoal = readingProgressService.setDailyGoal.bind(readingProgressService);
export const getProgressPercentage = readingProgressService.getProgressPercentage.bind(readingProgressService);
export const resetDailyProgress = readingProgressService.resetDailyProgress.bind(readingProgressService);
export const getAchievements = readingProgressService.getAchievements.bind(readingProgressService);
