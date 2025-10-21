import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Ayah } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface PageFlipViewProps {
  verses: Ayah[];
  currentPage: number;
  onPageChange: (page: number) => void;
  versesPerPage?: number;
  showTranslation?: boolean;
  language?: 'en' | 'ms' | 'id';
}

export default function PageFlipView({
  verses,
  currentPage,
  onPageChange,
  versesPerPage = 15,
  showTranslation = true,
  language = 'ms',
}: PageFlipViewProps) {
  const [currentIndex, setCurrentIndex] = useState(currentPage);
  const pan = useRef(new Animated.ValueXY()).current;
  const totalPages = Math.ceil(verses.length / versesPerPage);

  // Get verses for current page
  const getCurrentPageVerses = (pageIndex: number) => {
    const start = pageIndex * versesPerPage;
    const end = start + versesPerPage;
    return verses.slice(start, end);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow horizontal movement
        pan.setValue({ x: gestureState.dx, y: 0 });
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;

        // Swipe right (previous page)
        if (dx > SWIPE_THRESHOLD && currentIndex > 0) {
          animatePageChange(currentIndex - 1, 'right');
        }
        // Swipe left (next page)
        else if (dx < -SWIPE_THRESHOLD && currentIndex < totalPages - 1) {
          animatePageChange(currentIndex + 1, 'left');
        }
        // Return to center
        else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const animatePageChange = (newIndex: number, direction: 'left' | 'right') => {
    const toValue = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;

    Animated.timing(pan, {
      toValue: { x: toValue, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(newIndex);
      onPageChange(newIndex);
      pan.setValue({ x: 0, y: 0 });
    });
  };

  const goToPreviousPage = () => {
    if (currentIndex > 0) {
      animatePageChange(currentIndex - 1, 'right');
    }
  };

  const goToNextPage = () => {
    if (currentIndex < totalPages - 1) {
      animatePageChange(currentIndex + 1, 'left');
    }
  };

  const currentPageVerses = getCurrentPageVerses(currentIndex);

  return (
    <View style={styles.container}>
      {/* Page Content */}
      <Animated.View
        style={[
          styles.pageContainer,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.page}>
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageNumber}>
              {currentIndex + 1} / {totalPages}
            </Text>
          </View>

          {/* Verses */}
          <View style={styles.versesContainer}>
            {currentPageVerses.map((verse, index) => (
              <View key={verse.id} style={styles.verseContainer}>
                {/* Arabic Text */}
                <Text style={styles.arabicText}>
                  {verse.arabicText} ﴿{verse.verseNumber}﴾
                </Text>

                {/* Translation */}
                {showTranslation && (
                  <Text style={styles.translationText}>
                    {verse.verseNumber}.{' '}
                    {language === 'ms'
                      ? verse.translationText || 'Translation not available'
                      : language === 'id'
                      ? verse.translationText || 'Terjemahan tidak tersedia'
                      : verse.translationText}
                  </Text>
                )}

                {/* Divider */}
                {index < currentPageVerses.length - 1 && (
                  <View style={styles.verseDivider} />
                )}
              </View>
            ))}
          </View>

          {/* Page Footer */}
          <View style={styles.pageFooter}>
            <Text style={styles.footerText}>
              Surah {currentPageVerses[0]?.surahNumber}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={goToPreviousPage}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentIndex === 0 ? '#999' : '#4CAF50'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === totalPages - 1 && styles.navButtonDisabled,
          ]}
          onPress={goToNextPage}
          disabled={currentIndex === totalPages - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentIndex === totalPages - 1 ? '#999' : '#4CAF50'}
          />
        </TouchableOpacity>
      </View>

      {/* Swipe Indicator */}
      <View style={styles.swipeIndicator}>
        <Text style={styles.swipeText}>← Swipe to navigate →</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  pageContainer: {
    flex: 1,
  },
  page: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF9F0',
  },
  pageHeader: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#D4AF37',
  },
  pageNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  versesContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  verseContainer: {
    marginBottom: 20,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: 'right',
    color: '#000',
    fontFamily: 'System', // In production, use proper Arabic font
    marginBottom: 10,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'left',
  },
  verseDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 15,
  },
  pageFooter: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#D4AF37',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  swipeIndicator: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
});

