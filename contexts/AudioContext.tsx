import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import type { Track } from '../types';

interface AudioContextType {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  currentPosition: number; // Alias for currentTime (for HighlightedVerse compatibility)
  currentTrack: Track | null;
  isLoading: boolean;
  playTrack: (track: Track) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  skip: (amount: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  playbackRate: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1.0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Configure audio session
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        isInitialized.current = true;
      } catch (error) {
        console.error('Error configuring audio:', error);
      }
    };

    configureAudio();

    return () => {
      // Cleanup
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      const loadedStatus = status as AVPlaybackStatusSuccess;
      setIsPlaying(loadedStatus.isPlaying);
      setCurrentTime(loadedStatus.positionMillis / 1000);
      setDuration(loadedStatus.durationMillis ? loadedStatus.durationMillis / 1000 : 0);

      if (loadedStatus.didJustFinish && !loadedStatus.isLooping) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  };

  const playTrack = useCallback(async (track: Track) => {
    try {
      setIsLoading(true);

      // If same track, just toggle play/pause
      if (currentTrack?.key === track.key && soundRef.current) {
        await togglePlayPause();
        setIsLoading(false);
        return;
      }

      // Stop current sound if playing
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.src },
        { shouldPlay: true, rate: playbackRate },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing track:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentTrack, playbackRate]);

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          await soundRef.current.playAsync();
        }
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, []);

  const pause = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing:', error);
    }
  }, []);

  const stop = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
      setIsPlaying(false);
      setCurrentTime(0);
    } catch (error) {
      console.error('Error stopping:', error);
    }
  }, []);

  const seek = useCallback(async (time: number) => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.setPositionAsync(time * 1000);
      setCurrentTime(time);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, []);

  const skip = useCallback(async (amount: number) => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.max(0, Math.min(
          status.durationMillis || 0,
          status.positionMillis + (amount * 1000)
        ));
        await soundRef.current.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Error skipping:', error);
    }
  }, []);

  const setPlaybackRate = useCallback(async (rate: number) => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.setRateAsync(rate, true);
      setPlaybackRateState(rate);
    } catch (error) {
      console.error('Error setting playback rate:', error);
    }
  }, []);

  const value: AudioContextType = {
    isPlaying,
    duration,
    currentTime,
    currentPosition: currentTime, // Alias for compatibility with HighlightedVerse
    currentTrack,
    isLoading,
    playTrack,
    togglePlayPause,
    pause,
    stop,
    seek,
    skip,
    setPlaybackRate,
    playbackRate,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
