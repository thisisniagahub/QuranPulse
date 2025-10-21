/**
 * Friendship Service
 * Handles friend requests, friendships, and social connections
 */

import { supabaseClient } from './supabaseClient';
import { Friendship, FriendRequest, UserProfile } from '../types';
import { createApiClient } from '../utils/apiClient';

const friendshipClient = createApiClient('friendships');

export default class FriendshipService {
  /**
   * Send friend request
   */
  static async sendFriendRequest(
    fromUserId: string,
    toUserId: string,
    message?: string
  ): Promise<FriendRequest> {
    try {
      // Check if users are already friends
      const { data: existingFriendship } = await supabaseClient
        .from('friendships')
        .select('id')
        .or(`user_id.eq.${fromUserId},friend_id.eq.${fromUserId}`)
        .or(`user_id.eq.${toUserId},friend_id.eq.${toUserId}`)
        .single();

      if (existingFriendship) {
        throw new Error('Users are already friends');
      }

      // Check if there's already a pending request
      const { data: existingRequest } = await supabaseClient
        .from('friend_requests')
        .select('id')
        .eq('from_user_id', fromUserId)
        .eq('to_user_id', toUserId)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        throw new Error('Friend request already sent');
      }

      const friendRequest: Omit<FriendRequest, 'id'> = {
        fromUserId,
        toUserId,
        message: message || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from('friend_requests')
        .insert(friendRequest)
        .select(`
          *,
          fromUser:from_user_id (
            id,
            user_metadata
          ),
          toUser:to_user_id (
            id,
            user_metadata
          )
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * Accept friend request
   */
  static async acceptFriendRequest(requestId: string): Promise<boolean> {
    try {
      // Get the request
      const { data: request, error: getError } = await supabaseClient
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .eq('status', 'pending')
        .single();

      if (getError) throw getError;
      if (!request) throw new Error('Friend request not found');

      // Create friendship
      const friendship: Omit<Friendship, 'id'> = {
        userId: request.fromUserId,
        friendId: request.toUserId,
        createdAt: new Date().toISOString(),
      };

      const { error: friendshipError } = await supabaseClient
        .from('friendships')
        .insert(friendship);

      if (friendshipError) throw friendshipError;

      // Update request status
      const { error: updateError } = await supabaseClient
        .from('friend_requests')
        .update({
          status: 'accepted',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  /**
   * Reject friend request
   */
  static async rejectFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('friend_requests')
        .update({
          status: 'rejected',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  /**
   * Cancel friend request
   */
  static async cancelFriendRequest(requestId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('friend_requests')
        .delete()
        .eq('id', requestId)
        .eq('from_user_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error canceling friend request:', error);
      throw error;
    }
  }

  /**
   * Get user's friends
   */
  static async getFriends(userId: string): Promise<Friendship[]> {
    try {
      const { data, error } = await supabaseClient
        .from('friendships')
        .select(`
          *,
          friendProfile:friend_id (
            id,
            user_metadata
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting friends:', error);
      throw error;
    }
  }

  /**
   * Get pending friend requests
   */
  static async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data, error } = await supabaseClient
        .from('friend_requests')
        .select(`
          *,
          fromUser:from_user_id (
            id,
            user_metadata
          ),
          toUser:to_user_id (
            id,
            user_metadata
          )
        `)
        .eq('to_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting pending requests:', error);
      throw error;
    }
  }

  /**
   * Get sent friend requests
   */
  static async getSentRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data, error } = await supabaseClient
        .from('friend_requests')
        .select(`
          *,
          fromUser:from_user_id (
            id,
            user_metadata
          ),
          toUser:to_user_id (
            id,
            user_metadata
          )
        `)
        .eq('from_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting sent requests:', error);
      throw error;
    }
  }

  /**
   * Remove friend
   */
  static async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('friendships')
        .delete()
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  /**
   * Check if users are friends
   */
  static async areFriends(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseClient
        .from('friendships')
        .select('id')
        .or(`user_id.eq.${userId1},friend_id.eq.${userId1}`)
        .or(`user_id.eq.${userId2},friend_id.eq.${userId2}`)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking friendship:', error);
      throw error;
    }
  }

  /**
   * Search users for friend requests
   */
  static async searchUsers(query: string, currentUserId: string, limit = 20): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .neq('user_id', currentUserId)
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .eq('is_public', true)
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Get friend suggestions
   */
  static async getFriendSuggestions(userId: string, limit = 10): Promise<UserProfile[]> {
    try {
      // Get users who are friends of friends
      const { data, error } = await supabaseClient
        .rpc('get_friend_suggestions', {
          user_id: userId,
          limit_count: limit,
        });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting friend suggestions:', error);
      // Fallback to random public users
      const { data, error: fallbackError } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .neq('user_id', userId)
        .eq('is_public', true)
        .limit(limit);

      if (fallbackError) throw fallbackError;

      return data || [];
    }
  }

  /**
   * Get friendship status between two users
   */
  static async getFriendshipStatus(userId1: string, userId2: string): Promise<{
    status: 'friends' | 'pending_sent' | 'pending_received' | 'none';
    requestId?: string;
  }> {
    try {
      // Check if they're friends
      const areFriends = await this.areFriends(userId1, userId2);
      if (areFriends) {
        return { status: 'friends' };
      }

      // Check for pending requests
      const { data: sentRequest } = await supabaseClient
        .from('friend_requests')
        .select('id')
        .eq('from_user_id', userId1)
        .eq('to_user_id', userId2)
        .eq('status', 'pending')
        .single();

      if (sentRequest) {
        return { status: 'pending_sent', requestId: sentRequest.id };
      }

      const { data: receivedRequest } = await supabaseClient
        .from('friend_requests')
        .select('id')
        .eq('from_user_id', userId2)
        .eq('to_user_id', userId1)
        .eq('status', 'pending')
        .single();

      if (receivedRequest) {
        return { status: 'pending_received', requestId: receivedRequest.id };
      }

      return { status: 'none' };
    } catch (error) {
      console.error('Error getting friendship status:', error);
      throw error;
    }
  }

  /**
   * Get mutual friends
   */
  static async getMutualFriends(userId1: string, userId2: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabaseClient
        .rpc('get_mutual_friends', {
          user1_id: userId1,
          user2_id: userId2,
        });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting mutual friends:', error);
      throw error;
    }
  }

  /**
   * Block user
   */
  static async blockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
      // Remove friendship if exists
      await this.removeFriend(userId, blockedUserId);

      // Add to blocked users
      const { error } = await supabaseClient
        .from('blocked_users')
        .insert({
          user_id: userId,
          blocked_user_id: blockedUserId,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  /**
   * Unblock user
   */
  static async unblockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('blocked_users')
        .delete()
        .eq('user_id', userId)
        .eq('blocked_user_id', blockedUserId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  /**
   * Get blocked users
   */
  static async getBlockedUsers(userId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabaseClient
        .from('blocked_users')
        .select(`
          blockedUser:blocked_user_id (
            id,
            user_metadata
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data?.map(item => item.blockedUser).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting blocked users:', error);
      throw error;
    }
  }
}