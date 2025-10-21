import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../../contexts/AudioContext';
import { getSurah } from '../../services/quranApi';
import { SURAHS } from '../../constants/surahs';
import type { Track } from '../../types';

const { width, height } = Dimensions.get('window');
const WIDGET_HEIGHT = 70;
const MINIMIZED_HEIGHT = 60;

export default function AudioWidget() {
    const {
      currentTrack,
      isPlaying,
      playTrack,
      pause,
      seek,
      currentTime: position,
      duration
    } = useAudio();

    const [isMinimized, setIsMinimized] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [surahName, setSurahName] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const panY = useRef(new Animated.Value(0)).current;

    // Update progress
    useEffect(() => {
        if (duration > 0) {
            setProgress(position / duration);
        }
    }, [position, duration]);

    // Get Surah name when track changes
    useEffect(() => {
        if (currentTrack?.type === 'ayah') {
            const [surahId] = currentTrack.key.split(':');
            const surah = SURAHS.find(s => s.number === parseInt(surahId));
            if (surah) {
                setSurahName(surah.englishName);
            }
        }
    }, [currentTrack]);

    // Pan responder for swipe gestures
    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return Math.abs(gestureState.dy) > 5;
        },
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dy < 0) {
                // Swiping up - expand
                panY.setValue(gestureState.dy);
            } else if (gestureState.dy > 0 && isExpanded) {
                // Swiping down - minimize
                panY.setValue(gestureState.dy);
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy < -50) {
                // Swiped up enough - expand
                setIsExpanded(true);
                Animated.spring(panY, {
                    toValue: -height + WIDGET_HEIGHT,
                    useNativeDriver: false,
                }).start();
            } else if (gestureState.dy > 50 && isExpanded) {
                // Swiped down enough - minimize
                setIsExpanded(false);
                Animated.spring(panY, {
                    toValue: 0,
                    useNativeDriver: false,
                }).start();
            } else {
                // Not swiped enough - return to original position
                Animated.spring(panY, {
                    toValue: isExpanded ? -height + WIDGET_HEIGHT : 0,
                    useNativeDriver: false,
                }).start();
            }
        },
    });

    // Don't render if no track is playing
    if (!currentTrack) {
        return null;
    }

    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            playTrack(currentTrack);
        }
    };

    const handleSeek = (event: any) => {
        const { locationX } = event.nativeEvent;
        const progressBarWidth = width - 100; // Account for padding
        const seekPosition = (locationX / progressBarWidth) * duration;
        seek(seekPosition);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const widgetStyle = {
        transform: [
            {
                translateY: isExpanded
                    ? panY.interpolate({
                        inputRange: [-height + WIDGET_HEIGHT, 0],
                        outputRange: [-height + WIDGET_HEIGHT, -height + WIDGET_HEIGHT],
                        extrapolate: 'clamp',
                    })
                    : panY.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, 0],
                        extrapolate: 'clamp',
                    })
            }
        ],
        height: isExpanded ? height : isMinimized ? MINIMIZED_HEIGHT : WIDGET_HEIGHT,
    };

    return (
        <Animated.View style={[styles.container, widgetStyle]} {...panResponder.panHandlers}>
            {/* Handle for expanded view */}
            {isExpanded && (
                <View style={styles.handle}>
                    <View style={styles.handleBar} />
                </View>
            )}

            <View style={styles.content}>
                {/* Left side - Track info */}
                <View style={styles.trackInfo}>
                    {!isMinimized && (
                        <View style={styles.trackIcon}>
                            <Ionicons name="musical-notes" size={20} color="#10B981" />
                        </View>
                    )}
                    <View style={styles.trackDetails}>
                        <Text
                            style={[
                                styles.trackTitle,
                                isMinimized && styles.trackTitleMinimized
                            ]}
                            numberOfLines={isMinimized ? 1 : 2}
                        >
                            {currentTrack.type === 'ayah' ? `Ayah ${currentTrack.key.split(':')[1]}` : 'Audio Track'}
                        </Text>
                        {!isMinimized && (
                            <Text style={styles.trackSubtitle} numberOfLines={1}>
                                {surahName}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Center - Progress bar (only when not minimized) */}
                {!isMinimized && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[styles.progressFill, { width: `${progress * 100}%` }]}
                            />
                        </View>
                        <Text style={styles.timeText}>
                            {formatTime(position)} / {formatTime(duration)}
                        </Text>
                    </View>
                )}

                {/* Right side - Controls */}
                <View style={styles.controls}>
                    {/* Minimize/Expand button */}
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => setIsExpanded(!isExpanded)}
                    >
                        <Ionicons
                            name={isExpanded ? "chevron-down" : "chevron-up"}
                            size={20}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>

                    {/* Play/Pause button */}
                    <TouchableOpacity
                        style={[styles.playButton, isPlaying && styles.playButtonActive]}
                        onPress={handlePlayPause}
                    >
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={20}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>

                    {/* Close button (only when expanded) */}
                    {isExpanded && (
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => {
                                pause();
                                setIsExpanded(false);
                            }}
                        >
                            <Ionicons name="close" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Expanded content */}
            {isExpanded && (
                <View style={styles.expandedContent}>
                    {/* Large progress bar */}
                    <View style={styles.expandedProgressContainer}>
                        <TouchableOpacity
                            style={styles.expandedProgressBar}
                            onPress={handleSeek}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[styles.expandedProgressFill, { width: `${progress * 100}%` }]}
                            />
                        </TouchableOpacity>
                        <View style={styles.timeContainer}>
                            <Text style={styles.expandedTimeText}>
                                {formatTime(position)}
                            </Text>
                            <Text style={styles.expandedTimeText}>
                                {formatTime(duration)}
                            </Text>
                        </View>
                    </View>

                    {/* Additional controls */}
                    <View style={styles.expandedControls}>
                        <TouchableOpacity style={styles.expandedControlButton}>
                            <Ionicons name="play-skip-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.expandedControlButton}>
                            <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.expandedControlButton}>
                            <Ionicons name="repeat" size={24} color="#9CA3AF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.expandedControlButton}>
                            <Ionicons name="share-social" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1F2937',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
    },
    handle: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#374151',
        borderRadius: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: MINIMIZED_HEIGHT,
    },
    trackInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    trackIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    trackDetails: {
        flex: 1,
    },
    trackTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    trackTitleMinimized: {
        fontSize: 14,
    },
    trackSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    progressContainer: {
        flex: 1,
        marginHorizontal: 16,
        alignItems: 'center',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#374151',
        borderRadius: 2,
        width: '100%',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 2,
    },
    timeText: {
        fontSize: 10,
        color: '#6B7280',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    playButtonActive: {
        backgroundColor: '#059669',
    },
    expandedContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    expandedProgressContainer: {
        marginVertical: 20,
    },
    expandedProgressBar: {
        height: 8,
        backgroundColor: '#374151',
        borderRadius: 4,
        marginBottom: 12,
    },
    expandedProgressFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    expandedTimeText: {
        fontSize: 14,
        color: '#D1D5DB',
    },
    expandedControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    expandedControlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
    },
});