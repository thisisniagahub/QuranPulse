/**
 * Juz Navigation Screen
 * Browse and read Quran by 30 Juz divisions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { JUZ_DATA, JuzInfo, createKhatamSchedule } from '../constants/juzData';

export default function JuzScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [selectedJuz, setSelectedJuz] = useState<JuzInfo | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const handleJuzPress = (juz: JuzInfo) => {
    setSelectedJuz(juz);
  };

  const handleStartReading = (juz: JuzInfo) => {
    setSelectedJuz(null);
    // Navigate to surah with specific ayah
    router.push(`/surah/${juz.startSurah}?startAyah=${juz.startAyah}`);
  };

  const schedule = createKhatamSchedule(new Date());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>30 Juz Al-Quran</Text>
          <Text style={styles.headerSubtitle}>Organisasi lengkap 30 bahagian</Text>
        </View>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => setShowSchedule(true)}
        >
          <Ionicons name="calendar" size={24} color="#0dcaf0" />
        </TouchableOpacity>
      </View>

      {/* Juz Grid */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#0dcaf0" />
          <Text style={styles.infoText}>
            Al-Quran dibahagikan kepada 30 Juz untuk memudahkan bacaan dan khatam dalam sebulan.
            Setiap Juz mengandungi tema dan pengajaran tersendiri.
          </Text>
        </View>

        <View style={styles.juzGrid}>
          {JUZ_DATA.map((juz) => (
            <TouchableOpacity
              key={juz.juzNumber}
              style={styles.juzCard}
              onPress={() => handleJuzPress(juz)}
            >
              <View style={styles.juzNumberContainer}>
                <Text style={styles.juzNumber}>{juz.juzNumber}</Text>
                <Text style={styles.juzLabel}>JUZ</Text>
              </View>
              
              <View style={styles.juzInfo}>
                <Text style={styles.juzTheme} numberOfLines={2}>
                  {language === 'ms' || language === 'id' ? juz.descriptionMalay : juz.description}
                </Text>
                
                <View style={styles.juzRange}>
                  <Ionicons name="bookmark" size={14} color="#6B7280" />
                  <Text style={styles.juzRangeText}>
                    {juz.startSurahName} ({juz.startAyah}) → {juz.endSurahName} ({juz.endAyah})
                  </Text>
                </View>
                
                <View style={styles.juzStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="document-text" size={14} color="#0dcaf0" />
                    <Text style={styles.statText}>{juz.totalAyahs} ayat</Text>
                  </View>
                </View>
              </View>

              <View style={styles.juzArrow}>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Juz Detail Modal */}
      <Modal
        visible={selectedJuz !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedJuz(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedJuz && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalJuzNumber}>Juz {selectedJuz.juzNumber}</Text>
                    <Text style={styles.modalTheme}>{selectedJuz.theme}</Text>
                    <Text style={styles.modalThemeArabic}>{selectedJuz.themeArabic}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedJuz(null)}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>Tema & Kandungan:</Text>
                    <Text style={styles.descriptionText}>
                      {language === 'ms' || language === 'id' 
                        ? selectedJuz.descriptionMalay 
                        : selectedJuz.description}
                    </Text>
                  </View>

                  <View style={styles.rangeSection}>
                    <Text style={styles.sectionTitle}>Julat Bacaan:</Text>
                    
                    <View style={styles.rangeDetail}>
                      <View style={styles.rangeItem}>
                        <Ionicons name="play" size={20} color="#10B981" />
                        <View style={styles.rangeItemText}>
                          <Text style={styles.rangeLabel}>Mula:</Text>
                          <Text style={styles.rangeSurah}>
                            {selectedJuz.startSurahName}
                          </Text>
                          <Text style={styles.rangeArabic}>
                            {selectedJuz.startSurahNameArabic}
                          </Text>
                          <Text style={styles.rangeAyah}>Ayat {selectedJuz.startAyah}</Text>
                        </View>
                      </View>

                      <View style={styles.rangeDivider} />

                      <View style={styles.rangeItem}>
                        <Ionicons name="stop" size={20} color="#EF4444" />
                        <View style={styles.rangeItemText}>
                          <Text style={styles.rangeLabel}>Tamat:</Text>
                          <Text style={styles.rangeSurah}>
                            {selectedJuz.endSurahName}
                          </Text>
                          <Text style={styles.rangeArabic}>
                            {selectedJuz.endSurahNameArabic}
                          </Text>
                          <Text style={styles.rangeAyah}>Ayat {selectedJuz.endAyah}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.statsSection}>
                    <View style={styles.statCard}>
                      <Ionicons name="document-text" size={32} color="#0dcaf0" />
                      <Text style={styles.statCardNumber}>{selectedJuz.totalAyahs}</Text>
                      <Text style={styles.statCardLabel}>Jumlah Ayat</Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartReading(selectedJuz)}
                  >
                    <Ionicons name="book" size={20} color="#FFFFFF" />
                    <Text style={styles.startButtonText}>Mula Membaca</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Khatam Schedule Modal */}
      <Modal
        visible={showSchedule}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSchedule(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalJuzNumber}>Jadual Khatam 30 Hari</Text>
                <Text style={styles.modalTheme}>Bacaan harian untuk khatam Al-Quran</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSchedule(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {schedule.map((item) => (
                <View key={item.day} style={styles.scheduleItem}>
                  <View style={styles.scheduleDayContainer}>
                    <Text style={styles.scheduleDay}>Hari {item.day}</Text>
                    <Text style={styles.scheduleDate}>
                      {item.date.toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.scheduleJuzInfo}>
                    <Text style={styles.scheduleJuzNumber}>Juz {item.juz.juzNumber}</Text>
                    <Text style={styles.scheduleJuzTheme} numberOfLines={1}>
                      {item.juz.theme}
                    </Text>
                    <Text style={styles.scheduleJuzRange}>
                      {item.juz.startSurahName} → {item.juz.endSurahName}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.scheduleReadButton}
                    onPress={() => {
                      setShowSchedule(false);
                      handleStartReading(item.juz);
                    }}
                  >
                    <Ionicons name="play-circle" size={24} color="#0dcaf0" />
                  </TouchableOpacity>
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
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  scheduleButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0dcaf0',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
    marginLeft: 12,
    lineHeight: 20,
  },
  juzGrid: {
    gap: 12,
  },
  juzCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#0dcaf0',
  },
  juzNumberContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0dcaf0',
  },
  juzNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0dcaf0',
  },
  juzLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  juzInfo: {
    flex: 1,
    marginLeft: 16,
  },
  juzTheme: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  juzRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  juzRangeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  juzStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  juzArrow: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalJuzNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0dcaf0',
    marginBottom: 4,
  },
  modalTheme: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalThemeArabic: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'System',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  rangeSection: {
    marginBottom: 24,
  },
  rangeDetail: {
    gap: 16,
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
  },
  rangeItemText: {
    flex: 1,
    marginLeft: 12,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  rangeSurah: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  rangeArabic: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  rangeAyah: {
    fontSize: 13,
    color: '#6B7280',
  },
  rangeDivider: {
    height: 1,
    backgroundColor: '#374151',
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0dcaf0',
  },
  statCardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0dcaf0',
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#0dcaf0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0dcaf0',
  },
  scheduleDayContainer: {
    width: 70,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0dcaf0',
  },
  scheduleDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  scheduleJuzInfo: {
    flex: 1,
    marginLeft: 16,
  },
  scheduleJuzNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  scheduleJuzTheme: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  scheduleJuzRange: {
    fontSize: 11,
    color: '#6B7280',
  },
  scheduleReadButton: {
    padding: 8,
  },
});
