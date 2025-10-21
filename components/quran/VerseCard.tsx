import React, { useState, memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Ayah } from '../../types';
import { useAudio } from '../../contexts/AudioContext';
import { useBookmarks } from '../../hooks/useBookmarks';
import { getTafsir, getVerseAudio } from '../../services/quranApi';

interface VerseCardProps {
  ayah: Ayah;
  surahName: string;
  reciterId: number;
  onShowTafsir?: (tafsir: string) => void;
}

function VerseCardComponent({ ayah, surahName, reciterId, onShowTafsir }: VerseCardProps) {
  const { playTrack, currentTrack, isPlaying, pause } = useAudio();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCurrentlyPlaying = currentTrack?.key === ayah.verse_key && isPlaying;

  const handlePlayAudio = useCallback(async () => {
    if (isCurrentlyPlaying) {
      await pause();
      return;
    }

    setIsLoadingAudio(true);
    setError(null);

    try {
      // Fetch REAL audio URL from API
      const audioUrl = await getVerseAudio(ayah.verse_key, reciterId);
      
      await playTrack({
        type: 'ayah',
        key: ayah.verse_key,
        src: audioUrl,
        reciterId,
      });
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to load audio');
    } finally {
      setIsLoadingAudio(false);
    }
  }, [isCurrentlyPlaying, ayah.verse_key, reciterId, pause, playTrack]);

  const handleBookmark = useCallback(async () => {
    if (isBookmarked(ayah.verse_key)) {
      await removeBookmark(ayah.verse_key);
    } else {
      await addBookmark({
        ...ayah,
        surahNumber: parseInt(ayah.verse_key.split(':')[0]),
      });
    }
  }, [isBookmarked, removeBookmark, addBookmark, ayah]);

  const handleShowTafsir = useCallback(async () => {
    if (!onShowTafsir) return;

    setIsLoadingTafsir(true);
    setError(null);

    try {
      // Fetch REAL Tafsir from API
      const tafsir = await getTafsir(ayah.verse_key);
      onShowTafsir(tafsir);
    } catch (err) {
      console.error('Error fetching tafsir:', err);
      setError('Failed to load tafsir');
    } finally {
      setIsLoadingTafsir(false);
    }
  }, [onShowTafsir, ayah.verse_key]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `"${ayah.arabicText}"\n\n"${ayah.translationText}"\n\n- Quran ${ayah.verse_key} (${surahName})`,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  }, [ayah, surahName]);

  const handleCopy = useCallback(async () => {
    // TODO: Implement copy to clipboard
    // Would need expo-clipboard for this
  }, []);

  return (
    <View style={[
      styles.container,
      isCurrentlyPlaying && styles.containerPlaying,
      isBookmarked(ayah.verse_key) && styles.containerBookmarked,
    ]}>
      {/* Verse Number */}
      <View style={styles.verseHeader}>
        <View style={styles.verseNumber}>
          <Text style={styles.verseNumberText}>{ayah.verse_key}</Text>
        </View>
      </View>

      {/* Arabic Text */}
      <Text style={styles.arabicText}>
        {ayah.arabicText}
      </Text>

      {/* Translation */}
      <Text style={styles.translationText}>{ayah.translationText}</Text>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {/* Play/Pause Button */}
        <TouchableOpacity
          style={[styles.actionButton, isCurrentlyPlaying && styles.actionButtonActive]}
          onPress={handlePlayAudio}
          disabled={isLoadingAudio}
        >
          {isLoadingAudio ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <Ionicons
              name={isCurrentlyPlaying ? 'pause' : 'play'}
              size={20}
              color={isCurrentlyPlaying ? '#FFFFFF' : '#9CA3AF'}
            />
          )}
        </TouchableOpacity>

        {/* Bookmark Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isBookmarked(ayah.verse_key) && styles.actionButtonBookmarked,
          ]}
          onPress={handleBookmark}
        >
          <Ionicons
            name={isBookmarked(ayah.verse_key) ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isBookmarked(ayah.verse_key) ? '#F59E0B' : '#9CA3AF'}
          />
        </TouchableOpacity>

        {/* Tafsir Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShowTafsir}
          disabled={isLoadingTafsir}
        >
          {isLoadingTafsir ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <Ionicons name="book-outline" size={20} color="#9CA3AF" />
          )}
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Copy Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
          <Ionicons name="copy-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#374151',
  },
  containerPlaying: {
    borderLeftColor: '#10B981',
    backgroundColor: '#064E3B',
  },
  containerBookmarked: {
    borderLeftColor: '#F59E0B',
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseNumber: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verseNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 40,
    color: '#FFFFFF',
    textAlign: 'right',
    marginBottom: 12,
    fontFamily: 'Amiri', // Will fallback to system if not loaded
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#D1D5DB',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#7F1D1D',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#FCA5A5',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#10B981',
  },
  actionButtonBookmarked: {
    backgroundColor: '#78350F',
  },
});

// Memoize component with custom comparison
export const VerseCard = memo(VerseCardComponent, (prev, next) => {
  // Only re-render if these specific props change
  return (
    prev.ayah.verse_key === next.ayah.verse_key &&
    prev.reciterId === next.reciterId &&
    prev.surahName === next.surahName
  );
});
