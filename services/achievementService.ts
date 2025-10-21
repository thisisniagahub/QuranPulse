/**
 * Achievement Service
 * Track and manage user achievements/badges
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

const ACHIEVEMENTS_KEY = 'user_achievements';
const PROGRESS_KEY = 'achievement_progress';

export interface Achievement {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  icon: string;
  category: 'reading' | 'memorization' | 'learning' | 'community' | 'special';
  requirement: {
    type: 'count' | 'streak' | 'milestone' | 'collection';
    target: number;
    current?: number;
  };
  reward: {
    points: number;
    badge: string;
    color: string;
  };
  unlockedAt?: Date;
  progress: number; // 0-100
  isUnlocked: boolean;
  isHidden?: boolean;
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Reading Achievements
  {
    id: 'first_verse',
    name: 'First Step',
    nameAr: 'الخطوة الأولى',
    description: 'Read your first verse',
    icon: 'book-open',
    category: 'reading',
    requirement: { type: 'count', target: 1 },
    reward: { points: 10, badge: '📖', color: '#10B981' },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'daily_reader',
    name: 'Daily Reader',
    nameAr: 'القارئ اليومي',
    description: 'Read Quran for 7 consecutive days',
    icon: 'calendar',
    category: 'reading',
    requirement: { type: 'streak', target: 7 },
    reward: { points: 50, badge: '📅', color: '#3B82F6' },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'juz_master',
    name: 'Juz Master',
    nameAr: 'متقن الجزء',
    description: 'Complete reading 1 full Juz',
    icon: 'bookmark',
    category: 'reading',
    requirement: { type: 'milestone', target: 1 },
    reward: { points: 100, badge: '🌟', color: '#F59E0B' },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'half_quran',
    name: 'Half Way There',
    nameAr: 'نصف الطريق',
    description: 'Complete reading 15 Juz',
    icon: 'trophy',
    category: 'reading',
    requirement: { type: 'milestone', target: 15 },
    reward: { points: 500, badge: '🏆', color: '#EF4444' },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'khatam_quran',
    name: 'Khatam Al-Quran',
    nameAr: 'ختم القرآن',
    description: 'Complete reading the entire Quran',
    icon: 'crown',
    category: 'reading',
    requirement: { type: 'milestone', target: 30 },
    reward: { points: 1000, badge: '👑', color: '#9333EA' },
    progress: 0,
    isUnlocked: false,
  },

  // Memorization Achievements
  {
    id: 'memorize_fatihah',
    name: 'Al-Fatihah Memorized',
    nameAr: 'حفظ الفاتحة',
    description: 'Memorize Surah Al-Fatihah',
    icon: 'brain',
    category: 'memorization',
    requirement: { type: 'milestone', target: 1 },
    reward: { points: 30, badge: '🧠', color: '#EC4899' },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'memorize_5_surahs',
    name: 'Memory Champion',
    nameAr: 'بطل الحفظ',
    description: 'Memorize 5 surahs',
    icon: 'medal',
    category: 'memorization',
    requirement: { type: 'count', target: 5 },
    reward: { points: 150, badge: '🥇', color: '#F97316' },
    progress: 0,
    isUnlocked: false,
  },

  // Learning Achievements
  {
    id: 'iqra_beginner',
    name: 'Iqra Beginner',
    nameAr: 'مبتدئ اقرأ',
    description: 'Complete Iqra Book 1',
    icon: 'school',
    category: 'learning',
    requirement: { type: 'milestone', target: 1 },
    reward: { points: 40, badge: '🎓', color: '#06B6D4' },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'iqra_graduate',
    name: 'Iqra Graduate',
    nameAr: 'خريج اقرأ',
    description: 'Complete all 6 Iqra books',
    icon: 'academic-cap',
    category: 'learning',
    requirement: { type: 'milestone', target: 6 },
    reward: { points: 300, badge: '🎯', color: '#8B5CF6' },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'tafsir_explorer',
    name: 'Tafsir Explorer',
    nameAr: 'مستكشف التفسير',
    description: 'Read tafsir for 50 verses',
    icon: 'search',
    category: 'learning',
    requirement: { type: 'count', target: 50 },
    reward: { points: 80, badge: '🔍', color: '#10B981' },
    progress: 0,
    isUnlocked: false,
  },

  // Community Achievements
  {
    id: 'share_verse',
    name: 'Verse Sharer',
    nameAr: 'مشارك الآيات',
    description: 'Share 10 verses with others',
    icon: 'share',
    category: 'community',
    requirement: { type: 'count', target: 10 },
    reward: { points: 60, badge: '🤝', color: '#3B82F6' },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'group_reader',
    name: 'Group Reader',
    nameAr: 'القارئ الجماعي',
    description: 'Join and participate in a reading group',
    icon: 'users',
    category: 'community',
    requirement: { type: 'milestone', target: 1 },
    reward: { points: 70, badge: '👥', color: '#14B8A6' },
    progress: 0,
    isUnlocked: false,
  },

  // Special Achievements
  {
    id: 'ramadan_warrior',
    name: 'Ramadan Warrior',
    nameAr: 'محارب رمضان',
    description: 'Complete Quran during Ramadan',
    icon: 'moon',
    category: 'special',
    requirement: { type: 'milestone', target: 1 },
    reward: { points: 2000, badge: '🌙', color: '#FFD700' },
    progress: 0,
    isUnlocked: false,
    isHidden: true,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    nameAr: 'قيام الليل',
    description: 'Read Quran after midnight 10 times',
    icon: 'moon-outline',
    category: 'special',
    requirement: { type: 'count', target: 10 },
    reward: { points: 100, badge: '🦉', color: '#6366F1' },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    nameAr: 'الطائر المبكر',
    description: 'Read Quran before Fajr 10 times',
    icon: 'sunny',
    category: 'special',
    requirement: { type: 'count', target: 10 },
    reward: { points: 100, badge: '🌅', color: '#FCD34D' },
    progress: 0,
    isUnlocked: false,
  },
];

export class AchievementService {
  private static achievements: Achievement[] = [...ACHIEVEMENTS];
  private static userId: string | null = null;

  /**
   * Initialize achievements
   */
  static async initialize(userId?: string) {
    this.userId = userId || null;
    await this.loadAchievements();

    if (userId) {
      await this.syncWithSupabase();
    }
  }

  /**
   * Load achievements from storage
   */
  static async loadAchievements(): Promise<Achievement[]> {
    try {
      const stored = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      if (stored) {
        const savedAchievements = JSON.parse(stored);
        // Merge with defaults
        this.achievements = ACHIEVEMENTS.map(achievement => {
          const saved = savedAchievements.find((a: Achievement) => a.id === achievement.id);
          return saved || achievement;
        });
      }
      return this.achievements;
    } catch (error) {
      console.error('Error loading achievements:', error);
      return this.achievements;
    }
  }

  /**
   * Save achievements to storage
   */
  static async saveAchievements(): Promise<void> {
    try {
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(this.achievements));

      if (this.userId) {
        await this.syncWithSupabase();
      }
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  /**
   * Sync with Supabase
   */
  static async syncWithSupabase(): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: this.userId,
          achievements: this.achievements,
          total_points: this.getTotalPoints(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error syncing achievements:', error);
    }
  }

  /**
   * Update achievement progress
   */
  static async updateProgress(
    achievementId: string,
    progress: number,
    incrementBy?: number
  ): Promise<Achievement | null> {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return null;

    if (incrementBy !== undefined) {
      achievement.requirement.current = (achievement.requirement.current || 0) + incrementBy;
      achievement.progress = Math.min(
        100,
        (achievement.requirement.current / achievement.requirement.target) * 100
      );
    } else {
      achievement.progress = Math.min(100, progress);
    }

    // Check if unlocked
    if (achievement.progress >= 100 && !achievement.isUnlocked) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date();

      // Trigger celebration
      this.celebrateAchievement(achievement);
    }

    await this.saveAchievements();
    return achievement;
  }

  /**
   * Check and update multiple achievements
   */
  static async checkAchievements(data: {
    versesRead?: number;
    streakDays?: number;
    juzCompleted?: number;
    surahsMemorized?: string[];
    versesShared?: number;
    tafsirRead?: number;
    iqraCompleted?: number;
  }): Promise<Achievement[]> {
    const unlocked: Achievement[] = [];

    // Check reading achievements
    if (data.versesRead) {
      const firstVerse = await this.updateProgress('first_verse', 100);
      if (firstVerse?.isUnlocked) unlocked.push(firstVerse);
    }

    if (data.streakDays) {
      const dailyReader = await this.updateProgress(
        'daily_reader',
        (data.streakDays / 7) * 100
      );
      if (dailyReader?.isUnlocked) unlocked.push(dailyReader);
    }

    if (data.juzCompleted) {
      const juzMaster = await this.updateProgress(
        'juz_master',
        (data.juzCompleted / 1) * 100
      );
      if (juzMaster?.isUnlocked) unlocked.push(juzMaster);

      const halfQuran = await this.updateProgress(
        'half_quran',
        (data.juzCompleted / 15) * 100
      );
      if (halfQuran?.isUnlocked) unlocked.push(halfQuran);

      const khatam = await this.updateProgress(
        'khatam_quran',
        (data.juzCompleted / 30) * 100
      );
      if (khatam?.isUnlocked) unlocked.push(khatam);
    }

    // Check other achievements...

    return unlocked;
  }

  /**
   * Celebrate achievement unlock
   */
  static celebrateAchievement(achievement: Achievement) {
    // This would trigger UI celebration
    console.log(`🎉 Achievement Unlocked: ${achievement.name}!`);
  }

  /**
   * Get all achievements
   */
  static getAchievements(category?: string): Achievement[] {
    if (category) {
      return this.achievements.filter(a => a.category === category);
    }
    return this.achievements;
  }

  /**
   * Get unlocked achievements
   */
  static getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.isUnlocked);
  }

  /**
   * Get total points
   */
  static getTotalPoints(): number {
    return this.achievements
      .filter(a => a.isUnlocked)
      .reduce((total, a) => total + a.reward.points, 0);
  }

  /**
   * Get user level based on points
   */
  static getUserLevel(): { level: number; title: string; nextLevel: number } {
    const points = this.getTotalPoints();
    const levels = [
      { min: 0, level: 1, title: 'Beginner' },
      { min: 100, level: 2, title: 'Student' },
      { min: 300, level: 3, title: 'Reader' },
      { min: 600, level: 4, title: 'Devoted' },
      { min: 1000, level: 5, title: 'Scholar' },
      { min: 1500, level: 6, title: 'Master' },
      { min: 2500, level: 7, title: 'Expert' },
      { min: 4000, level: 8, title: 'Sage' },
      { min: 6000, level: 9, title: 'Guardian' },
      { min: 10000, level: 10, title: 'Legend' },
    ];

    const currentLevel = levels.reverse().find(l => points >= l.min) || levels[0];
    const nextLevelData = levels.find(l => l.min > points);

    return {
      level: currentLevel.level,
      title: currentLevel.title,
      nextLevel: nextLevelData?.min || 999999,
    };
  }
}

export default AchievementService;
