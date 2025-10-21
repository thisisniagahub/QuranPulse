import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import type { Bookmark, Ayah } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_BOOKMARKS_KEY = 'guest_bookmarks';

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookmarks on mount and when user changes
  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        // Fetch from Supabase for authenticated users
        const { data, error: fetchError } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setBookmarks(data || []);
      } else {
        // Fetch from AsyncStorage for guest users
        const guestBookmarks = await AsyncStorage.getItem(GUEST_BOOKMARKS_KEY);
        if (guestBookmarks) {
          setBookmarks(JSON.parse(guestBookmarks));
        } else {
          setBookmarks([]);
        }
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookmarks');
      setBookmarks([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addBookmark = useCallback(async (ayah: Ayah, notes?: string) => {
    if (!ayah.verse_key) {
      setError('Invalid verse key');
      return { success: false, error: 'Invalid verse key' };
    }

    try {
      const newBookmark: Bookmark = {
        id: `${Date.now()}-${Math.random()}`,
        user_id: user?.id || 'guest',
        surah_number: ayah.surahNumber || parseInt(ayah.verse_key.split(':')[0]),
        surah_name: '', // Will be set by caller
        ayah_number: ayah.verseNumber,
        verse_key: ayah.verse_key,
        arabic_text: ayah.arabicText,
        translation_text: ayah.translationText,
        notes: notes || undefined,
        created_at: new Date().toISOString(),
      };

      // Optimistic update
      setBookmarks(prev => [newBookmark, ...prev]);

      if (user) {
        // Save to Supabase
        const { error: insertError } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            surah_number: newBookmark.surah_number,
            surah_name: newBookmark.surah_name,
            ayah_number: newBookmark.ayah_number,
            verse_key: newBookmark.verse_key,
            arabic_text: newBookmark.arabic_text,
            translation_text: newBookmark.translation_text,
            notes: newBookmark.notes,
          });

        if (insertError) {
          // Revert optimistic update
          setBookmarks(prev => prev.filter(b => b.id !== newBookmark.id));
          throw insertError;
        }

        // Fetch to get the actual ID from database
        await fetchBookmarks();
      } else {
        // Save to AsyncStorage for guest
        const updatedBookmarks = [newBookmark, ...bookmarks];
        await AsyncStorage.setItem(GUEST_BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Error adding bookmark:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to add bookmark';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [user, bookmarks, fetchBookmarks]);

  const removeBookmark = useCallback(async (verseKey: string) => {
    try {
      // Optimistic update
      const oldBookmarks = [...bookmarks];
      setBookmarks(prev => prev.filter(b => b.verse_key !== verseKey));

      if (user) {
        // Delete from Supabase
        const { error: deleteError } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('verse_key', verseKey);

        if (deleteError) {
          // Revert on error
          setBookmarks(oldBookmarks);
          throw deleteError;
        }
      } else {
        // Delete from AsyncStorage for guest
        const updatedBookmarks = bookmarks.filter(b => b.verse_key !== verseKey);
        await AsyncStorage.setItem(GUEST_BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Error removing bookmark:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove bookmark';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [user, bookmarks]);

  const updateBookmarkNotes = useCallback(async (verseKey: string, notes: string) => {
    try {
      if (user) {
        const { error: updateError } = await supabase
          .from('bookmarks')
          .update({ notes })
          .eq('user_id', user.id)
          .eq('verse_key', verseKey);

        if (updateError) throw updateError;

        // Update local state
        setBookmarks(prev => prev.map(b => 
          b.verse_key === verseKey ? { ...b, notes } : b
        ));
      } else {
        // Update AsyncStorage for guest
        const updatedBookmarks = bookmarks.map(b =>
          b.verse_key === verseKey ? { ...b, notes } : b
        );
        await AsyncStorage.setItem(GUEST_BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
        setBookmarks(updatedBookmarks);
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Error updating bookmark notes:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to update notes';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [user, bookmarks]);

  const isBookmarked = useCallback((verseKey: string): boolean => {
    return bookmarks.some(b => b.verse_key === verseKey);
  }, [bookmarks]);

  const getBookmark = useCallback((verseKey: string): Bookmark | undefined => {
    return bookmarks.find(b => b.verse_key === verseKey);
  }, [bookmarks]);

  const clearAllBookmarks = useCallback(async () => {
    try {
      if (user) {
        const { error: deleteError } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;
      } else {
        await AsyncStorage.removeItem(GUEST_BOOKMARKS_KEY);
      }

      setBookmarks([]);
      return { success: true, error: null };
    } catch (err) {
      console.error('Error clearing bookmarks:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to clear bookmarks';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [user]);

  return {
    bookmarks,
    isLoading,
    error,
    addBookmark,
    removeBookmark,
    updateBookmarkNotes,
    isBookmarked,
    getBookmark,
    clearAllBookmarks,
    refreshBookmarks: fetchBookmarks,
  };
}
