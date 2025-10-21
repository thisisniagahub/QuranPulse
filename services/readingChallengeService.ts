/**
 * Reading Challenge Service
 * Handles reading challenges, participation, and progress tracking
 */

import { supabaseClient } from './supabaseClient';
import { ReadingChallenge, ChallengeParticipant, SocialFeedItem } from '../types';
import { createApiClient } from '../utils/apiClient';

const challengeClient = createApiClient('reading-challenges');

export default class ReadingChallengeService {
  /**
   * Create a new reading challenge
   */
  static async createChallenge(
    creatorId: string,
    challengeData: Omit<ReadingChallenge, 'id' | 'creatorId' | 'createdAt' | 'updatedAt' | 'participantCount'>
  ): Promise<ReadingChallenge> {
    try {
      const challenge: Omit<ReadingChallenge, 'id' | 'participantCount'> = {
        ...challengeData,
        creatorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from('reading_challenges')
        .insert(challenge)
        .select()
        .single();

      if (error) throw error;

      // Add creator as first participant
      await this.joinChallenge(data.id, creatorId, 'admin');

      return { ...data, participantCount: 1 };
    } catch (error) {
      console.error('Error creating reading challenge:', error);
      throw error;
    }
  }

  /**
   * Join a reading challenge
   */
  static async joinChallenge(
    challengeId: string,
    userId: string,
    userName: string,
    role: 'admin' | 'participant' = 'participant'
  ): Promise<boolean> {
    try {
      // Check if challenge exists and is open
      const challenge = await this.getChallenge(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      if (!challenge.isOpen) {
        throw new Error('Challenge is not accepting new participants');
      }

      // Check if user is already a participant
      const { data: existingParticipant } = await supabaseClient
        .from('challenge_participants')
        .select('id')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();

      if (existingParticipant) {
        throw new Error('User is already participating in this challenge');
      }

      // Add participant
      const participant: Omit<ChallengeParticipant, 'id'> = {
        challengeId,
        userId,
        userName,
        role,
        joinedAt: new Date().toISOString(),
        progress: 0,
        completedAt: null,
      };

      const { error } = await supabaseClient
        .from('challenge_participants')
        .insert(participant);

      if (error) throw error;

      // Update challenge participant count
      await this.updateParticipantCount(challengeId);

      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  /**
   * Leave a reading challenge
   */
  static async leaveChallenge(challengeId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update challenge participant count
      await this.updateParticipantCount(challengeId);

      return true;
    } catch (error) {
      console.error('Error leaving challenge:', error);
      throw error;
    }
  }

  /**
   * Get user's challenges
   */
  static async getUserChallenges(userId: string): Promise<ReadingChallenge[]> {
    try {
      const { data, error } = await supabaseClient
        .from('challenge_participants')
        .select(`
          challenge:reading_challenges (
            *,
            creator:creator_id (
              id,
              user_metadata
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data?.map(item => item.challenge).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting user challenges:', error);
      throw error;
    }
  }

  /**
   * Get challenge by ID
   */
  static async getChallenge(challengeId: string): Promise<ReadingChallenge | null> {
    try {
      const { data, error } = await supabaseClient
        .from('reading_challenges')
        .select(`
          *,
          creator:creator_id (
            id,
            user_metadata
          ),
          participants:challenge_participants (
            user_id,
            role,
            joined_at,
            progress,
            completed_at
          )
        `)
        .eq('id', challengeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return {
        ...data,
        participantCount: data.participants?.length || 0,
      };
    } catch (error) {
      console.error('Error getting challenge:', error);
      throw error;
    }
  }

  /**
   * Get challenge participants
   */
  static async getChallengeParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
    try {
      const { data, error } = await supabaseClient
        .from('challenge_participants')
        .select(`
          *,
          user:user_id (
            id,
            user_metadata
          )
        `)
        .eq('challenge_id', challengeId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting challenge participants:', error);
      throw error;
    }
  }

  /**
   * Update participant progress
   */
  static async updateParticipantProgress(
    challengeId: string,
    userId: string,
    progress: number
  ): Promise<ChallengeParticipant> {
    try {
      const { data, error } = await supabaseClient
        .from('challenge_participants')
        .update({
          progress,
          updatedAt: new Date().toISOString(),
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Check if challenge is completed
      const challenge = await this.getChallenge(challengeId);
      if (challenge && progress >= challenge.targetValue) {
        await this.completeChallenge(challengeId, userId);
      }

      return data;
    } catch (error) {
      console.error('Error updating participant progress:', error);
      throw error;
    }
  }

  /**
   * Complete challenge
   */
  static async completeChallenge(challengeId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('challenge_participants')
        .update({
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error completing challenge:', error);
      throw error;
    }
  }

  /**
   * Update participant count
   */
  private static async updateParticipantCount(challengeId: string): Promise<void> {
    try {
      const { count, error } = await supabaseClient
        .from('challenge_participants')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_id', challengeId);

      if (error) throw error;

      await supabaseClient
        .from('reading_challenges')
        .update({ 
          participantCount: count || 0,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', challengeId);
    } catch (error) {
      console.error('Error updating participant count:', error);
      throw error;
    }
  }

  /**
   * Search challenges
   */
  static async searchChallenges(query: string, limit = 20): Promise<ReadingChallenge[]> {
    try {
      const { data, error } = await supabaseClient
        .from('reading_challenges')
        .select(`
          *,
          creator:creator_id (
            id,
            user_metadata
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_open', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching challenges:', error);
      throw error;
    }
  }

  /**
   * Get popular challenges
   */
  static async getPopularChallenges(limit = 20): Promise<ReadingChallenge[]> {
    try {
      const { data, error } = await supabaseClient
        .from('reading_challenges')
        .select(`
          *,
          creator:creator_id (
            id,
            user_metadata
          )
        `)
        .eq('is_open', true)
        .order('participant_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting popular challenges:', error);
      throw error;
    }
  }

  /**
   * Get recent challenges
   */
  static async getRecentChallenges(limit = 20): Promise<ReadingChallenge[]> {
    try {
      const { data, error } = await supabaseClient
        .from('reading_challenges')
        .select(`
          *,
          creator:creator_id (
            id,
            user_metadata
          )
        `)
        .eq('is_open', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting recent challenges:', error);
      throw error;
    }
  }

  /**
   * Update challenge
   */
  static async updateChallenge(
    challengeId: string,
    updates: Partial<Omit<ReadingChallenge, 'id' | 'creatorId' | 'createdAt' | 'participantCount'>>
  ): Promise<ReadingChallenge> {
    try {
      const { data, error } = await supabaseClient
        .from('reading_challenges')
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', challengeId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  }

  /**
   * Delete challenge
   */
  static async deleteChallenge(challengeId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is the creator
      const { data: challenge } = await supabaseClient
        .from('reading_challenges')
        .select('creator_id')
        .eq('id', challengeId)
        .single();

      if (!challenge || challenge.creator_id !== userId) {
        throw new Error('Only challenge creator can delete the challenge');
      }

      const { error } = await supabaseClient
        .from('reading_challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  }

  /**
   * Get challenge leaderboard
   */
  static async getChallengeLeaderboard(challengeId: string): Promise<ChallengeParticipant[]> {
    try {
      const { data, error } = await supabaseClient
        .from('challenge_participants')
        .select(`
          *,
          user:user_id (
            id,
            user_metadata
          )
        `)
        .eq('challenge_id', challengeId)
        .order('progress', { ascending: false })
        .order('completed_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting challenge leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user's challenge progress
   */
  static async getUserChallengeProgress(
    challengeId: string,
    userId: string
  ): Promise<ChallengeParticipant | null> {
    try {
      const { data, error } = await supabaseClient
        .from('challenge_participants')
        .select(`
          *,
          user:user_id (
            id,
            user_metadata
          )
        `)
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user challenge progress:', error);
      throw error;
    }
  }

  /**
   * Get challenge statistics
   */
  static async getChallengeStats(challengeId: string): Promise<{
    totalParticipants: number;
    completedParticipants: number;
    averageProgress: number;
    topParticipants: ChallengeParticipant[];
  }> {
    try {
      const participants = await this.getChallengeParticipants(challengeId);
      
      const totalParticipants = participants.length;
      const completedParticipants = participants.filter(p => p.completedAt).length;
      const averageProgress = participants.reduce((sum, p) => sum + p.progress, 0) / totalParticipants;
      const topParticipants = participants
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 10);

      return {
        totalParticipants,
        completedParticipants,
        averageProgress: Math.round(averageProgress * 100) / 100,
        topParticipants,
      };
    } catch (error) {
      console.error('Error getting challenge stats:', error);
      throw error;
    }
  }

  /**
   * Get challenges by category
   */
  static async getChallengesByCategory(category: string, limit = 20): Promise<ReadingChallenge[]> {
    try {
      const { data, error } = await supabaseClient
        .from('reading_challenges')
        .select(`
          *,
          creator:creator_id (
            id,
            user_metadata
          )
        `)
        .eq('category', category)
        .eq('is_open', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting challenges by category:', error);
      throw error;
    }
  }

  /**
   * Get challenge categories
   */
  static async getChallengeCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabaseClient
        .from('reading_challenges')
        .select('category')
        .eq('is_open', true)
        .not('category', 'is', null);

      if (error) throw error;

      const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
      return categories;
    } catch (error) {
      console.error('Error getting challenge categories:', error);
      throw error;
    }
  }
}