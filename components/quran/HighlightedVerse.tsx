import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Ayah } from '../../types';
import { useAudio } from '../../contexts/AudioContext';
import { useBookmarks } from '../../hooks/useBookmarks';
import { getVerseAudio } from '../../services/quranApi';

interface HighlightedVerseProps {
  ayah: Ayah;
  surahName: string;
  reciterId: number;
  showTransliteration?: boolean;
}

// Arabic words split by space (simple approach)
// For production, you'd need proper Arabic word segmentation
const splitArabicText = (text: string): string[] => {
  return text.split(' ').filter(word => word.trim() !== '');
};

export function HighlightedVerse({ 
  ayah, 
  surahName, 
  reciterId,
  showTransliteration = false 
}: HighlightedVerseProps) {
  const { playTrack, currentTrack, isPlaying, pause, currentPosition, duration } = useAudio();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
  const [arabicWords, setArabicWords] = useState<string[]>([]);

  const isCurrentlyPlaying = currentTrack?.key === ayah.verse_key && isPlaying;

  useEffect(() => {
    // Split Arabic text into words
    const words = splitArabicText(ayah.arabicText);
    setArabicWords(words);
  }, [ayah.arabicText]);

  useEffect(() => {
    // Highlight words based on audio progress
    if (isCurrentlyPlaying && duration > 0) {
      const progress = currentPosition / duration;
      const totalWords = arabicWords.length;
      const currentWordIndex = Math.floor(progress * totalWords);
      setHighlightedWordIndex(currentWordIndex);
    } else {
      setHighlightedWordIndex(-1);
    }
  }, [isCurrentlyPlaying, currentPosition, duration, arabicWords.length]);

  const handlePlayAudio = async () => {
    if (isCurrentlyPlaying) {
      await pause();
      return;
    }

    setIsLoadingAudio(true);
    setError(null);

    try {
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
  };

  const handleBookmark = async () => {
    if (isBookmarked(ayah.verse_key)) {
      await removeBookmark(ayah.verse_key);
    } else {
      await addBookmark({
        ...ayah,
        surahNumber: parseInt(ayah.verse_key.split(':')[0]),
      });
    }
  };

  // Simple transliteration mapping (Jawi style)
  // For production, use AlQuran Cloud API transliteration endpoint
  const getTransliteration = (verseKey: string): string => {
    // This is a placeholder - you would fetch from API
    // Example for Al-Fatiha
    const transliterations: { [key: string]: string } = {
      '1:1': 'Bismillāhir-rahmānir-rahīm',
      '1:2': 'Al-hamdulillāhi rabbil-'ālamīn',
      '1:3': 'Ar-rahmānir-rahīm',
      '1:4': 'Māliki yawmid-dīn',
      '1:5': 'Iyyāka na'budu wa iyyāka nasta'īn',
      '1:6': 'Ihdinash-shirātal-mustaqīm',
      '1:7': 'Shirāthal-lażīna an'amta 'alayhim ghayril-maghdūbi 'alayhim walad-dāllīn',
    };

    return transliterations[verseKey] || 'Transliteration loading...';
  };

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

      {/* Arabic Text with Word Highlighting */}
      <View style={styles.arabicContainer}>
        {arabicWords.map((word, index) => (
          <Text
            key={index}
            style={[
              styles.arabicWord,
              highlightedWordIndex === index && styles.highlightedWord,
            ]}
          >
            {word}{' '}
          </Text>
        ))}
      </View>

      {/* Transliteration (Rumi - Jawi Style) */}
      {showTransliteration && (
        <View style={styles.transliterationContainer}>
          <Text style={styles.transliterationLabel}>Bacaan (Rumi):</Text>
          <Text style={styles.transliterationText}>
            {getTransliteration(ayah.verse_key)}
          </Text>
        </View>
      )}

      {/* Translation */}
      <Text style={styles.translationText}>{ayah.translationText}</Text>

      {/* Progress Bar (when playing) */}
      {isCurrentlyPlaying && duration > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentPosition / duration) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.floor(currentPosition)}s / {Math.floor(duration)}s
          </Text>
        </View>
      )}

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
  arabicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginBottom: 12,
    direction: 'rtl',
  },
  arabicWord: {
    fontSize: 24,
    lineHeight: 40,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  highlightedWord: {
    backgroundColor: '#10B981',
    color: '#000000',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  transliterationContainer: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  transliterationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A78BFA',
    marginBottom: 4,
  },
  transliterationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#E0E7FF',
    fontStyle: 'italic',
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#D1D5DB',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
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
