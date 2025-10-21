/**
 * Progress Sharing Service
 * Manage sharing of reading progress with friends and groups
 */

import { supabase } from './supabaseClient';
import { SharedProgress, Like, Comment, SocialFeedItem } from '../types';

const SHARED_PROGRESS_KEY = 'shared_progress';
const SOCIAL_FEED_KEY = 'social_feed';

export class ProgressSharingService {
    /**
     * Share reading progress
     */
    static async shareProgress(
        userId: string,
        surahId: number,
        verseNumber: number,
        progressType: 'verse_completed' | 'surah_completed' | 'milestone' | 'streak',
        message?: string,
        isPublic: boolean = true
    ): Promise<{ success: boolean; error?: string; data?: SharedProgress }> {
        try {
            const { data, error } = await supabase
                .from('shared_progress')
                .insert({
                    user_id: userId,
                    surah_id: surahId,
                    verse_number: verseNumber,
                    progress_type: progressType,
                    message,
                    is_public: isPublic,
                    likes: [],
                    comments: [],
                })
                .select(`
          *,
          user_profile:profiles(
            id,
            full_name,
            avatar_url
          )
        `)
                .single();

            if (error) throw error;

            const sharedProgress: SharedProgress = {
                ...data,
                userProfile: data.user_profile,
            };

            return { success: true, data: sharedProgress };
        } catch (error) {
            console.error('Error sharing progress:', error);
            return { success: false, error: 'Failed to share progress' };
        }
    }

    /**
     * Get shared progress from friends
     */
    static async getFriendsProgress(userId: string, limit: number = 20): Promise<SharedProgress[]> {
      try {
        // First get friends list
        const { data: friends } = await supabase
          .from('friendships')
          .select('friend_id')
          .eq('user_id', userId)
          .eq('status', 'accepted');
  
        const friendIds = friends?.map(f => f.friend_id) || [];
        friendIds.push(userId); // Include user's own progress
  
        // Then get progress from friends
        const { data, error } = await supabase
          .from('shared_progress')
          .select(`
            *,
            user_profile:profiles(
              id,
              full_name,
              avatar_url
            )
          `)
          .or(`is_public.eq.true,user_id.in.(${friendIds.join(',')})`)
          .order('created_at', { ascending: false })
          .limit(limit);
  
        if (error) throw error;
  
        return data?.map(item => ({
          ...item,
          userProfile: item.user_profile,
        })) || [];
      } catch (error) {
        console.error('Error getting friends progress:', error);
        return [];
      }
    }

    /**
     * Get user's shared progress
     */
    static async getUserSharedProgress(userId: string, limit: number = 20): Promise<SharedProgress[]> {
        try {
            const { data, error } = await supabase
                .from('shared_progress')
                .select(`
          *,
          user_profile:profiles(
            id,
            full_name,
            avatar_url
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data?.map(item => ({
                ...item,
                userProfile: item.user_profile,
            })) || [];
        } catch (error) {
            console.error('Error getting user shared progress:', error);
            return [];
        }
    }

    /**
     * Like a shared progress
     */
    static async likeProgress(
        progressId: string,
        userId: string,
        userName: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            // Get current progress
            const { data: progress, error: fetchError } = await supabase
                .from('shared_progress')
                .select('likes')
                .eq('id', progressId)
                .single();

            if (fetchError || !progress) {
                return { success: false, error: 'Progress not found' };
            }

            // Check if already liked
            const likes = progress.likes as Like[] || [];
            const alreadyLiked = likes.some(like => like.userId === userId);

            if (alreadyLiked) {
                // Unlike
                const updatedLikes = likes.filter(like => like.userId !== userId);
                const { error } = await supabase
                    .from('shared_progress')
                    .update({ likes: updatedLikes })
                    .eq('id', progressId);

                if (error) throw error;
            } else {
                // Like
                const newLike: Like = {
                    userId,
                    userName,
                    timestamp: new Date().toISOString(),
                };
                const updatedLikes = [...likes, newLike];
                const { error } = await supabase
                    .from('shared_progress')
                    .update({ likes: updatedLikes })
                    .eq('id', progressId);

                if (error) throw error;
            }

            return { success: true };
        } catch (error) {
            console.error('Error liking progress:', error);
            return { success: false, error: 'Failed to like progress' };
        }
    }

    /**
     * Comment on shared progress
     */
    static async commentOnProgress(
        progressId: string,
        userId: string,
        userName: string,
        message: string,
        parentCommentId?: string
    ): Promise<{ success: boolean; error?: string; data?: Comment }> {
        try {
            // Get current progress
            const { data: progress, error: fetchError } = await supabase
                .from('shared_progress')
                .select('comments')
                .eq('id', progressId)
                .single();

            if (fetchError || !progress) {
                return { success: false, error: 'Progress not found' };
            }

            // Create new comment
            const newComment: Comment = {
                id: `comment_${Date.now()}`,
                userId,
                userName,
                message,
                timestamp: new Date().toISOString(),
            };

            const comments = progress.comments as Comment[] || [];

            if (parentCommentId) {
                // Reply to existing comment
                const parentComment = comments.find(c => c.id === parentCommentId);
                if (parentComment) {
                    if (!parentComment.replies) {
                        parentComment.replies = [];
                    }
                    parentComment.replies.push(newComment);
                }
            } else {
                // Top-level comment
                comments.push(newComment);
            }

            // Update progress with new comment
            const { error } = await supabase
                .from('shared_progress')
                .update({ comments })
                .eq('id', progressId);

            if (error) throw error;

            return { success: true, data: newComment };
        } catch (error) {
            console.error('Error commenting on progress:', error);
            return { success: false, error: 'Failed to add comment' };
        }
    }

    /**
     * Delete shared progress
     */
    static async deleteSharedProgress(
        progressId: string,
        userId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('shared_progress')
                .delete()
                .eq('id', progressId)
                .eq('user_id', userId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Error deleting shared progress:', error);
            return { success: false, error: 'Failed to delete shared progress' };
        }
    }

    /**
     * Update privacy settings for shared progress
     */
    static async updateProgressPrivacy(
        progressId: string,
        userId: string,
        isPublic: boolean
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('shared_progress')
                .update({ is_public: isPublic })
                .eq('id', progressId)
                .eq('user_id', userId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Error updating progress privacy:', error);
            return { success: false, error: 'Failed to update privacy' };
        }
    }

    /**
     * Get social feed (combined from friends and groups)
     */
    static async getSocialFeed(userId: string, limit: number = 50): Promise<SocialFeedItem[]> {
        try {
            // Get friends' progress
            const friendsProgress = await this.getFriendsProgress(userId, limit);

            // Convert to feed items
            const feedItems: SocialFeedItem[] = friendsProgress.map(progress => ({
                id: `progress_${progress.id}`,
                type: 'shared_progress',
                data: progress,
                timestamp: progress.createdAt,
                user: progress.userProfile,
            }));

            // Sort by timestamp
            feedItems.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

            return feedItems.slice(0, limit);
        } catch (error) {
            console.error('Error getting social feed:', error);
            return [];
        }
    }

    /**
     * Get trending progress (most liked in the last 7 days)
     */
    static async getTrendingProgress(limit: number = 10): Promise<SharedProgress[]> {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data, error } = await supabase
                .from('shared_progress')
                .select(`
          *,
          user_profile:profiles(
            id,
            full_name,
            avatar_url
          )
        `)
                .eq('is_public', true)
                .gte('created_at', sevenDaysAgo.toISOString())
                .order('created_at', { ascending: false })
                .limit(limit * 2); // Get more to sort by likes

            if (error) throw error;

            // Sort by number of likes
            const sortedData = data?.map(item => ({
                ...item,
                userProfile: item.user_profile,
            })) || [];

            sortedData.sort((a, b) =>
                (b.likes?.length || 0) - (a.likes?.length || 0)
            );

            return sortedData.slice(0, limit);
        } catch (error) {
            console.error('Error getting trending progress:', error);
            return [];
        }
    }

    /**
     * Get progress statistics for a user
     */
    static async getUserProgressStats(userId: string): Promise<{
        totalShared: number;
        totalLikes: number;
        totalComments: number;
        mostLikedProgress?: SharedProgress;
    }> {
        try {
            const { data, error } = await supabase
                .from('shared_progress')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            const progress = data || [];
            const totalShared = progress.length;
            const totalLikes = progress.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
            const totalComments = progress.reduce((sum, p) => sum + (p.comments?.length || 0), 0);

            const mostLikedProgress = progress.reduce((most, current) => {
                if (!most || (current.likes?.length || 0) > (most.likes?.length || 0)) {
                    return current;
                }
                return most;
            }, null as any);

            return {
                totalShared,
                totalLikes,
                totalComments,
                mostLikedProgress,
            };
        } catch (error) {
            console.error('Error getting user progress stats:', error);
            return {
                totalShared: 0,
                totalLikes: 0,
                totalComments: 0,
            };
        }
    }
}

export default ProgressSharingService;