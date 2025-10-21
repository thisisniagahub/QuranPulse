/**
 * Social Service Tests
 * Comprehensive testing for social features
 */

import SocialService from '../../services/socialService';
import { supabaseClient } from '../../services/supabaseClient';
import { SocialStats, SocialFeedItem, SharedProgress } from '../../types';

// Mock Supabase client
jest.mock('../../services/supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            range: jest.fn(),
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

describe('SocialService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSocialStats', () => {
    it('should return existing social stats', async () => {
      const mockStats: SocialStats = {
        userId: 'user-1',
        totalFriends: 5,
        totalGroups: 2,
        totalChallenges: 3,
        sharedProgressCount: 10,
        totalLikes: 25,
        totalComments: 8,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockStats, error: null }),
          }),
        }),
      } as any);

      const result = await SocialService.getSocialStats('user-1');

      expect(result).toEqual(mockStats);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('social_stats');
    });

    it('should create default stats if none exist', async () => {
      const mockDefaultStats: SocialStats = {
        userId: 'user-1',
        totalFriends: 0,
        totalGroups: 0,
        totalChallenges: 0,
        sharedProgressCount: 0,
        totalLikes: 0,
        totalComments: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      // First call returns no data (PGRST116 error)
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            }),
          }),
        }),
      } as any);

      // Second call for insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: mockDefaultStats, 
              error: null 
            }),
          }),
        }),
      } as any);

      const result = await SocialService.getSocialStats('user-1');

      expect(result).toEqual(mockDefaultStats);
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(2);
    });

    it('should throw error on database error', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Database error' } 
            }),
          }),
        }),
      } as any);

      await expect(SocialService.getSocialStats('user-1')).rejects.toThrow('Database error');
    });
  });

  describe('getSocialFeed', () => {
    it('should return social feed items', async () => {
      const mockFeed: SocialFeedItem[] = [
        {
          id: 'feed-1',
          userId: 'user-1',
          type: 'shared_progress',
          data: { title: 'Completed Surah Al-Fatiha' },
          timestamp: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({ data: mockFeed, error: null }),
            }),
          }),
        }),
      } as any);

      const result = await SocialService.getSocialFeed('user-1');

      expect(result).toEqual(mockFeed);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('social_feed');
    });

    it('should return empty array on error', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({ 
                data: null, 
                error: { message: 'Error' } 
              }),
            }),
          }),
        }),
      } as any);

      const result = await SocialService.getSocialFeed('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('shareProgress', () => {
    it('should share progress successfully', async () => {
      const mockProgress: Omit<SharedProgress, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        type: 'surah_completed',
        title: 'Completed Surah Al-Fatiha',
        description: 'Great progress!',
        value: 1,
        imageUrl: 'https://example.com/image.jpg',
      };

      const mockSharedProgress: SharedProgress = {
        id: 'progress-1',
        userId: 'user-1',
        ...mockProgress,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      // Mock shared_progress insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: mockSharedProgress, 
              error: null 
            }),
          }),
        }),
      } as any);

      // Mock social_feed insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ error: null }),
      } as any);

      // Mock social_stats update
      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await SocialService.shareProgress('user-1', mockProgress);

      expect(result).toEqual(mockSharedProgress);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shared_progress');
    });

    it('should throw error on database error', async () => {
      const mockProgress: Omit<SharedProgress, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        type: 'surah_completed',
        title: 'Completed Surah Al-Fatiha',
        description: 'Great progress!',
        value: 1,
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

      await expect(SocialService.shareProgress('user-1', mockProgress)).rejects.toThrow('Database error');
    });
  });

  describe('likeProgress', () => {
    it('should like progress successfully', async () => {
      const mockLike = {
        id: 'like-1',
        progressId: 'progress-1',
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
      };

      // Mock likes insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: mockLike, 
              error: null 
            }),
          }),
        }),
      } as any);

      // Mock social_stats update
      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await SocialService.likeProgress('progress-1', 'user-1');

      expect(result).toEqual(mockLike);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('likes');
    });
  });

  describe('unlikeProgress', () => {
    it('should unlike progress successfully', async () => {
      // Mock likes delete
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      } as any);

      // Mock social_stats update
      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await SocialService.unlikeProgress('progress-1', 'user-1');

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('likes');
    });
  });

  describe('commentOnProgress', () => {
    it('should comment on progress successfully', async () => {
      const mockComment = {
        id: 'comment-1',
        progressId: 'progress-1',
        userId: 'user-1',
        content: 'Great job!',
        createdAt: '2024-01-01T00:00:00Z',
      };

      // Mock comments insert
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: mockComment, 
              error: null 
            }),
          }),
        }),
      } as any);

      // Mock social_stats update
      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await SocialService.commentOnProgress('progress-1', 'user-1', 'Great job!');

      expect(result).toEqual(mockComment);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('comments');
    });
  });

  describe('getProgressComments', () => {
    it('should return progress comments', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          progressId: 'progress-1',
          userId: 'user-1',
          content: 'Great job!',
          createdAt: '2024-01-01T00:00:00Z',
          user: {
            id: 'user-1',
            user_metadata: { full_name: 'John Doe' },
          },
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockComments, error: null }),
          }),
        }),
      } as any);

      const result = await SocialService.getProgressComments('progress-1');

      expect(result).toEqual(mockComments);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('comments');
    });
  });

  describe('getProgressLikes', () => {
    it('should return progress likes', async () => {
      const mockLikes = [
        {
          id: 'like-1',
          progressId: 'progress-1',
          userId: 'user-1',
          createdAt: '2024-01-01T00:00:00Z',
          user: {
            id: 'user-1',
            user_metadata: { full_name: 'John Doe' },
          },
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockLikes, error: null }),
        }),
      } as any);

      const result = await SocialService.getProgressLikes('progress-1');

      expect(result).toEqual(mockLikes);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('likes');
    });
  });

  describe('getUserSharedProgress', () => {
    it('should return user shared progress', async () => {
      const mockProgress: SharedProgress[] = [
        {
          id: 'progress-1',
          userId: 'user-1',
          type: 'surah_completed',
          title: 'Completed Surah Al-Fatiha',
          description: 'Great progress!',
          value: 1,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockProgress, error: null }),
          }),
        }),
      } as any);

      const result = await SocialService.getUserSharedProgress('user-1');

      expect(result).toEqual(mockProgress);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shared_progress');
    });
  });

  describe('deleteSharedProgress', () => {
    it('should delete shared progress successfully', async () => {
      // Mock shared_progress delete
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      } as any);

      // Mock social_stats update
      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await SocialService.deleteSharedProgress('progress-1', 'user-1');

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('shared_progress');
    });
  });
});