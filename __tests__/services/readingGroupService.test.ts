/**
 * Reading Group Service Tests
 * Comprehensive testing for reading group features
 */

import ReadingGroupService from '../../services/readingGroupService';
import { supabaseClient } from '../../services/supabaseClient';
import { ReadingGroup, GroupMember, GroupTarget, GroupProgress } from '../../types';

// Mock Supabase client
jest.mock('../../services/supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            range: jest.fn(),
            limit: jest.fn(),
          })),
        })),
        neq: jest.fn(() => ({
          or: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
      upsert: jest.fn(() => ({
        onConflict: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    })),
    raw: jest.fn((query) => query),
  },
}));

const mockSupabaseClient = supabaseClient as jest.Mocked<typeof supabaseClient>;

describe('ReadingGroupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create a new reading group successfully', async () => {
      const groupData = {
        name: 'Quran Study Group',
        description: 'Weekly Quran study sessions',
        category: 'quran',
        isOpen: true,
        maxMembers: 20,
        tags: ['quran', 'study'],
      };

      const mockGroup: ReadingGroup = {
        id: 'group-1',
        ...groupData,
        creatorId: 'user-1',
        memberCount: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      // Mock reading_groups insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: mockGroup, 
              error: null 
            }),
          }),
        }),
      } as any);

      // Mock group_members insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ error: null }),
      } as any);

      const result = await ReadingGroupService.createGroup('user-1', groupData);

      expect(result).toEqual({ ...mockGroup, memberCount: 1 });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('reading_groups');
    });

    it('should throw error on database error', async () => {
      const groupData = {
        name: 'Quran Study Group',
        description: 'Weekly Quran study sessions',
        category: 'quran',
        isOpen: true,
        maxMembers: 20,
        tags: ['quran', 'study'],
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Database error' } 
            }),
          }),
        }),
      } as any);

      await expect(ReadingGroupService.createGroup('user-1', groupData)).rejects.toThrow('Database error');
    });
  });

  describe('getMyGroups', () => {
    it('should return user groups', async () => {
      const mockGroups = [
        {
          group: {
            id: 'group-1',
            name: 'Quran Study Group',
            description: 'Weekly Quran study sessions',
            category: 'quran',
            creatorId: 'user-1',
            isOpen: true,
            maxMembers: 20,
            memberCount: 5,
            tags: ['quran', 'study'],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            creator: {
              id: 'user-1',
              user_metadata: { full_name: 'John Doe' },
            },
          },
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockGroups, error: null }),
        }),
      } as any);

      const result = await ReadingGroupService.getMyGroups('user-1');

      expect(result).toEqual(mockGroups.map(item => item.group));
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('group_members');
    });
  });

  describe('getGroup', () => {
    it('should return group by ID', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Quran Study Group',
        description: 'Weekly Quran study sessions',
        category: 'quran',
        creatorId: 'user-1',
        isOpen: true,
        maxMembers: 20,
        memberCount: 5,
        tags: ['quran', 'study'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        creator: {
          id: 'user-1',
          user_metadata: { full_name: 'John Doe' },
        },
        members: [
          {
            user_id: 'user-1',
            role: 'admin',
            joined_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockGroup, error: null }),
          }),
        }),
      } as any);

      const result = await ReadingGroupService.getGroup('group-1');

      expect(result).toEqual({ ...mockGroup, memberCount: 1 });
    });

    it('should return null if group not found', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            }),
          }),
        }),
      } as any);

      const result = await ReadingGroupService.getGroup('group-1');

      expect(result).toBeNull();
    });
  });

  describe('joinGroup', () => {
    it('should join group successfully', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Quran Study Group',
        isOpen: true,
        memberCount: 5,
      };

      // Mock getGroup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockGroup, error: null }),
          }),
        }),
      } as any);

      // Mock check existing member
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            }),
          }),
        }),
      } as any);

      // Mock add member
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ error: null }),
      } as any);

      // Mock update member count
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            head: true,
          }),
        }),
      } as any);

      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await ReadingGroupService.joinGroup('group-1', 'user-2', 'Jane Doe');

      expect(result).toBe(true);
    });

    it('should throw error if group not found', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            }),
          }),
        }),
      } as any);

      await expect(ReadingGroupService.joinGroup('group-1', 'user-2', 'Jane Doe')).rejects.toThrow('Group not found');
    });

    it('should throw error if group is not open', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Quran Study Group',
        isOpen: false,
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockGroup, error: null }),
          }),
        }),
      } as any);

      await expect(ReadingGroupService.joinGroup('group-1', 'user-2', 'Jane Doe')).rejects.toThrow('Group is not accepting new members');
    });

    it('should throw error if user is already a member', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Quran Study Group',
        isOpen: true,
      };

      const mockMember = {
        id: 'member-1',
      };

      // Mock getGroup
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockGroup, error: null }),
          }),
        }),
      } as any);

      // Mock check existing member
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockMember, error: null }),
            }),
          }),
        }),
      } as any);

      await expect(ReadingGroupService.joinGroup('group-1', 'user-2', 'Jane Doe')).rejects.toThrow('User is already a member of this group');
    });
  });

  describe('leaveGroup', () => {
    it('should leave group successfully', async () => {
      // Mock group_members delete
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      } as any);

      // Mock update member count
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            head: true,
          }),
        }),
      } as any);

      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await ReadingGroupService.leaveGroup('group-1', 'user-1');

      expect(result).toBe(true);
    });
  });

  describe('getGroupMembers', () => {
    it('should return group members', async () => {
      const mockMembers: GroupMember[] = [
        {
          id: 'member-1',
          groupId: 'group-1',
          userId: 'user-1',
          role: 'admin',
          joinedAt: '2024-01-01T00:00:00Z',
          user: {
            id: 'user-1',
            user_metadata: { full_name: 'John Doe' },
          },
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockMembers, error: null }),
          }),
        }),
      } as any);

      const result = await ReadingGroupService.getGroupMembers('group-1');

      expect(result).toEqual(mockMembers);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('group_members');
    });
  });

  describe('createGroupTarget', () => {
    it('should create group target successfully', async () => {
      const targetData = {
        targetType: 'surahs',
        targetValue: 10,
        description: 'Read 10 surahs this month',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      const mockTarget: GroupTarget = {
        id: 'target-1',
        groupId: 'group-1',
        ...targetData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: mockTarget, 
              error: null 
            }),
          }),
        }),
      } as any);

      const result = await ReadingGroupService.createGroupTarget('group-1', targetData);

      expect(result).toEqual(mockTarget);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('group_targets');
    });
  });

  describe('getGroupTargets', () => {
    it('should return group targets', async () => {
      const mockTargets: GroupTarget[] = [
        {
          id: 'target-1',
          groupId: 'group-1',
          targetType: 'surahs',
          targetValue: 10,
          description: 'Read 10 surahs this month',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockTargets, error: null }),
          }),
        }),
      } as any);

      const result = await ReadingGroupService.getGroupTargets('group-1');

      expect(result).toEqual(mockTargets);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('group_targets');
    });
  });

  describe('updateGroupProgress', () => {
    it('should update group progress successfully', async () => {
      const progressData = {
        targetId: 'target-1',
        progressValue: 5,
        isCompleted: false,
        completedAt: null,
      };

      const mockProgress: GroupProgress = {
        id: 'progress-1',
        groupId: 'group-1',
        userId: 'user-1',
        ...progressData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSupabaseClient.from.mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          onConflict: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: mockProgress, 
                error: null 
              }),
            }),
          }),
        }),
      } as any);

      const result = await ReadingGroupService.updateGroupProgress('group-1', 'user-1', progressData);

      expect(result).toEqual(mockProgress);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('group_progress');
    });
  });

  describe('getGroupProgress', () => {
    it('should return group progress', async () => {
      const mockProgress: GroupProgress[] = [
        {
          id: 'progress-1',
          groupId: 'group-1',
          userId: 'user-1',
          targetId: 'target-1',
          progressValue: 5,
          isCompleted: false,
          completedAt: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          user: {
            id: 'user-1',
            user_metadata: { full_name: 'John Doe' },
          },
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockProgress, error: null }),
          }),
        }),
      } as any);

      const result = await ReadingGroupService.getGroupProgress('group-1');

      expect(result).toEqual(mockProgress);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('group_progress');
    });
  });

  describe('searchGroups', () => {
    it('should search groups successfully', async () => {
      const mockGroups: ReadingGroup[] = [
        {
          id: 'group-1',
          name: 'Quran Study Group',
          description: 'Weekly Quran study sessions',
          category: 'quran',
          creatorId: 'user-1',
          isOpen: true,
          maxMembers: 20,
          memberCount: 5,
          tags: ['quran', 'study'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          creator: {
            id: 'user-1',
            user_metadata: { full_name: 'John Doe' },
          },
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({ data: mockGroups, error: null }),
              }),
            }),
          }),
        }),
      } as any);

      const result = await ReadingGroupService.searchGroups('quran', 20);

      expect(result).toEqual(mockGroups);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('reading_groups');
    });
  });

  describe('updateGroup', () => {
    it('should update group successfully', async () => {
      const updates = {
        name: 'Updated Group Name',
        description: 'Updated description',
      };

      const mockUpdatedGroup: ReadingGroup = {
        id: 'group-1',
        name: 'Updated Group Name',
        description: 'Updated description',
        category: 'quran',
        creatorId: 'user-1',
        isOpen: true,
        maxMembers: 20,
        memberCount: 5,
        tags: ['quran', 'study'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: mockUpdatedGroup, 
                error: null 
              }),
            }),
          }),
        }),
      } as any);

      const result = await ReadingGroupService.updateGroup('group-1', updates);

      expect(result).toEqual(mockUpdatedGroup);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('reading_groups');
    });
  });

  describe('deleteGroup', () => {
    it('should delete group successfully', async () => {
      // Mock check creator
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: { creator_id: 'user-1' }, 
              error: null 
            }),
          }),
        }),
      } as any);

      // Mock delete group
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await ReadingGroupService.deleteGroup('group-1', 'user-1');

      expect(result).toBe(true);
    });

    it('should throw error if user is not creator', async () => {
      // Mock check creator
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: { creator_id: 'user-2' }, 
              error: null 
            }),
          }),
        }),
      } as any);

      await expect(ReadingGroupService.deleteGroup('group-1', 'user-1')).rejects.toThrow('Only group creator can delete the group');
    });
  });
});