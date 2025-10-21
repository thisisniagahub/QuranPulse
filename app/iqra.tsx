/**
 * Iqra Learning Module
 * Step-by-step Quranic reading lessons (Iqra 1-6)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVoiceInput } from '../hooks/useVoiceInput';
import {
  IQRA_BOOKS,
  IQRA_LESSONS,
  IqraBook,
  IqraLesson,
  getLessonsByBook,
  getDailyPractice,
} from '../constants/iqraData';

export default function IqraScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const [voiceResult, startRecording, stopRecording] = useVoiceInput('ar-SA');
  const { text: transcript, isRecording } = voiceResult;

  const [selectedBook, setSelectedBook] = useState<IqraBook | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<IqraLesson | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; message: string } | null>(null);

  const handleBookPress = (book: IqraBook) => {
    setSelectedBook(book);
  };

  const handleLessonPress = (lesson: IqraLesson) => {
    setSelectedLesson(lesson);
    setCurrentExampleIndex(0);
    setUserInput('');
    setAnswerResult(null);
  };

  const loadProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem('iqra_progress');
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      await AsyncStorage.setItem('iqra_progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const updateProgress = (bookNumber: number, lessonNumber: number) => {
    const key = `book_${bookNumber}_lesson_${lessonNumber}`;
    const newProgress = { ...progress };
    newProgress[key] = (progress[key] || 0) + 1;
    setProgress(newProgress);
    saveProgress();
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const startPractice = () => {
    setPracticeMode(true);
    setCurrentExampleIndex(0);
    setUserInput('');
    setAnswerResult(null);
  };

  const nextExample = () => {
    if (selectedLesson && currentExampleIndex < selectedLesson.examples.length - 1) {
      setCurrentExampleIndex(currentExampleIndex + 1);
      setUserInput('');
      setAnswerResult(null);
    } else {
      // Lesson completed
      if (selectedLesson) {
        updateProgress(selectedLesson.iqraBook, selectedLesson.lessonNumber);
        Alert.alert(
          'Pelajaran Selesai!',
          'Tahniah! Anda telah menyelesaikan pelajaran ini.',
          [{ text: 'OK', onPress: () => setPracticeMode(false) }]
        );
      }
    }
  };

  const checkAnswer = async () => {
    if (!selectedLesson || !userInput.trim()) return;

    setIsCheckingAnswer(true);

    try {
      // Simple check - in a real app, this would be more sophisticated
      const correctAnswer = selectedLesson.examples[currentExampleIndex];
      const isCorrect = userInput.trim() === correctAnswer;

      setAnswerResult({
        correct: isCorrect,
        message: isCorrect
          ? 'Betul! Sebutan anda tepat.'
          : 'Cuba lagi. Perhatikan huruf dan tanda baris dengan teliti.'
      });

      if (isCorrect) {
        // Auto-advance to next example after a short delay
        setTimeout(() => {
          nextExample();
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      setAnswerResult({
        correct: false,
        message: 'Ralat semasa memeriksa jawapan. Sila cuba lagi.'
      });
    } finally {
      setIsCheckingAnswer(false);
    }
  };

  const handleVoiceInput = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Error starting voice recording:', error);
      Alert.alert('Ralat', 'Tidak dapat memulakan rakaman suara.');
    }
  };

  const stopVoiceInput = async () => {
    try {
      await stopRecording();
      if (transcript) {
        setUserInput(transcript);
      }
    } catch (error) {
      console.error('Error stopping voice recording:', error);
    }
  };

  useEffect(() => {
    if (transcript && practiceMode) {
      setUserInput(transcript);
    }
  }, [transcript, practiceMode]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return '#10B981';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return language === 'en' ? 'Beginner' : 'Pemula';
      case 'intermediate':
        return language === 'en' ? 'Intermediate' : 'Pertengahan';
      case 'advanced':
        return language === 'en' ? 'Advanced' : 'Lanjutan';
      default:
        return level;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Iqra 1-6</Text>
          <Text style={styles.headerSubtitle}>Belajar membaca Al-Quran</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction Card */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="school" size={48} color="#0dcaf0" />
          </View>
          <Text style={styles.introTitle}>Pembelajaran Iqra</Text>
          <Text style={styles.introText}>
            Sistem Iqra adalah kaedah pembelajaran membaca Al-Quran secara bertahap.
            Bermula dari mengenali huruf hingga mahir membaca dengan tajwid.
          </Text>
          <View style={styles.introStats}>
            <View style={styles.introStat}>
              <Text style={styles.introStatNumber}>6</Text>
              <Text style={styles.introStatLabel}>Buku Iqra</Text>
            </View>
            <View style={styles.introStat}>
              <Text style={styles.introStatNumber}>168+</Text>
              <Text style={styles.introStatLabel}>Pelajaran</Text>
            </View>
            <View style={styles.introStat}>
              <Text style={styles.introStatNumber}>15-25</Text>
              <Text style={styles.introStatLabel}>Min/Hari</Text>
            </View>
          </View>
        </View>

        {/* Iqra Books */}
        <Text style={styles.sectionTitle}>Pilih Buku Iqra</Text>

        {IQRA_BOOKS.map((book) => {
          const practice = getDailyPractice(book.bookNumber);

          return (
            <TouchableOpacity
              key={book.bookNumber}
              style={styles.bookCard}
              onPress={() => handleBookPress(book)}
            >
              <View style={styles.bookNumber}>
                <Text style={styles.bookNumberText}>{book.bookNumber}</Text>
              </View>

              <View style={styles.bookInfo}>
                <View style={styles.bookTitleRow}>
                  <Text style={styles.bookTitle}>
                    {language === 'ar' ? book.titleArabic : book.title}
                  </Text>
                  <View
                    style={[
                      styles.levelBadge,
                      { backgroundColor: getLevelColor(book.level) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.levelText,
                        { color: getLevelColor(book.level) },
                      ]}
                    >
                      {getLevelText(book.level)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bookArabic}>{book.titleArabic}</Text>

                <Text style={styles.bookDescription} numberOfLines={2}>
                  {language === 'ar'
                    ? book.descriptionMalay
                    : book.description}
                </Text>

                <View style={styles.bookStats}>
                  <View style={styles.bookStat}>
                    <Ionicons name="book" size={14} color="#6B7280" />
                    <Text style={styles.bookStatText}>
                      {book.totalLessons} pelajaran
                    </Text>
                  </View>
                  <View style={styles.bookStat}>
                    <Ionicons name="time" size={14} color="#6B7280" />
                    <Text style={styles.bookStatText}>
                      {practice.duration} min/hari
                    </Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Book Details Modal */}
      <Modal
        visible={selectedBook !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBook(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBook && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>
                      {language === 'ar'
                        ? selectedBook.titleMalay
                        : selectedBook.title}
                    </Text>
                    <Text style={styles.modalArabic}>{selectedBook.titleArabic}</Text>
                    <View
                      style={[
                        styles.levelBadge,
                        { backgroundColor: getLevelColor(selectedBook.level) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.levelText,
                          { color: getLevelColor(selectedBook.level) },
                        ]}
                      >
                        {getLevelText(selectedBook.level)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedBook(null)}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.descSection}>
                    <Text style={styles.modalSectionTitle}>Penerangan:</Text>
                    <Text style={styles.modalDescription}>
                      {language === 'ar'
                        ? selectedBook.descriptionMalay
                        : selectedBook.description}
                    </Text>
                  </View>

                  <View style={styles.objectivesSection}>
                    <Text style={styles.modalSectionTitle}>Objektif Pembelajaran:</Text>
                    {(language === 'ar'
                      ? selectedBook.objectivesMalay
                      : selectedBook.objectives
                    ).map((objective, index) => (
                      <View key={index} style={styles.objectiveItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text style={styles.objectiveText}>{objective}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.practiceSection}>
                    <Text style={styles.modalSectionTitle}>Amalan Harian:</Text>
                    {(() => {
                      const practice = getDailyPractice(selectedBook.bookNumber);
                      return (
                        <View style={styles.practiceCard}>
                          <View style={styles.practiceRow}>
                            <Ionicons name="time-outline" size={24} color="#0dcaf0" />
                            <View style={styles.practiceInfo}>
                              <Text style={styles.practiceLabel}>Masa</Text>
                              <Text style={styles.practiceValue}>
                                {practice.duration} minit/hari
                              </Text>
                            </View>
                          </View>
                          <View style={styles.practiceRow}>
                            <Ionicons name="refresh-outline" size={24} color="#0dcaf0" />
                            <View style={styles.practiceInfo}>
                              <Text style={styles.practiceLabel}>Ulangan</Text>
                              <Text style={styles.practiceValue}>
                                {practice.repetitions} kali
                              </Text>
                            </View>
                          </View>
                          <View style={styles.practiceFocus}>
                            <Text style={styles.practiceFocusLabel}>Fokus:</Text>
                            <Text style={styles.practiceFocusText}>
                              {language === 'ar'
                                ? practice.focusMalay
                                : practice.focus}
                            </Text>
                          </View>
                        </View>
                      );
                    })()}
                  </View>

                  <View style={styles.lessonsSection}>
                    <Text style={styles.modalSectionTitle}>
                      Pelajaran ({selectedBook.totalLessons}):
                    </Text>
                    {getLessonsByBook(selectedBook.bookNumber).map((lesson) => (
                      <TouchableOpacity
                        key={lesson.id}
                        style={styles.lessonItem}
                        onPress={() => {
                          setSelectedBook(null);
                          handleLessonPress(lesson);
                        }}
                      >
                        <View style={styles.lessonNumber}>
                          <Text style={styles.lessonNumberText}>
                            {lesson.lessonNumber}
                          </Text>
                        </View>
                        <View style={styles.lessonInfo}>
                          <Text style={styles.lessonTitle}>
                            {language === 'ar'
                              ? lesson.titleMalay
                              : lesson.title}
                          </Text>
                          <Text style={styles.lessonArabic}>{lesson.titleArabic}</Text>
                        </View>
                        <Ionicons name="play-circle" size={24} color="#0dcaf0" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Lesson Details Modal */}
      <Modal
        visible={selectedLesson !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedLesson(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedLesson && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.lessonBadge}>
                      Iqra {selectedLesson.iqraBook} - Pelajaran {selectedLesson.lessonNumber}
                    </Text>
                    <Text style={styles.modalTitle}>
                      {language === 'ar'
                        ? selectedLesson.titleMalay
                        : selectedLesson.title}
                    </Text>
                    <Text style={styles.modalArabic}>{selectedLesson.titleArabic}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedLesson(null)}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.descSection}>
                    <Text style={styles.modalSectionTitle}>Penerangan:</Text>
                    <Text style={styles.modalDescription}>
                      {language === 'ar'
                        ? selectedLesson.descriptionMalay
                        : selectedLesson.description}
                    </Text>
                  </View>

                  <View style={styles.focusSection}>
                    <Text style={styles.modalSectionTitle}>Fokus Pelajaran:</Text>
                    <View style={styles.focusCard}>
                      <Ionicons name="eye" size={24} color="#0dcaf0" />
                      <Text style={styles.focusText}>
                        {language === 'ar'
                          ? selectedLesson.focusMalay
                          : selectedLesson.focus}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.examplesSection}>
                    <Text style={styles.modalSectionTitle}>Contoh Bacaan:</Text>
                    <View style={styles.examplesGrid}>
                      {selectedLesson.examples.map((example, index) => (
                        <View key={index} style={styles.exampleCard}>
                          <Text style={styles.exampleText}>{example}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.tipsSection}>
                    <Text style={styles.modalSectionTitle}>Tips:</Text>
                    <View style={styles.tipCard}>
                      <Ionicons name="bulb" size={20} color="#F59E0B" />
                      <Text style={styles.tipText}>
                        Ulang setiap contoh 5 kali dengan perlahan. Pastikan sebutan betul sebelum teruskan.
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.practiceButton}
                    onPress={startPractice}
                  >
                    <Ionicons name="play" size={20} color="#FFFFFF" />
                    <Text style={styles.practiceButtonText}>Mula Latihan</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Practice Mode Modal */}
      <Modal
        visible={practiceMode && selectedLesson !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPracticeMode(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.practiceModalContent}>
            {selectedLesson && (
              <>
                <View style={styles.practiceHeader}>
                  <View style={styles.practiceTitleContainer}>
                    <Text style={styles.practiceTitle}>
                      Latihan: {selectedLesson.title}
                    </Text>
                    <Text style={styles.practiceSubtitle}>
                      Contoh {currentExampleIndex + 1} dari {selectedLesson.examples.length}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setPracticeMode(false)}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.practiceBody}>
                  <View style={styles.exampleDisplay}>
                    <Text style={styles.exampleDisplayText}>
                      {selectedLesson.examples[currentExampleIndex]}
                    </Text>
                  </View>

                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Baca contoh di atas:</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.textInput}
                        value={userInput}
                        onChangeText={setUserInput}
                        placeholder="Tulis di sini..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlign="right"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.voiceButton}
                        onPressIn={handleVoiceInput}
                        onPressOut={stopVoiceInput}
                      >
                        <Ionicons
                          name={isRecording ? "mic" : "mic-outline"}
                          size={24}
                          color={isRecording ? "#EF4444" : "#9CA3AF"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {answerResult && (
                    <View style={[
                      styles.resultContainer,
                      answerResult.correct ? styles.resultCorrect : styles.resultIncorrect
                    ]}>
                      <Ionicons
                        name={answerResult.correct ? "checkmark-circle" : "close-circle"}
                        size={20}
                        color={answerResult.correct ? "#10B981" : "#EF4444"}
                      />
                      <Text style={[
                        styles.resultText,
                        answerResult.correct ? styles.resultTextCorrect : styles.resultTextIncorrect
                      ]}>
                        {answerResult.message}
                      </Text>
                    </View>
                  )}

                  <View style={styles.practiceActions}>
                    <TouchableOpacity
                      style={[
                        styles.checkButton,
                        (!userInput.trim() || isCheckingAnswer) && styles.checkButtonDisabled
                      ]}
                      onPress={checkAnswer}
                      disabled={!userInput.trim() || isCheckingAnswer}
                    >
                      {isCheckingAnswer ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                          <Text style={styles.checkButtonText}>Periksa</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {answerResult?.correct && (
                      <TouchableOpacity
                        style={styles.nextButton}
                        onPress={nextExample}
                      >
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        <Text style={styles.nextButtonText}>Seterusnya</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Progress Modal */}
      <Modal
        visible={showProgressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProgressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.progressModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kemajuan Pembelajaran</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowProgressModal(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.progressBody}>
              {Object.entries(progress).map(([key, value]) => {
                const [book, lesson] = key.split('_').slice(1);
                return (
                  <View key={key} style={styles.progressItem}>
                    <View style={styles.progressInfo}>
                      <Text style={styles.progressText}>
                        Iqra {book} - Pelajaran {lesson}
                      </Text>
                      <Text style={styles.progressCount}>
                        {value} sesi latihan
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(value * 10, 100)}%` }
                        ]}
                      />
                    </View>
                  </View>
                );
              })}

              {Object.keys(progress).length === 0 && (
                <View style={styles.emptyProgress}>
                  <Ionicons name="trophy-outline" size={64} color="#374151" />
                  <Text style={styles.emptyProgressTitle}>Belum ada kemajuan</Text>
                  <Text style={styles.emptyProgressText}>
                    Mulakan latihan untuk menjejaki kemajuan anda
                  </Text>
                </View>
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
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
  },
  introCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#0dcaf0',
  },
  introIcon: {
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  introText: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  introStats: {
    flexDirection: 'row',
    gap: 20,
  },
  introStat: {
    alignItems: 'center',
  },
  introStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0dcaf0',
  },
  introStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#0dcaf0',
  },
  bookNumber: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0dcaf0',
  },
  bookNumberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0dcaf0',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
  },
  bookTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bookArabic: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  bookDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  bookStats: {
    flexDirection: 'row',
    gap: 16,
  },
  bookStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookStatText: {
    fontSize: 12,
    color: '#6B7280',
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
    maxHeight: '90%',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalArabic: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  lessonBadge: {
    fontSize: 12,
    color: '#0dcaf0',
    marginBottom: 8,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  descSection: {
    marginBottom: 24,
  },
  modalDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  objectivesSection: {
    marginBottom: 24,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  practiceSection: {
    marginBottom: 24,
  },
  practiceCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0dcaf0',
  },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  practiceInfo: {
    flex: 1,
  },
  practiceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  practiceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  practiceFocus: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  practiceFocusLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  practiceFocusText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  lessonsSection: {
    marginBottom: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0dcaf0',
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0dcaf0',
  },
  lessonNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0dcaf0',
  },
  lessonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  lessonArabic: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  focusSection: {
    marginBottom: 24,
  },
  focusCard: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#0dcaf0',
  },
  focusText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  examplesSection: {
    marginBottom: 24,
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exampleCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  exampleText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  tipsSection: {
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  practiceButton: {
    flexDirection: 'row',
    backgroundColor: '#0dcaf0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  practiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  practiceModalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  practiceTitleContainer: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  practiceSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  practiceBody: {
    padding: 20,
    alignItems: 'center',
  },
  exampleDisplay: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0dcaf0',
  },
  exampleDisplayText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  inputSection: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'right',
    fontFamily: 'System',
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    gap: 12,
  },
  resultCorrect: {
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  resultIncorrect: {
    backgroundColor: '#7F1D1D',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  resultText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  resultTextCorrect: {
    color: '#10B981',
  },
  resultTextIncorrect: {
    color: '#EF4444',
  },
  practiceActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  checkButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0dcaf0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkButtonDisabled: {
    backgroundColor: '#374151',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressModalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  progressBody: {
    padding: 20,
  },
  progressItem: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressCount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0dcaf0',
    borderRadius: 4,
  },
  emptyProgress: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyProgressText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
