/**
 * Swipeable Verse Component
 * Enable swipe navigation between verses
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

interface SwipeableVerseProps {
  currentVerse: {
    surahNumber: number;
    ayahNumber: number;
    arabicText: string;
    translation?: string;
    transliteration?: string;
  };
  onSwipeLeft?: () => void;  // Next verse
  onSwipeRight?: () => void; // Previous verse
  onSwipeUp?: () => void;    // Next surah
  onSwipeDown?: () => void;  // Previous surah
  enableHorizontalSwipe?: boolean;
  enableVerticalSwipe?: boolean;
}

export function SwipeableVerse({
  currentVerse,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  enableHorizontalSwipe = true,
  enableVerticalSwipe = false,
}: SwipeableVerseProps) {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const pan = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        // Detect horizontal or vertical movement
        if (enableHorizontalSwipe && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
          return true;
        }
        if (enableVerticalSwipe && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
          return true;
        }
        return false;
      },
      
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy, vx, vy } = gestureState;
        
        // Horizontal swipe
        if (enableHorizontalSwipe && Math.abs(dx) > Math.abs(dy)) {
          if (dx > SWIPE_THRESHOLD || vx > SWIPE_VELOCITY_THRESHOLD) {
            // Swipe right - Previous verse
            swipeComplete('right');
          } else if (dx < -SWIPE_THRESHOLD || vx < -SWIPE_VELOCITY_THRESHOLD) {
            // Swipe left - Next verse
            swipeComplete('left');
          } else {
            // Reset position
            resetPosition();
          }
        }
        
        // Vertical swipe
        else if (enableVerticalSwipe && Math.abs(dy) > Math.abs(dx)) {
          if (dy > SWIPE_THRESHOLD || vy > SWIPE_VELOCITY_THRESHOLD) {
            // Swipe down - Previous surah
            swipeComplete('down');
          } else if (dy < -SWIPE_THRESHOLD || vy < -SWIPE_VELOCITY_THRESHOLD) {
            // Swipe up - Next surah
            swipeComplete('up');
          } else {
            // Reset position
            resetPosition();
          }
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const swipeComplete = (direction: 'left' | 'right' | 'up' | 'down') => {
    const x = direction === 'left' ? -SCREEN_WIDTH : direction === 'right' ? SCREEN_WIDTH : 0;
    const y = direction === 'up' ? -SCREEN_WIDTH : direction === 'down' ? SCREEN_WIDTH : 0;
    
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x, y },
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Call appropriate callback
      switch (direction) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }
      
      // Reset for next verse
      pan.setValue({ x: 0, y: 0 });
      fadeAnim.setValue(1);
    });
  };

  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  const panStyle = {
    transform: [...pan.getTranslateTransform()],
    opacity: fadeAnim,
  };

  return (
    <Animated.View
      style={[styles.container, panStyle]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.verseCard, { backgroundColor: colors.surface }]}>
        {/* Verse Number */}
        <View style={styles.verseHeader}>
          <View style={[styles.verseNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.verseNumberText}>
              {currentVerse.surahNumber}:{currentVerse.ayahNumber}
            </Text>
          </View>
        </View>

        {/* Arabic Text */}
        <Text
          style={[
            styles.arabicText,
            { 
              color: colors.text,
              fontSize: settings.arabicFontSize,
            }
          ]}
        >
          {currentVerse.arabicText}
        </Text>

        {/* Translation */}
        {settings.showTranslation && currentVerse.translation && (
          <Text
            style={[
              styles.translation,
              { 
                color: colors.textSecondary,
                fontSize: settings.translationFontSize,
              }
            ]}
          >
            {currentVerse.translation}
          </Text>
        )}

        {/* Transliteration */}
        {settings.showTransliteration && currentVerse.transliteration && (
          <Text
            style={[
              styles.transliteration,
              { 
                color: colors.textMuted,
                fontSize: settings.transliterationFontSize,
              }
            ]}
          >
            {currentVerse.transliteration}
          </Text>
        )}

        {/* Swipe Hints */}
        <View style={styles.swipeHints}>
          {enableHorizontalSwipe && (
            <>
              <Text style={[styles.swipeHint, { color: colors.textMuted }]}>
                ← Next
              </Text>
              <Text style={[styles.swipeHint, { color: colors.textMuted }]}>
                Previous →
              </Text>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  verseCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  verseNumber: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  verseNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  arabicText: {
    textAlign: 'right',
    lineHeight: 48,
    marginBottom: 20,
    fontWeight: '500',
  },
  translation: {
    lineHeight: 28,
    marginBottom: 16,
  },
  transliteration: {
    lineHeight: 24,
    fontStyle: 'italic',
  },
  swipeHints: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  swipeHint: {
    fontSize: 12,
    opacity: 0.5,
  },
});

export default SwipeableVerse;
