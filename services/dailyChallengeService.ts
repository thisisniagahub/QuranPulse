/**
 * Daily Challenge Service
 * Manage daily Quran reading challenges
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const CHALLENGES_KEY = 'daily_challenges';
const CURRENT_CHALLENGE_KEY = 'current_challenge';

export interface Challenge {
  id: string;
  date: string;
  title: string;
  titleAr?: string;
  description: string;
  type: 'reading' | 'memorization' | 'reflection' | 'learning' | 'practice';
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: {
    action: string;
    target: number | string;
    current?: number;
  };
  reward: {
    points: number;
    badge?: string;
  };
  timeLimit?: number; // in minutes
  isCompleted: boolean;
  completedAt?: Date;
  expiresAt: Date;
}

// Challenge templates
const CHALLENGE_TEMPLATES = [
  // Easy Challenges
  {
    title: 'Morning Reader',
    titleAr: 'قارئ الصباح',
    description: 'Read 10 verses before noon',
    type: 'reading' as const,
    difficulty: 'easy' as const,
    requirements: { action: 'read_verses', target: 10 },
    reward: { points: 20, badge: '🌅' },
  },
  {
    title: 'Surah Explorer',
    titleAr: 'مستكشف السور',
    description: 'Read any complete short surah',
    type: 'reading' as const,
    difficulty: 'easy' as const,
    requirements: { action: 'complete_surah', target: 1 },
    reward: { points: 25, badge: '📖' },
  },
  {
    title: 'Reflection Time',
    titleAr: 'وقت التدبر',
    description: 'Read tafsir for 5 verses',
    type: 'reflection' as const,
    difficulty: 'easy' as const,
    requirements: { action: 'read_tafsir', target: 5 },
    reward: { points: 30, badge: '💭' },
  },
  
  // Medium Challenges
  {
    title: 'Page Turner',
    titleAr: 'قلب الصفحات',
    description: 'Read 3 full pages',
    type: 'reading' as const,
    difficulty: 'medium' as const,
    requirements: { action: 'read_pages', target: 3 },
    reward: { points: 40, badge: '📚' },
  },
  {
    title: 'Memory Test',
    titleAr: 'اختبار الحفظ',
    description: 'Memorize and recite 3 verses',
    type: 'memorization' as const,
    difficulty: 'medium' as const,
    requirements: { action: 'memorize_verses', target: 3 },
    reward: { points: 50, badge: '🧠' },
  },
  {
    title: 'Share the Light',
    titleAr: 'شارك النور',
    description: 'Share 3 verses with friends',
    type: 'practice' as const,
    difficulty: 'medium' as const,
    requirements: { action: 'share_verses', target: 3 },
    reward: { points: 35, badge: '💫' },
  },
  
  // Hard Challenges
  {
    title: 'Juz Champion',
    titleAr: 'بطل الجزء',
    description: 'Complete reading 1 full Juz',
    type: 'reading' as const,
    difficulty: 'hard' as const,
    requirements: { action: 'complete_juz', target: 1 },
    reward: { points: 100, badge: '🏆' },
  },
  {
    title: 'Night Prayer',
    titleAr: 'قيام الليل',
    description: 'Read 50 verses after Isha',
    type: 'practice' as const,
    difficulty: 'hard' as const,
    requirements: { action: 'read_verses_night', target: 50 },
    reward: { points: 80, badge: '🌙' },
  },
  {
    title: 'Deep Study',
    titleAr: 'الدراسة العميقة',
    description: 'Study tafsir for a complete surah',
    type: 'learning' as const,
    difficulty: 'hard' as const,
    requirements: { action: 'study_tafsir_surah', target: 1 },
    reward: { points: 90, badge: '📜' },
  },
];

export class DailyChallengeService {
  private static currentChallenge: Challenge | null = null;
  private static challengeHistory: Challenge[] = [];

  /**
   * Initialize service
   */
  static async initialize() {
    await this.loadCurrentChallenge();
    await this.loadHistory();
    
    // Check if we need a new challenge
    if (!this.currentChallenge || this.isChallengeExpired()) {
      await this.generateNewChallenge();
    }
  }

  /**
   * Load current challenge
   */
  static async loadCurrentChallenge(): Promise<Challenge | null> {
    try {
      const stored = await AsyncStorage.getItem(CURRENT_CHALLENGE_KEY);
      if (stored) {
        this.currentChallenge = JSON.parse(stored);
        return this.currentChallenge;
      }
    } catch (error) {
      console.error('Error loading current challenge:', error);
    }
    return null;
  }

  /**
   * Load challenge history
   */
  static async loadHistory(): Promise<Challenge[]> {
    try {
      const stored = await AsyncStorage.getItem(CHALLENGES_KEY);
      if (stored) {
        this.challengeHistory = JSON.parse(stored);
        return this.challengeHistory;
      }
    } catch (error) {
      console.error('Error loading challenge history:', error);
    }
    return [];
  }

  /**
   * Generate new daily challenge
   */
  static async generateNewChallenge(): Promise<Challenge> {
    // Get user level for difficulty adjustment
    const userLevel = await this.getUserLevel();
    
    // Filter challenges by appropriate difficulty
    let availableTemplates = CHALLENGE_TEMPLATES;
    if (userLevel < 3) {
      availableTemplates = CHALLENGE_TEMPLATES.filter(c => c.difficulty === 'easy');
    } else if (userLevel < 6) {
      availableTemplates = CHALLENGE_TEMPLATES.filter(c => 
        c.difficulty === 'easy' || c.difficulty === 'medium'
      );
    }
    
    // Avoid recent challenges
    const recentChallenges = this.challengeHistory.slice(-5).map(c => c.title);
    availableTemplates = availableTemplates.filter(t => 
      !recentChallenges.includes(t.title)
    );
    
    // Pick random template
    const template = availableTemplates[
      Math.floor(Math.random() * availableTemplates.length)
    ];
    
    // Create challenge
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const challenge: Challenge = {
      id: `challenge_${Date.now()}`,
      date: now.toDateString(),
      ...template,
      requirements: { ...template.requirements, current: 0 },
      isCompleted: false,
      expiresAt: tomorrow,
    };
    
    this.currentChallenge = challenge;
    await this.saveCurrentChallenge();
    
    return challenge;
  }

  /**
   * Save current challenge
   */
  static async saveCurrentChallenge(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CURRENT_CHALLENGE_KEY,
        JSON.stringify(this.currentChallenge)
      );
    } catch (error) {
      console.error('Error saving current challenge:', error);
    }
  }

  /**
   * Update challenge progress
   */
  static async updateProgress(
    action: string,
    value: number
  ): Promise<{ completed: boolean; reward?: any }> {
    if (!this.currentChallenge || this.currentChallenge.isCompleted) {
      return { completed: false };
    }
    
    if (this.currentChallenge.requirements.action === action) {
      this.currentChallenge.requirements.current = 
        (this.currentChallenge.requirements.current || 0) + value;
      
      // Check if completed
      if (this.currentChallenge.requirements.current >= 
          this.currentChallenge.requirements.target) {
        this.currentChallenge.isCompleted = true;
        this.currentChallenge.completedAt = new Date();
        
        // Add to history
        this.challengeHistory.push(this.currentChallenge);
        await this.saveHistory();
        
        // Save completion
        await this.saveCurrentChallenge();
        
        return {
          completed: true,
          reward: this.currentChallenge.reward,
        };
      }
      
      await this.saveCurrentChallenge();
    }
    
    return { completed: false };
  }

  /**
   * Save challenge history
   */
  static async saveHistory(): Promise<void> {
    try {
      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      this.challengeHistory = this.challengeHistory.filter(c => 
        new Date(c.date) > thirtyDaysAgo
      );
      
      await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(this.challengeHistory));
    } catch (error) {
      console.error('Error saving challenge history:', error);
    }
  }

  /**
   * Check if challenge is expired
   */
  static isChallengeExpired(): boolean {
    if (!this.currentChallenge) return true;
    return new Date() > new Date(this.currentChallenge.expiresAt);
  }

  /**
   * Get current challenge
   */
  static getCurrentChallenge(): Challenge | null {
    if (this.isChallengeExpired()) {
      this.generateNewChallenge();
    }
    return this.currentChallenge;
  }

  /**
   * Get challenge streak
   */
  static getStreak(): number {
    if (this.challengeHistory.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasChallenge = this.challengeHistory.some(c => {
        const challengeDate = new Date(c.date);
        challengeDate.setHours(0, 0, 0, 0);
        return challengeDate.getTime() === checkDate.getTime() && c.isCompleted;
      });
      
      if (hasChallenge) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Get completion stats
   */
  static getStats() {
    const total = this.challengeHistory.length;
    const completed = this.challengeHistory.filter(c => c.isCompleted).length;
    const streak = this.getStreak();
    
    const byType = {};
    const byDifficulty = {};
    
    this.challengeHistory.forEach(c => {
      if (c.isCompleted) {
        byType[c.type] = (byType[c.type] || 0) + 1;
        byDifficulty[c.difficulty] = (byDifficulty[c.difficulty] || 0) + 1;
      }
    });
    
    return {
      total,
      completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      streak,
      byType,
      byDifficulty,
    };
  }

  /**
   * Get user level (mock - should integrate with achievement service)
   */
  static async getUserLevel(): Promise<number> {
    // This would normally check actual user level
    return 5;
  }
}

export default DailyChallengeService;
