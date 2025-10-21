/**
 * Downloads Manager Screen
 * Manage offline audio downloads and cached content
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import NetInfo from '@react-native-community/netinfo';
import { getVerseAudio } from '../services/quranApi';
import { getSurahVerses } from '../services/quranApi';
import { SURAHS } from '../constants/surahs';
import { RECITERS } from '../constants/reciters';
import { Modal } from 'react-native';

interface DownloadItem {
  id: string;
  type: 'audio' | 'surah' | 'juz';
  name: string;
  nameArabic: string;
  reciter?: string;
  size: number;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  url: string;
  localPath?: string;
}

export default function DownloadsScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [usedSpace, setUsedSpace] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableContent, setAvailableContent] = useState<any[]>([]);

  useEffect(() => {
    loadDownloads();
    calculateStorage();
    checkConnection();

    // const unsubscribe = NetInfo.addEventListener(state => {
    //   setIsOnline(state.isConnected || false);
    // });
    
    return () => {};
  }, []);

  const checkConnection = async () => {
    try {
      // const state = await NetInfo.fetch();
      // setIsOnline(state.isConnected || false);
      setIsOnline(true); // Assume online for now
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const loadAvailableContent = () => {
    // Create list of available surahs for download
    const content = SURAHS.slice(0, 10).map(surah => ({
      id: surah.number.toString(),
      type: 'surah' as const,
      name: surah.englishName,
      nameArabic: surah.name,
      size: Math.floor(Math.random() * 50000000) + 10000000, // Random size between 10-60MB
      url: '', // Will be generated when downloading
      reciterOptions: RECITERS.slice(0, 3), // Top 3 reciters
    }));

    setAvailableContent(content);
  };

  const addDownload = async (content: any, reciterId: number) => {
    try {
      const reciter = RECITERS.find(r => r.id === reciterId);
      if (!reciter) return;

      // Check if already downloading
      const existingDownload = downloads.find(d =>
        d.id === `${content.id}_${reciterId}`
      );

      if (existingDownload) {
        Alert.alert('Already Downloading', 'This item is already in your downloads list.');
        return;
      }

      // Create download item
      const newDownload: DownloadItem = {
        id: `${content.id}_${reciterId}`,
        type: content.type,
        name: content.name,
        nameArabic: content.nameArabic,
        reciter: reciter.name,
        size: content.size,
        progress: 0,
        status: 'pending',
        url: '', // Will be generated when downloading starts
      };

      const updatedDownloads = [...downloads, newDownload];
      setDownloads(updatedDownloads);
      await AsyncStorage.setItem('downloads', JSON.stringify(updatedDownloads));

      // Start download if online
      if (isOnline) {
        startDownload(newDownload);
      }

      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding download:', error);
      Alert.alert('Error', 'Failed to add download.');
    }
  };

  const downloadSurah = async (item: DownloadItem) => {
    try {
      // Update status to downloading
      const updatedDownloads = downloads.map(d =>
        d.id === item.id ? { ...d, status: 'downloading' as const, progress: 0 } : d
      );
      setDownloads(updatedDownloads);
      await AsyncStorage.setItem('downloads', JSON.stringify(updatedDownloads));

      // Get surah verses
      const surahId = parseInt(item.id.split('_')[0]);
      const verses = await getSurahVerses(surahId);

      if (verses.length === 0) {
        throw new Error('No verses found');
      }

      // Create directory for this surah
      const dirName = `surah_${surahId}_reciter_${item.reciter}`;
      const dirPath = `${FileSystem.documentDirectory}${dirName}/`;

      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
      }

      // Download all verses
      let totalDownloaded = 0;
      const totalVerses = verses.length;

      for (const verse of verses) {
        try {
          const audioUrl = await getVerseAudio(verse.verse_key, parseInt(item.id.split('_')[1]));
          const fileName = `${verse.verse_key.replace(':', '_')}.mp3`;
          const localPath = `${dirPath}${fileName}`;

          const downloadResumable = FileSystem.createDownloadResumable(
            audioUrl,
            localPath,
            {},
            (downloadProgress) => {
              // Calculate overall progress
              const verseProgress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
              const overallProgress = ((totalDownloaded + verseProgress) / totalVerses) * 100;

              setDownloads(prev =>
                prev.map(d =>
                  d.id === item.id ? { ...d, progress: Math.round(overallProgress) } : d
                )
              );
            }
          );

          await downloadResumable.downloadAsync();
          totalDownloaded++;

          // Update progress after each verse
          const overallProgress = (totalDownloaded / totalVerses) * 100;
          setDownloads(prev =>
            prev.map(d =>
              d.id === item.id ? { ...d, progress: Math.round(overallProgress) } : d
            )
          );
        } catch (error) {
          console.error(`Error downloading verse ${verse.verse_key}:`, error);
          // Continue with next verse
        }
      }

      // Mark as completed
      const completedDownloads = downloads.map(d =>
        d.id === item.id
          ? { ...d, status: 'completed' as const, progress: 100, localPath: dirPath }
          : d
      );
      setDownloads(completedDownloads);
      await AsyncStorage.setItem('downloads', JSON.stringify(completedDownloads));
      await calculateStorage();

      Alert.alert('Download Complete', `${item.name} has been downloaded successfully.`);
    } catch (error) {
      console.error('Download error:', error);
      // Mark as failed
      const failedDownloads = downloads.map(d =>
        d.id === item.id ? { ...d, status: 'failed' as const } : d
      );
      setDownloads(failedDownloads);
      await AsyncStorage.setItem('downloads', JSON.stringify(failedDownloads));

      Alert.alert('Download Failed', 'Failed to download surah. Please try again.');
    }
  };

  const retryAllFailed = async () => {
    const failedDownloads = downloads.filter(d => d.status === 'failed');

    if (failedDownloads.length === 0) {
      Alert.alert('No Failed Downloads', 'All downloads are completed or in progress.');
      return;
    }

    if (!isOnline) {
      Alert.alert('Offline', 'Please connect to the internet to retry downloads.');
      return;
    }

    Alert.alert(
      'Retry Failed Downloads',
      `Retry ${failedDownloads.length} failed download(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: () => {
            failedDownloads.forEach(item => {
              if (item.type === 'surah') {
                downloadSurah(item);
              } else {
                startDownload(item);
              }
            });
          },
        },
      ]
    );
  };

  const loadDownloads = async () => {
    try {
      const saved = await AsyncStorage.getItem('downloads');
      if (saved) {
        setDownloads(JSON.parse(saved));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading downloads:', error);
      setLoading(false);
    }
  };

  const calculateStorage = async () => {
    try {
      const info = await FileSystem.getInfoAsync(FileSystem.documentDirectory!);
      if (info.exists && 'size' in info) {
        setUsedSpace(info.size || 0);
      }
      // Assume 1GB total available space for downloads
      setTotalSize(1024 * 1024 * 1024);
    } catch (error) {
      console.error('Error calculating storage:', error);
    }
  };

  const startDownload = async (item: DownloadItem) => {
    if (item.type === 'surah') {
      downloadSurah(item);
      return;
    }

    try {
      // Update status to downloading
      const updatedDownloads = downloads.map(d =>
        d.id === item.id ? { ...d, status: 'downloading' as const, progress: 0 } : d
      );
      setDownloads(updatedDownloads);
      await AsyncStorage.setItem('downloads', JSON.stringify(updatedDownloads));

      // Create local path
      const fileName = `${item.type}_${item.id}.mp3`;
      const localPath = `${FileSystem.documentDirectory}${fileName}`;

      // Download with progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        item.url,
        localPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          // Update progress
          setDownloads(prev =>
            prev.map(d =>
              d.id === item.id ? { ...d, progress: Math.round(progress * 100) } : d
            )
          );
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result) {
        // Mark as completed
        const completedDownloads = downloads.map(d =>
          d.id === item.id
            ? { ...d, status: 'completed' as const, progress: 100, localPath: result.uri }
            : d
        );
        setDownloads(completedDownloads);
        await AsyncStorage.setItem('downloads', JSON.stringify(completedDownloads));
        await calculateStorage();
      }
    } catch (error) {
      console.error('Download error:', error);
      // Mark as failed
      const failedDownloads = downloads.map(d =>
        d.id === item.id ? { ...d, status: 'failed' as const } : d
      );
      setDownloads(failedDownloads);
      await AsyncStorage.setItem('downloads', JSON.stringify(failedDownloads));
    }
  };

  const deleteDownload = async (item: DownloadItem) => {
    Alert.alert(
      'Delete Download',
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete file
              if (item.localPath) {
                await FileSystem.deleteAsync(item.localPath, { idempotent: true });
              }
              
              // Remove from list
              const updatedDownloads = downloads.filter(d => d.id !== item.id);
              setDownloads(updatedDownloads);
              await AsyncStorage.setItem('downloads', JSON.stringify(updatedDownloads));
              await calculateStorage();
            } catch (error) {
              console.error('Error deleting download:', error);
              Alert.alert('Error', 'Failed to delete download.');
            }
          },
        },
      ]
    );
  };

  const clearAllDownloads = () => {
    Alert.alert(
      'Clear All Downloads',
      'Are you sure you want to delete all downloaded content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all files
              for (const item of downloads) {
                if (item.localPath) {
                  await FileSystem.deleteAsync(item.localPath, { idempotent: true });
                }
              }
              
              setDownloads([]);
              await AsyncStorage.setItem('downloads', JSON.stringify([]));
              await calculateStorage();
            } catch (error) {
              console.error('Error clearing downloads:', error);
              Alert.alert('Error', 'Failed to clear downloads.');
            }
          },
        },
      ]
    );
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const storagePercentage = (usedSpace / totalSize) * 100;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Downloads</Text>
        <TouchableOpacity onPress={clearAllDownloads} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline" size={20} color="#F59E0B" />
            <Text style={styles.offlineText}>You're offline. Downloads will resume when connected.</Text>
          </View>
        )}

        {/* Storage Info */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Ionicons name="server-outline" size={24} color="#10B981" />
            <Text style={styles.storageTitle}>Storage</Text>
          </View>

          <View style={styles.storageBar}>
            <View style={[styles.storageProgress, { width: `${storagePercentage}%` }]} />
          </View>

          <View style={styles.storageInfo}>
            <Text style={styles.storageText}>
              {formatSize(usedSpace)} / {formatSize(totalSize)}
            </Text>
            <Text style={styles.storagePercent}>
              {storagePercentage.toFixed(1)}% used
            </Text>
          </View>
        </View>

        {/* Download Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={() => {
              loadAvailableContent();
              setShowAddModal(true);
            }}
            disabled={!isOnline}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Download</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.retryButton]}
            onPress={retryAllFailed}
            disabled={!isOnline}
          >
            <Ionicons name="refresh-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Retry Failed</Text>
          </TouchableOpacity>
        </View>

        {/* Downloads List */}
        {downloads.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cloud-download-outline" size={64} color="#6B7280" />
            <Text style={styles.emptyTitle}>No Downloads</Text>
            <Text style={styles.emptySubtitle}>Download Quran content for offline access</Text>
          </View>
        ) : (
          <View style={styles.downloadsList}>
            <Text style={styles.sectionTitle}>
              Downloaded ({downloads.length})
            </Text>

            {downloads.map((item) => (
              <View key={item.id} style={styles.downloadItem}>
                <View style={styles.downloadIcon}>
                  <Ionicons
                    name={
                      item.type === 'audio'
                        ? 'musical-notes'
                        : item.type === 'surah'
                          ? 'book'
                          : 'albums'
                    }
                    size={24}
                    color="#10B981"
                  />
                </View>

                <View style={styles.downloadInfo}>
                  <Text style={styles.downloadName}>{item.name}</Text>
                  <Text style={styles.downloadNameArabic}>{item.nameArabic}</Text>
                  {item.reciter && (
                    <Text style={styles.downloadReciter}>{item.reciter}</Text>
                  )}

                  {/* Progress Bar */}
                  {item.status === 'downloading' && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[styles.progressFill, { width: `${item.progress}%` }]}
                        />
                      </View>
                      <Text style={styles.progressText}>{item.progress}%</Text>
                    </View>
                  )}

                  <Text style={styles.downloadSize}>{formatSize(item.size)}</Text>
                </View>

                <View style={styles.downloadActions}>
                  {item.status === 'completed' && (
                    <TouchableOpacity
                      onPress={() => deleteDownload(item)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}

                  {item.status === 'failed' && (
                    <TouchableOpacity
                      onPress={() => startDownload(item)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="refresh-outline" size={20} color="#F59E0B" />
                    </TouchableOpacity>
                  )}

                  {item.status === 'pending' && (
                    <TouchableOpacity
                      onPress={() => startDownload(item)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="download-outline" size={20} color="#10B981" />
                    </TouchableOpacity>
                  )}

                  {item.status === 'downloading' && (
                    <ActivityIndicator size="small" color="#10B981" />
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.tipText}>Download over Wi-Fi to save mobile data</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="wifi" size={20} color="#3B82F6" />
            <Text style={styles.tipText}>Keep your device charging during downloads</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="battery-charging" size={20} color="#3B82F6" />
            <Text style={styles.tipText}>Manage your storage space regularly</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Download Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Download</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Select a Surah to Download</Text>

              {availableContent.map((content) => (
                <View key={content.id} style={styles.contentItem}>
                  <View style={styles.contentInfo}>
                    <Text style={styles.contentName}>{content.name}</Text>
                    <Text style={styles.contentNameArabic}>{content.nameArabic}</Text>
                    <Text style={styles.contentSize}>{formatSize(content.size)}</Text>
                  </View>

                  <View style={styles.reciterOptions}>
                    <Text style={styles.reciterLabel}>Reciter:</Text>
                    {content.reciterOptions.map((reciter: any) => (
                      <TouchableOpacity
                        key={reciter.id}
                        style={styles.reciterOption}
                        onPress={() => addDownload(content, reciter.id)}
                      >
                        <Text style={styles.reciterName}>{reciter.name}</Text>
                        <Ionicons name="download" size={16} color="#10B981" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  storageCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  storageBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  storageProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  storageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  storagePercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  downloadsList: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  downloadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  downloadInfo: {
    flex: 1,
  },
  downloadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  downloadNameArabic: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  downloadReciter: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  downloadSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  downloadActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 12,
    flex: 1,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#92400E',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  actionsCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  downloadActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButton: {
    backgroundColor: '#10B981',
  },
  retryButton: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  contentItem: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  contentInfo: {
    marginBottom: 12,
  },
  contentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contentNameArabic: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  contentSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  reciterOptions: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
  },
  reciterLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  reciterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reciterName: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});
