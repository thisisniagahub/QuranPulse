import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSurah, getSurahVerses, getTafsir } from '../../services/quranApi';
import { VerseCard } from '../../components/quran/VerseCard';
import { RECITERS } from '../../constants/reciters';
import { useAuth } from '../../contexts/AuthContext';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useAudio } from '../../contexts/AudioContext';
import { startReadingSession, updateReadingProgress } from '../../services/readingProgressService';
import type { Surah, Ayah } from '../../types';

export default function SurahDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = Dimensions.get('window');

  const { user } = useAuth();
  const { isPlaying, currentTrack } = useAudio();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const [surah, setSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReciterId, setSelectedReciterId] = useState(7); // Default: Mishary Al-Afasy
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [tafsirText, setTafsirText] = useState<string | null>(null);
  const [showTafsir, setShowTafsir] = useState(false);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [currentAyah, setCurrentAyah] = useState<number | null>(null);

  useEffect(() => {
    fetchSurahDetails();
  }, [id]);

  const fetchSurahDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const surahId = parseInt(id as string);

      // Fetch REAL Surah data using our service
      const [surahData, versesData] = await Promise.all([
        getSurah(surahId),
        getSurahVerses(surahId),
      ]);

      setSurah(surahData);
      setAyahs(versesData);
    } catch (err) {
      console.error('Error fetching surah details:', err);
      setError('Failed to load Surah. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowTafsir = async (ayahNumber: number, surahId: number) => {
    try {
      setLoadingTafsir(true);
      const verseKey = `${surahId}:${ayahNumber}`;
      const tafsir = await getTafsir(verseKey);
      setTafsirText(tafsir);
      setCurrentAyah(ayahNumber);
      setShowTafsir(true);
    } catch (error) {
      console.error('Error fetching tafsir:', error);
      setTafsirText('Failed to load tafsir. Please try again.');
    } finally {
      setLoadingTafsir(false);
    }
  };

  const handleReciterSelect = (reciterId: number) => {
    setSelectedReciterId(reciterId);
    setShowReciterPicker(false);
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading Surah...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{surah?.englishName}</Text>
          <Text style={styles.headerSubtitle}>{surah?.englishNameTranslation}</Text>
        </View>
        <TouchableOpacity
          style={styles.reciterButton}
          onPress={() => setShowReciterPicker(true)}
        >
          <Ionicons name="volume-high" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Surah Info Card */}
      {surah && (
        <View style={styles.infoCard}>
          <Text style={styles.surahNameArabic}>{surah.name}</Text>
          <View style={styles.infoMeta}>
            <Text style={styles.infoMetaText}>{surah.revelationType}</Text>
            <Text style={styles.infoMetaText}> • </Text>
            <Text style={styles.infoMetaText}>{surah.numberOfAyahs} Ayahs</Text>
          </View>
        </View>
      )}

      {/* Bismillah */}
      {surah && surah.number !== 1 && surah.number !== 9 && (
        <View style={styles.bismillahCard}>
          <Text style={styles.bismillahText}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </Text>
        </View>
      )}

      {/* Ayahs List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {ayahs.map((ayah) => (
          <VerseCard
            key={ayah.verse_key}
            ayah={ayah}
            surahName={surah?.englishName || ''}
            reciterId={selectedReciterId}
            onShowTafsir={(tafsir) => {
              setTafsirText(tafsir);
              setCurrentAyah(ayah.verseNumber);
              setShowTafsir(true);
            }}
          />
        ))}
      </ScrollView>

      {/* Reciter Picker Modal */}
      <Modal
        visible={showReciterPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReciterPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reciterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Reciter</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReciterPicker(false)}
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.reciterList}>
              {RECITERS.map((reciter) => (
                <TouchableOpacity
                  key={reciter.id}
                  style={[
                    styles.reciterOption,
                    selectedReciterId === reciter.id && styles.reciterOptionSelected
                  ]}
                  onPress={() => handleReciterSelect(reciter.id)}
                >
                  <View style={styles.reciterInfo}>
                    <Text style={styles.reciterName}>{reciter.name}</Text>
                    <Text style={styles.reciterArabic}>{reciter.arabicName}</Text>
                  </View>
                  {selectedReciterId === reciter.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Tafsir Modal */}
      <Modal
        visible={showTafsir}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTafsir(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tafsirModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Tafsir Ibn Kathir - Surah {surah?.name} Ayah {currentAyah}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowTafsir(false)}
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tafsirContent}>
              {loadingTafsir ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={styles.loadingText}>Loading tafsir...</Text>
                </View>
              ) : (
                <Text style={styles.tafsirText}>{tafsirText}</Text>
              )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  infoCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  surahNameArabic: {
    fontSize: 32,
    color: '#10B981',
    marginBottom: 8,
  },
  infoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoMetaText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  bismillahCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  bismillahText: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  ayahCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ayahNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahText: {
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'right',
    lineHeight: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reciterModal: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    width: Dimensions.get('window').width * 0.9,
    maxHeight: '70%',
  },
  tafsirModal: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    width: Dimensions.get('window').width * 0.9,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  reciterList: {
    maxHeight: 300,
  },
  reciterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  reciterOptionSelected: {
    backgroundColor: '#111827',
  },
  reciterInfo: {
    flex: 1,
  },
  reciterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reciterArabic: {
    fontSize: 14,
    color: '#10B981',
  },
  tafsirContent: {
    padding: 20,
    maxHeight: 400,
  },
  tafsirText: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  reciterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
