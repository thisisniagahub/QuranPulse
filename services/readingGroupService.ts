/**
 * Reading Group Service
 * Handles reading group creation, management, and interactions
 */

import { supabaseClient } from './supabaseClient';
import { ReadingGroup, GroupMember, GroupTarget, GroupProgress, GroupSchedule, GroupActivity } from '../types';
import { createApiClient } from '../utils/apiClient';

const groupClient = createApiClient('reading-groups');

export default class ReadingGroupService {
  /**
   * Create a new reading group
   */
  static async createGroup(
    creatorId: string,
    groupData: Omit<ReadingGroup, 'id' | 'creatorId' | 'createdAt' | 'updatedAt' | 'memberCount'>
  ): Promise<ReadingGroup> {
    try {
      const group: Omit<ReadingGroup, 'id' | 'memberCount'> = {
        ...groupData,
        creatorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from('reading_groups')
        .insert(group)
        .select()
        .single();

      if (error) throw error;

      // Add creator as first member
      await this.addMember(data.id, creatorId, 'admin');

      return { ...data, memberCount: 1 };
    } catch (error) {
      console.error('Error creating reading group:', error);
      throw error;
    }
  }

  /**
   * Get user's groups
   */
  static async getMyGroups(userId: string): Promise<ReadingGroup[]> {
    try {
      const { data, error } = await supabaseClient
        .from('group_members')
        .select(`
          group:reading_groups (
            *,
            creator:creator_id (
              id,
              user_metadata
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data?.map(item => item.group).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

  /**
   * Get group by ID
   */
  static async getGroup(groupId: string): Promise<ReadingGroup | null> {
    try {
      const { data, error } = await supabaseClient
        .from('reading_groups')
        .select(`
          *,
          creator:creator_id (
            id,
            user_metadata
          ),
          members:group_members (
            user_id,
            role,
            joined_at
          )
        `)
        .eq('id', groupId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return {
        ...data,
        memberCount: data.members?.length || 0,
      };
    } catch (error) {
      console.error('Error getting group:', error);
      throw error;
    }
  }

  /**
   * Join a reading group
   */
  static async joinGroup(groupId: string, userId: string, userName: string): Promise<boolean> {
    try {
      // Check if group exists and is open
      const group = await this.getGroup(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (!group.isOpen) {
        throw new Error('Group is not accepting new members');
      }

      // Check if user is already a member
      const { data: existingMember } = await supabaseClient
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        throw new Error('User is already a member of this group');
      }

      // Add member
      await this.addMember(groupId, userId, 'member');

      // Update group member count
      await this.updateMemberCount(groupId);

      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  /**
   * Leave a reading group
   */
  static async leaveGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update group member count
      await this.updateMemberCount(groupId);

      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  /**
   * Add member to group
   */
  private static async addMember(groupId: string, userId: string, role: 'admin' | 'member'): Promise<void> {
    try {
      const member: Omit<GroupMember, 'id'> = {
        groupId,
        userId,
        role,
        joinedAt: new Date().toISOString(),
      };

      const { error } = await supabaseClient
        .from('group_members')
        .insert(member);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  /**
   * Update group member count
   */
  private static async updateMemberCount(groupId: string): Promise<void> {
    try {
      const { count, error } = await supabaseClient
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      if (error) throw error;

      await supabaseClient
        .from('reading_groups')
        .update({ 
          memberCount: count || 0,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', groupId);
    } catch (error) {
      console.error('Error updating member count:', error);
      throw error;
    }
  }

  /**
   * Get group members
   */
  static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const { data, error } = await supabaseClient
        .from('group_members')
        .select(`
          *,
          user:user_id (
            id,
            user_metadata
          )
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting group members:', error);
      throw error;
    }
  }

  /**
   * Create group target
   */
  static async createGroupTarget(
    groupId: string,
    target: Omit<GroupTarget, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>
  ): Promise<GroupTarget> {
    try {
      const groupTarget: Omit<GroupTarget, 'id'> = {
        ...target,
        groupId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from('group_targets')
        .insert(groupTarget)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating group target:', error);
      throw error;
    }
  }

  /**
   * Get group targets
   */
  static async getGroupTargets(groupId: string): Promise<GroupTarget[]> {
    try {
      const { data, error } = await supabaseClient
        .from('group_targets')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting group targets:', error);
      throw error;
    }
  }

  /**
   * Update group progress
   */
  static async updateGroupProgress(
    groupId: string,
    userId: string,
    progress: Omit<GroupProgress, 'id' | 'groupId' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<GroupProgress> {
    try {
      const groupProgress: Omit<GroupProgress, 'id'> = {
        ...progress,
        groupId,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from('group_progress')
        .upsert(groupProgress, {
          onConflict: 'group_id,user_id',
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating group progress:', error);
      throw error;
    }
  }

  /**
   * Get group progress
   */
  static async getGroupProgress(groupId: string): Promise<GroupProgress[]> {
    try {
      const { data, error } = await supabaseClient
        .from('group_progress')
        .select(`
          *,
          user:user_id (
            id,
            user_metadata
          )
        `)
        .eq('group_id', groupId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting group progress:', error);
      throw error;
    }
  }

  /**
   * Create group schedule
   */
  static async createGroupSchedule(
    groupId: string,
    schedule: Omit<GroupSchedule, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>
  ): Promise<GroupSchedule> {
    try {
      const groupSchedule: Omit<GroupSchedule, 'id'> = {
        ...schedule,
        groupId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from('group_schedules')
        .insert(groupSchedule)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating group schedule:', error);
      throw error;
    }
  }

  /**
   * Get group schedules
   */
  static async getGroupSchedules(groupId: string): Promise<GroupSchedule[]> {
    try {
      const { data, error } = await supabaseClient
        .from('group_schedules')
        .select('*')
        .eq('group_id', groupId)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting group schedules:', error);
      throw error;
    }
  }

  /**
   * Add group activity
   */
  static async addGroupActivity(
    groupId: string,
    activity: Omit<GroupActivity, 'id' | 'groupId' | 'createdAt'>
  ): Promise<GroupActivity> {
    try {
      const groupActivity: Omit<GroupActivity, 'id'> = {
        ...activity,
        groupId,
        createdAt: new Date().toISOString(),
      };

      const { data, error } = await supabaseClient
        .from('group_activities')
        .insert(groupActivity)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error adding group activity:', error);
      throw error;
    }
  }

  /**
   * Get group activities
   */
  static async getGroupActivities(groupId: string, limit = 20): Promise<GroupActivity[]> {
    try {
      const { data, error } = await supabaseClient
        .from('group_activities')
        .select(`
          *,
          user:user_id (
            id,
            user_metadata
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting group activities:', error);
      throw error;
    }
  }

  /**
   * Search groups
   */
  static async searchGroups(query: string, limit = 20): Promise<ReadingGroup[]> {
    try {
      const { data, error } = await supabaseClient
        .from('reading_groups')
        .select(`
          *,
          creator:creator_id (
            id,
            user_metadata
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_open', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching groups:', error);
      throw error;
    }
  }

  /**
   * Update group settings
   */
  static async updateGroup(
    groupId: string,
    updates: Partial<Omit<ReadingGroup, 'id' | 'creatorId' | 'createdAt' | 'memberCount'>>
  ): Promise<ReadingGroup> {
    try {
      const { data, error } = await supabaseClient
        .from('reading_groups')
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  /**
   * Delete group
   */
  static async deleteGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is the creator
      const { data: group } = await supabaseClient
        .from('reading_groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();

      if (!group || group.creator_id !== userId) {
        throw new Error('Only group creator can delete the group');
      }

      const { error } = await supabaseClient
        .from('reading_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }
}