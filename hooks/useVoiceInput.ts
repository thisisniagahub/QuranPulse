import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { transcribeAudio } from '../services/speechToTextService';

// Define the VoiceInputResult type
interface VoiceInputResult {
  text: string;
  isRecording: boolean;
  confidence?: number;
  error?: string;
}

// Voice input hook
export const useVoiceInput = (
  languageCode: string = 'en-US'
): [VoiceInputResult, () => Promise<void>, () => void] => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  // Request audio permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission is required for voice input');
      }
    };

    requestPermissions();
  }, []);

  const startRecording = async () => {
    try {
      setError(undefined);
      setIsRecording(true);
      setTranscript('');
      setConfidence(undefined);
      
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission is required for voice input');
        setIsRecording(false);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording: ' + (err as Error).message);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      
      if (uri) {
        // Send audio file to a speech-to-text service
        const result = await transcribeAudio(uri, languageCode);
        setTranscript(result.text);
        setConfidence(result.confidence);
      }
      
      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setError('Failed to stop recording: ' + (err as Error).message);
      setIsRecording(false);
    }
  };

  // Return the current state and functions to start/stop recording
  const result: VoiceInputResult = {
    text: transcript,
    isRecording,
    confidence,
    error,
  };

  return [result, startRecording, stopRecording];
};