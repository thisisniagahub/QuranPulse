import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLanguage } from '../../contexts/LanguageContext';

const { width } = Dimensions.get('window');

export default function MoreScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'qibla' | 'ai'>('qibla');
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');

  const calculateQiblaDirection = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to calculate Qibla direction.'
        );
        setLoading(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;

      // Get address
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const city = address[0].city || address[0].subregion || 'Unknown';
        const country = address[0].country || 'Unknown';
        setUserLocation(`${city}, ${country}`);
      }

      // Calculate Qibla direction (Kaaba coordinates: 21.4225, 39.8262)
      const kaabaLat = 21.4225;
      const kaabaLng = 39.8262;

      const dLon = (kaabaLng - longitude) * (Math.PI / 180);
      const lat1 = latitude * (Math.PI / 180);
      const lat2 = kaabaLat * (Math.PI / 180);

      const y = Math.sin(dLon) * Math.cos(lat2);
      const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

      let direction = Math.atan2(y, x) * (180 / Math.PI);
      direction = (direction + 360) % 360;

      setQiblaDirection(Math.round(direction));
    } catch (error) {
      console.error('Error calculating Qibla:', error);
      Alert.alert('Error', 'Failed to calculate Qibla direction.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'qibla' && !qiblaDirection) {
      calculateQiblaDirection();
    }
  }, [activeTab]);

  const handleAIPronunciation = () => {
    setIsRecording(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsRecording(false);
      setAiResult('excellent');
      setTimeout(() => {
        Alert.alert(
          'AI Pronunciation Check',
          'Your pronunciation is excellent! Keep practicing.',
          [{ text: 'OK', onPress: () => setAiResult('') }]
        );
      }, 100);
    }, 2000);
  };

  const renderQiblaTab = () => (
    <View style={styles.tabContent}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Calculating Qibla direction...</Text>
        </View>
      ) : (
        <>
          {/* Compass Circle */}
          <View style={styles.compassContainer}>
            <View style={styles.compassCircle}>
              {/* Direction marker */}
              <View
                style={[
                  styles.directionArrow,
                  qiblaDirection ? {
                    transform: [{ rotate: `${qiblaDirection}deg` }],
                  } : undefined,
                ]}
              >
                <View style={styles.arrowHead}>
                  <Ionicons name="navigate" size={48} color="#10B981" />
                </View>
              </View>

              {/* Center Circle */}
              <View style={styles.centerCircle}>
                <Ionicons name="location" size={32} color="#10B981" />
              </View>

              {/* Cardinal Directions */}
              <View style={styles.cardinalN}>
                <Text style={styles.cardinalText}>N</Text>
              </View>
              <View style={styles.cardinalE}>
                <Text style={styles.cardinalText}>E</Text>
              </View>
              <View style={styles.cardinalS}>
                <Text style={styles.cardinalText}>S</Text>
              </View>
              <View style={styles.cardinalW}>
                <Text style={styles.cardinalText}>W</Text>
              </View>
            </View>
          </View>

          {/* Direction Info */}
          <View style={styles.infoSection}>
            <Text style={styles.directionLabel}>Qibla Direction</Text>
            <Text style={styles.directionDegree}>
              {qiblaDirection !== null ? `${qiblaDirection}°` : 'Calculating...'}
            </Text>
            {userLocation && (
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color="#9CA3AF" />
                <Text style={styles.locationInfoText}>{userLocation}</Text>
              </View>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.instructionCard}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.instructionText}>
              Hold your device flat and rotate until the arrow points North to face the Qibla direction.
            </Text>
          </View>

          {/* Recalculate Button */}
          <TouchableOpacity
            style={styles.recalculateButton}
            onPress={calculateQiblaDirection}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.recalculateText}>Recalculate</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderAITab = () => (
    <View style={styles.tabContent}>
      {/* AI Check Card */}
      <View style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <Ionicons name="mic" size={32} color="#F59E0B" />
          <Text style={styles.aiTitle}>AI Pronunciation Check</Text>
        </View>
        <Text style={styles.aiDescription}>
          Practice your Quran recitation and get instant feedback from our AI assistant.
        </Text>
      </View>

      {/* Sample Text */}
      <View style={styles.sampleCard}>
        <Text style={styles.sampleLabel}>Practice this verse:</Text>
        <Text style={styles.sampleArabic}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        <Text style={styles.sampleTranslation}>
          Bismillah ir-Rahman ir-Raheem
        </Text>
        <Text style={styles.sampleTranslationEng}>
          In the name of Allah, the Most Gracious, the Most Merciful
        </Text>
      </View>

      {/* Record Button */}
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordButtonActive,
        ]}
        onPress={handleAIPronunciation}
        disabled={isRecording}
      >
        {isRecording ? (
          <>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.recordButtonText}>Analyzing...</Text>
          </>
        ) : (
          <>
            <Ionicons name="mic" size={64} color="#FFFFFF" />
            <Text style={styles.recordButtonText}>Tap to Record</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Result */}
      {aiResult && (
        <View style={[styles.resultCard, styles.resultCardExcellent]}>
          <Ionicons name="checkmark-circle" size={48} color="#10B981" />
          <Text style={styles.resultTitle}>Excellent!</Text>
          <Text style={styles.resultText}>
            Your pronunciation is very good. Keep practicing!
          </Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.instructionCard}>
        <Ionicons name="bulb" size={20} color="#F59E0B" />
        <Text style={styles.instructionText}>
          This is a demo feature. In the full version, AI will analyze your recitation and provide detailed feedback.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More Features</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'qibla' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('qibla')}
        >
          <Ionicons
            name="compass"
            size={20}
            color={activeTab === 'qibla' ? '#FFFFFF' : '#9CA3AF'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'qibla' && styles.tabButtonTextActive,
            ]}
          >
            Qibla
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'ai' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('ai')}
        >
          <Ionicons
            name="mic"
            size={20}
            color={activeTab === 'ai' ? '#FFFFFF' : '#9CA3AF'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'ai' && styles.tabButtonTextActive,
            ]}
          >
            AI Check
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Menu */}
        <View style={styles.quickMenu}>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/hadith' as any)}
          >
            <Ionicons name="library" size={32} color="#0dcaf0" />
            <Text style={styles.menuTitle}>Hadis</Text>
            <Text style={styles.menuSubtitle}>Koleksi sahih</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/juz' as any)}
          >
            <Ionicons name="albums" size={32} color="#0dcaf0" />
            <Text style={styles.menuTitle}>30 Juz</Text>
            <Text style={styles.menuSubtitle}>Khatam dalam 30 hari</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/iqra' as any)}
          >
            <Ionicons name="book" size={32} color="#0dcaf0" />
            <Text style={styles.menuTitle}>Iqra 1-6</Text>
            <Text style={styles.menuSubtitle}>Belajar membaca</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/mengaji' as any)}
          >
            <Ionicons name="mic" size={32} color="#0dcaf0" />
            <Text style={styles.menuTitle}>MENGAJI</Text>
            <Text style={styles.menuSubtitle}>AI Recitation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/settings' as any)}
          >
            <Ionicons name="settings" size={32} color="#0dcaf0" />
            <Text style={styles.menuTitle}>Tetapan</Text>
            <Text style={styles.menuSubtitle}>Bahasa & lain-lain</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/profile' as any)}
          >
            <Ionicons name="person" size={32} color="#0dcaf0" />
            <Text style={styles.menuTitle}>Profil</Text>
            <Text style={styles.menuSubtitle}>Statistik anda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/bookmarks' as any)}
          >
            <Ionicons name="bookmarks" size={32} color="#0dcaf0" />
            <Text style={styles.menuTitle}>Penanda</Text>
            <Text style={styles.menuSubtitle}>Ayat tersimpan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/search' as any)}
          >
            <Ionicons name="search" size={32} color="#0dcaf0" />
            <Text style={styles.menuTitle}>Carian</Text>
            <Text style={styles.menuSubtitle}>Cari Quran & Hadis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/downloads' as any)}
          >
            <Ionicons name="download" size={32} color="#0dcaf0" />
            <Text style={styles.menuTitle}>Muat Turun</Text>
            <Text style={styles.menuSubtitle}>Audio offline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/motivation' as any)}
          >
            <Ionicons name="heart" size={32} color="#0dcaf0" />
            <Text style={styles.menuTitle}>Motivasi</Text>
            <Text style={styles.menuSubtitle}>Inspirasi harian</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'qibla' ? renderQiblaTab() : renderAITab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#10B981',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  quickMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  menuCard: {
    width: (width - 64) / 3,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  menuSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  compassContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  compassCircle: {
    width: width - 80,
    height: width - 80,
    borderRadius: (width - 80) / 2,
    backgroundColor: '#1F2937',
    borderWidth: 4,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  directionArrow: {
    position: 'absolute',
    top: 20,
  },
  arrowHead: {
    alignItems: 'center',
  },
  centerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  cardinalN: {
    position: 'absolute',
    top: 10,
  },
  cardinalE: {
    position: 'absolute',
    right: 10,
  },
  cardinalS: {
    position: 'absolute',
    bottom: 10,
  },
  cardinalW: {
    position: 'absolute',
    left: 10,
  },
  cardinalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  directionLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  directionDegree: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInfoText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 12,
    lineHeight: 20,
  },
  recalculateButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recalculateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  aiCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  aiHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  aiDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  sampleCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sampleLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  sampleArabic: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 44,
  },
  sampleTranslation: {
    fontSize: 16,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 8,
  },
  sampleTranslationEng: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  recordButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 120,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  recordButtonActive: {
    backgroundColor: '#EF4444',
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  resultCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultCardExcellent: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 12,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
