/**
 * MENGAJI Audio Service - Advanced Audio Recording and Playback
 * Supports high-quality recording, audio analysis, and reference audio playback
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface AudioRecording {
    uri: string;
    duration: number;
    createdAt: Date;
    quality: 'low' | 'medium' | 'high';
    format: string;
}

export interface AudioAnalysis {
    duration: number;
    averageVolume: number;
    peakVolume: number;
    silenceRatio: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    recommendations: string[];
}

export interface ReferenceAudio {
    id: string;
    verseId: number;
    arabic: string;
    reciter: string;
    uri: string;
    duration: number;
    quality: string;
}

class MengajiAudioService {
    private recordingInstance: Audio.Recording | null = null;
    private soundInstance: Audio.Sound | null = null;
    private audioModeSet = false;

    /**
     * Initialize audio session
     */
    async initializeAudio(): Promise<void> {
        try {
            if (!this.audioModeSet) {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
                this.audioModeSet = true;
            }
        } catch (error) {
            console.error('Error initializing audio:', error);
            throw new Error('Gagal menginisialisasi audio');
        }
    }

    /**
     * Start high-quality recording
     */
    async startRecording(quality: 'low' | 'medium' | 'high' = 'high'): Promise<void> {
        try {
            await this.initializeAudio();

            if (this.recordingInstance) {
                await this.recordingInstance.stopAndUnloadAsync();
            }

            const recordingOptions = this.getRecordingOptions(quality);

            const { recording } = await Audio.Recording.createAsync(recordingOptions);
            this.recordingInstance = recording;

            console.log('Recording started with quality:', quality);
        } catch (error) {
            console.error('Error starting recording:', error);
            throw new Error('Gagal memulakan rakaman');
        }
    }

    /**
     * Stop recording and return audio info
     */
    async stopRecording(): Promise<AudioRecording> {
        try {
            if (!this.recordingInstance) {
                throw new Error('Tiada rakaman aktif');
            }

            await this.recordingInstance.stopAndUnloadAsync();

            const uri = this.recordingInstance.getURI();
            if (!uri) {
                throw new Error('Gagal mendapatkan fail audio');
            }

            const status = await this.recordingInstance.getStatusAsync();
            const duration = status.metering || 0;

            const recording: AudioRecording = {
                uri,
                duration: duration / 1000, // Convert to seconds
                createdAt: new Date(),
                quality: 'high', // This should match the quality parameter used in startRecording
                format: 'm4a',
            };

            this.recordingInstance = null;

            console.log('Recording stopped:', recording);
            return recording;
        } catch (error) {
            console.error('Error stopping recording:', error);
            throw new Error('Gagal menghentikan rakaman');
        }
    }

    /**
     * Get recording options based on quality
     */
    private getRecordingOptions(quality: 'low' | 'medium' | 'high'): Audio.RecordingOptions {
        const baseOptions: Audio.RecordingOptions = {
            android: {
                extension: '.m4a',
                outputFormat: Audio.AndroidOutputFormat.MPEG_4,
                audioEncoder: Audio.AndroidAudioEncoder.AAC,
                sampleRate: 44100,
                numberOfChannels: 2,
                bitRate: 128000,
            },
            ios: {
                extension: '.wav',
                outputFormat: Audio.IOSOutputFormat.LINEARPCM,
                audioQuality: Audio.IOSAudioQuality.HIGH,
                sampleRate: 44100,
                numberOfChannels: 2,
                bitRate: 128000,
                linearPCMBitDepth: 16,
                linearPCMIsBigEndian: false,
                linearPCMIsFloat: false,
            },
            web: {
                mimeType: 'audio/webm',
                bitsPerSecond: 128000,
            },
        };

        switch (quality) {
            case 'low':
                return {
                    ...baseOptions,
                    android: {
                        ...baseOptions.android,
                        sampleRate: 22050,
                        bitRate: 64000,
                    },
                    ios: {
                        ...baseOptions.ios,
                        sampleRate: 22050,
                        audioQuality: Audio.IOSAudioQuality.LOW,
                    },
                };

            case 'medium':
                return {
                    ...baseOptions,
                    android: {
                        ...baseOptions.android,
                        sampleRate: 44100,
                        bitRate: 96000,
                    },
                    ios: {
                        ...baseOptions.ios,
                        sampleRate: 44100,
                        audioQuality: Audio.IOSAudioQuality.MEDIUM,
                    },
                };

            case 'high':
            default:
                return baseOptions;
        }
    }

    /**
     * Play audio file
     */
    async playAudio(uri: string, onComplete?: () => void): Promise<void> {
        try {
            await this.initializeAudio();

            if (this.soundInstance) {
                await this.soundInstance.unloadAsync();
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true },
                (status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        onComplete?.();
                    }
                }
            );

            this.soundInstance = sound;
            console.log('Playing audio:', uri);
        } catch (error) {
            console.error('Error playing audio:', error);
            throw new Error('Gagal memainkan audio');
        }
    }

    /**
     * Stop audio playback
     */
    async stopAudio(): Promise<void> {
        try {
            if (this.soundInstance) {
                await this.soundInstance.stopAsync();
                console.log('Audio stopped');
            }
        } catch (error) {
            console.error('Error stopping audio:', error);
        }
    }

    /**
     * Pause audio playback
     */
    async pauseAudio(): Promise<void> {
        try {
            if (this.soundInstance) {
                await this.soundInstance.pauseAsync();
                console.log('Audio paused');
            }
        } catch (error) {
            console.error('Error pausing audio:', error);
        }
    }

    /**
     * Resume audio playback
     */
    async resumeAudio(): Promise<void> {
        try {
            if (this.soundInstance) {
                await this.soundInstance.playAsync();
                console.log('Audio resumed');
            }
        } catch (error) {
            console.error('Error resuming audio:', error);
        }
    }

    /**
     * Get audio playback status
     */
    async getPlaybackStatus(): Promise<any> {
        try {
            if (this.soundInstance) {
                return await this.soundInstance.getStatusAsync();
            }
            return null;
        } catch (error) {
            console.error('Error getting playback status:', error);
            return null;
        }
    }

    /**
     * Analyze audio quality
     */
    async analyzeAudio(uri: string): Promise<AudioAnalysis> {
        try {
            // This is a simplified analysis
            // In a real implementation, you would use audio processing libraries
            // to analyze waveform, detect silence, measure volume, etc.

            const fileInfo = await FileSystem.getInfoAsync(uri);
            const duration = await this.getAudioDuration(uri);

            // Mock analysis - replace with actual audio processing
            const mockAnalysis: AudioAnalysis = {
                duration,
                averageVolume: Math.random() * 100,
                peakVolume: Math.random() * 100,
                silenceRatio: Math.random() * 0.3,
                quality: 'good',
                recommendations: [
                    'Pastikan rakaman di persekitaran yang senyap',
                    'Jarakkan mulut dari mikrofon sekitar 15-20cm',
                    'Bercakap dengan kadar yang konsisten',
                ],
            };

            // Determine quality based on metrics
            if (mockAnalysis.silenceRatio > 0.5) {
                mockAnalysis.quality = 'poor';
                mockAnalysis.recommendations.unshift('Terlalu banyak keheningan dalam rakaman');
            } else if (mockAnalysis.averageVolume < 30) {
                mockAnalysis.quality = 'fair';
                mockAnalysis.recommendations.unshift('Tingkatkan volume suara');
            } else if (mockAnalysis.averageVolume > 80) {
                mockAnalysis.quality = 'fair';
                mockAnalysis.recommendations.unshift('Kurangkan volume suara untuk mengelakkan distortion');
            } else {
                mockAnalysis.quality = 'excellent';
                mockAnalysis.recommendations = ['Kualiti audio sangat baik!'];
            }

            return mockAnalysis;
        } catch (error) {
            console.error('Error analyzing audio:', error);
            throw new Error('Gagal menganalisis audio');
        }
    }

    /**
     * Get audio duration
     */
    private async getAudioDuration(uri: string): Promise<number> {
        try {
            const { sound } = await Audio.Sound.createAsync({ uri });
            const status = await sound.getStatusAsync();
            const duration = status.isLoaded ? status.durationMillis || 0 : 0;
            await sound.unloadAsync();
            return duration / 1000; // Convert to seconds
        } catch (error) {
            console.error('Error getting audio duration:', error);
            return 0;
        }
    }

    /**
     * Get reference audio for verses
     */
    async getReferenceAudio(verseId: number, reciter: string = 'default'): Promise<ReferenceAudio | null> {
        try {
            // In a real implementation, this would fetch from a database or API
            // For now, return mock data

            const referenceAudios: ReferenceAudio[] = [
                {
                    id: 'ref_1',
                    verseId: 1,
                    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                    reciter: 'Mishary Rashid Al-Afasy',
                    uri: 'https://example.com/audio/1_1.mp3', // Replace with actual URL
                    duration: 3.5,
                    quality: 'high',
                },
                {
                    id: 'ref_2',
                    verseId: 2,
                    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                    reciter: 'Mishary Rashid Al-Afasy',
                    uri: 'https://example.com/audio/1_2.mp3', // Replace with actual URL
                    duration: 4.2,
                    quality: 'high',
                },
            ];

            return referenceAudios.find(audio => audio.verseId === verseId) || null;
        } catch (error) {
            console.error('Error getting reference audio:', error);
            return null;
        }
    }

    /**
     * Download reference audio for offline use
     */
    async downloadReferenceAudio(audio: ReferenceAudio): Promise<string> {
        try {
            const downloadResumable = FileSystem.createDownloadResumable(
                audio.uri,
                `${FileSystem.documentDirectory}mengaji_audio_${audio.id}.m4a`
            );

            const result = await downloadResumable.downloadAsync();
            const uri = result?.uri;

            if (uri) {
                console.log('Audio downloaded to:', uri);
                return uri;
            }

            throw new Error('Gagal memuat turun audio');
        } catch (error) {
            console.error('Error downloading reference audio:', error);
            throw new Error('Gagal memuat turun audio rujukan');
        }
    }

    /**
     * Get downloaded audio files
     */
    async getDownloadedAudio(): Promise<ReferenceAudio[]> {
        try {
            const documentDir = FileSystem.documentDirectory;
            if (!documentDir) return [];
            const files = await FileSystem.readDirectoryAsync(documentDir);
            const audioFiles = files.filter(file => file.startsWith('mengaji_audio_'));

            // In a real implementation, you would maintain a database of downloaded files
            // For now, return empty array
            return [];
        } catch (error) {
            console.error('Error getting downloaded audio:', error);
            return [];
        }
    }

    /**
     * Delete audio file
     */
    async deleteAudio(uri: string): Promise<void> {
        try {
            await FileSystem.deleteAsync(uri);
            console.log('Audio deleted:', uri);
        } catch (error) {
            console.error('Error deleting audio:', error);
        }
    }

    /**
     * Cleanup resources
     */
    async cleanup(): Promise<void> {
        try {
            if (this.recordingInstance) {
                await this.recordingInstance.stopAndUnloadAsync();
                this.recordingInstance = null;
            }

            if (this.soundInstance) {
                await this.soundInstance.unloadAsync();
                this.soundInstance = null;
            }
        } catch (error) {
            console.error('Error cleaning up audio service:', error);
        }
    }

    /**
     * Check microphone permissions
     */
    async checkPermissions(): Promise<boolean> {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error checking permissions:', error);
            return false;
        }
    }

    /**
     * Get audio levels for visualization
     */
    async getAudioLevels(): Promise<number> {
        try {
            if (this.recordingInstance) {
                const status = await this.recordingInstance.getStatusAsync();
                // In a real implementation, you would analyze the audio stream
                // For now, return mock value
                return Math.random() * 100;
            }
            return 0;
        } catch (error) {
            console.error('Error getting audio levels:', error);
            return 0;
        }
    }
}

// Export singleton instance
export const mengajiAudioService = new MengajiAudioService();

// Export types
// Types are already exported at the top