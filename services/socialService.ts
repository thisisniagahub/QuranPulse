/**
 * Social Service
 * Handles social features like feed, stats, and social interactions
 */

import { supabaseClient } from './supabaseClient';
import { SocialStats, SocialFeedItem, SharedProgress, Like, Comment } from '../types';
import { createApiClient } from '../utils/apiClient';

const socialClient = createApiClient('social');

export default class SocialService {
  /**
   * Get social statistics for a user
   */
  static async getSocialStats(userId: string): Promise<SocialStats> {
    try {
      const { data, error } = await supabaseClient
        .from('social_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create default stats if none exist
        const defaultStats: SocialStats = {
          userId,
          totalFriends: 0,
          totalGroups: 0,
          totalChallenges: 0,
          sharedProgressCount: 0,
          totalLikes: 0,
          totalComments: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const { data: newStats, error: insertError } = await supabaseClient
          .from('social_stats')
          .insert(defaultStats)
          .select()
          .single();

        if (insertError) throw insertError;
        return newStats;
      }

      return data;
    } catch (error) {
      console.error('Error getting social stats:', error);
      throw error;
    }
  }

  /**
   * Get social feed for a user
   */
  static async getSocialFeed(userId: string, limit = 20, offset = 0): Promise<SocialFeedItem[]> {
    try {
      const { data, error } = await supabaseClient
        .from('social_feed')
        .select(`
          *,
          user:user_id (
            id,
            user_metadata
          )
        `)
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting social feed:', error);
      throw error;
    }
  }

  /**
   * Share reading progress
   */
  static async shareProgress(
    userId: string,
    progress: Omit<SharedProgress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<SharedProgress> {
    try {
      const sharedProgress: Omit<SharedProgress, 'id'> = {
        ...progress,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from('shared_progress')
        .insert(sharedProgress)
        .select()
        .single();

      if (error) throw error;

      // Add to social feed
      await this.addToFeed(userId, 'shared_progress', data);

      // Update social stats
      await this.incrementSocialStat(userId, 'sharedProgressCount');

      return data;
    } catch (error) {
      console.error('Error sharing progress:', error);
      throw error;
    }
  }

  /**
   * Like a shared progress
   */
  static async likeProgress(progressId: string, userId: string): Promise<Like> {
    try {
      const like: Omit<Like, 'id' | 'createdAt'> = {
        progressId,
        userId,
        createdAt: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from('likes')
        .insert(like)
        .select()
        .single();

      if (error) throw error;

      // Update social stats
      await this.incrementSocialStat(userId, 'totalLikes');

      return data;
    } catch (error) {
      console.error('Error liking progress:', error);
      throw error;
    }
  }

  /**
   * Unlike a shared progress
   */
  static async unlikeProgress(progressId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('likes')
        .delete()
        .eq('progress_id', progressId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update social stats
      await this.decrementSocialStat(userId, 'totalLikes');

      return true;
    } catch (error) {
      console.error('Error unliking progress:', error);
      throw error;
    }
  }

  /**
   * Comment on shared progress
   */
  static async commentOnProgress(
    progressId: string,
    userId: string,
    content: string
  ): Promise<Comment> {
    try {
      const comment: Omit<Comment, 'id' | 'createdAt'> = {
        progressId,
        userId,
        content,
        createdAt: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from('comments')
        .insert(comment)
        .select()
        .single();

      if (error) throw error;

      // Update social stats
      await this.incrementSocialStat(userId, 'totalComments');

      return data;
    } catch (error) {
      console.error('Error commenting on progress:', error);
      throw error;
    }
  }

  /**
   * Get comments for a progress
   */
  static async getProgressComments(progressId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabaseClient
        .from('comments')
        .select(`
          *,
          user:user_id (
            id,
            user_metadata
          )
        `)
        .eq('progress_id', progressId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting progress comments:', error);
      throw error;
    }
  }

  /**
   * Get likes for a progress
   */
  static async getProgressLikes(progressId: string): Promise<Like[]> {
    try {
      const { data, error } = await supabaseClient
        .from('likes')
        .select(`
          *,
          user:user_id (
            id,
            user_metadata
          )
        `)
        .eq('progress_id', progressId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting progress likes:', error);
      throw error;
    }
  }

  /**
   * Add item to social feed
   */
  private static async addToFeed(
    userId: string,
    type: SocialFeedItem['type'],
    data: any
  ): Promise<void> {
    try {
      const feedItem: Omit<SocialFeedItem, 'id'> = {
        userId,
        type,
        data,
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabaseClient
        .from('social_feed')
        .insert(feedItem);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding to feed:', error);
      throw error;
    }
  }

  /**
   * Increment social stat
   */
  private static async incrementSocialStat(
    userId: string,
    field: keyof Omit<SocialStats, 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from('social_stats')
        .update({
          [field]: supabaseClient.raw(`${field} + 1`),
          updatedAt: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing social stat:', error);
      throw error;
    }
  }

  /**
   * Decrement social stat
   */
  private static async decrementSocialStat(
    userId: string,
    field: keyof Omit<SocialStats, 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from('social_stats')
        .update({
          [field]: supabaseClient.raw(`${field} - 1`),
          updatedAt: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error decrementing social stat:', error);
      throw error;
    }
  }

  /**
   * Get user's shared progress
   */
  static async getUserSharedProgress(userId: string): Promise<SharedProgress[]> {
    try {
      const { data, error } = await supabaseClient
        .from('shared_progress')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting user shared progress:', error);
      throw error;
    }
  }

  /**
   * Delete shared progress
   */
  static async deleteSharedProgress(progressId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('shared_progress')
        .delete()
        .eq('id', progressId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update social stats
      await this.decrementSocialStat(userId, 'sharedProgressCount');

      return true;
    } catch (error) {
      console.error('Error deleting shared progress:', error);
      throw error;
    }
  }
}