/**
 * useBookmarks Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useBookmarks } from '../../hooks/useBookmarks';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null, // Guest mode for these tests
  }),
}));

jest.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('useBookmarks Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('should initialize with empty bookmarks for guest user', async () => {
    const { result } = renderHook(() => useBookmarks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bookmarks).toEqual([]);
  });

  it('should add bookmark for guest user', async () => {
    const { result } = renderHook(() => useBookmarks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const testAyah = {
      id: 1,
      verseNumber: 1,
      verse_key: '1:1',
      arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      translationText: 'In the name of Allah...',
      surahNumber: 1,
    };

    await act(async () => {
      await result.current.addBookmark(testAyah);
    });

    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.isBookmarked('1:1')).toBe(true);
  });

  it('should remove bookmark', async () => {
    const { result } = renderHook(() => useBookmarks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const testAyah = {
      id: 1,
      verseNumber: 1,
      verse_key: '1:1',
      arabicText: 'Test Arabic',
      translationText: 'Test Translation',
      surahNumber: 1,
    };

    // Add bookmark
    await act(async () => {
      await result.current.addBookmark(testAyah);
    });

    expect(result.current.bookmarks).toHaveLength(1);

    // Remove bookmark
    await act(async () => {
      await result.current.removeBookmark('1:1');
    });

    expect(result.current.bookmarks).toHaveLength(0);
    expect(result.current.isBookmarked('1:1')).toBe(false);
  });

  it('should persist bookmarks in AsyncStorage', async () => {
    const { result } = renderHook(() => useBookmarks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const testAyah = {
      id: 1,
      verseNumber: 1,
      verse_key: '2:255',
      arabicText: 'Ayatul Kursi',
      translationText: 'The Throne Verse',
      surahNumber: 2,
    };

    await act(async () => {
      await result.current.addBookmark(testAyah);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'guest_bookmarks',
      expect.any(String)
    );
  });

  it('should handle bookmark errors gracefully', async () => {
    const { result } = renderHook(() => useBookmarks());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Try to add invalid bookmark
    await act(async () => {
      const response = await result.current.addBookmark({
        id: 1,
        verseNumber: 1,
        verse_key: '',  // Invalid: empty key
        arabicText: 'Test',
        translationText: 'Test',
        surahNumber: 1,
      });

      expect(response.success).toBe(false);
      expect(response.error).toBeTruthy();
    });
  });
});
