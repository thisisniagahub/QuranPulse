/**
 * USTAZ AI - Central Spiritual Assistant
 * Comprehensive helper for entire app
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { sendMessage, GLMMessage } from '../../services/glmAiService';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function UstazAIScreen() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Enhanced system prompt for comprehensive assistance
  const USTAZ_SYSTEM_PROMPT = `Anda adalah Ustaz AI, pembantu rohani pintar yang komprehensif untuk aplikasi QuranPulse. Tugas anda:

1. SOALAN AL-QURAN:
   - Terangkan ayat dengan tafsir yang sahih
   - Bantu memahami konteks turun ayat
   - Cadangkan ayat berkaitan topik tertentu
   - Ajar cara baca dan makna setiap perkataan

2. SEMAKAN HADIS:
   - Verifikasi kesahihan hadis
   - Terangkan sanad dan perawi
   - Berikan rujukan dari kitab sahih
   - Jelaskan maksud dan pengajaran

3. PANDUAN SOLAT:
   - Terangkan rukun dan syarat solat
   - Bantu dengan niat dan bacaan
   - Jawab soalan tentang waktu solat
   - Ajar solat sunat dan khusyuk

4. PEMBELAJARAN JUZ:
   - Cadangkan jadual khatam 30 juz
   - Terangkan tema setiap juz
   - Bantu hafazan dengan tips
   - Track kemajuan bacaan

5. MODUL IQRA:
   - Ajar asas membaca Arab (Iqra 1-6)
   - Bantu sebutan huruf hijaiyah
   - Latihan bacaan dengan tajwid
   - Tips untuk pemula

6. NASIHAT HARIAN:
   - Beri motivasi Islamik
   - Cadangkan amalan harian
   - Zikir dan doa
   - Adab dan akhlak

Jawab dalam bahasa yang mudah difahami, dengan rujukan yang sahih. Jika tidak pasti, beritahu dengan jujur.`;

  // Suggested questions based on app features
  const suggestedQuestions = [
    {
      icon: 'book',
      question: t.ustazAi.askAboutQuran,
      example: 'Apakah maksud Surah Al-Fatiha ayat 5?',
    },
    {
      icon: 'document-text',
      question: t.ustazAi.askAboutHadith,
      example: 'Adakah hadis "Kebersihan adalah sebahagian daripada iman" sahih?',
    },
    {
      icon: 'time',
      question: t.ustazAi.askAboutPrayer,
      example: 'Apakah rukun solat yang wajib?',
    },
    {
      icon: 'albums',
      question: t.ustazAi.askAboutJuz,
      example: 'Bagaimana cara khatam 30 juz dalam sebulan?',
    },
    {
      icon: 'school',
      question: t.ustazAi.learnWithUstaz,
      example: 'Ajar saya cara baca huruf hijaiyah dengan betul',
    },
    {
      icon: 'bulb',
      question: t.ustazAi.dailyTips,
      example: 'Beri saya nasihat untuk hari ini',
    },
  ];

  // Send message to Ustaz AI
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Convert messages to GLM format
      const glmHistory: GLMMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send to GLM-4.6 AI with Ustaz system prompt
      const response = await sendMessage(
        userMessage.content,
        glmHistory,
        USTAZ_SYSTEM_PROMPT
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message to Ustaz AI:', error);
      Alert.alert(
        'Ralat',
        'Maaf, Ustaz AI tidak dapat membalas sekarang. Cuba lagi.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Quick question handler
  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  // Clear chat
  const handleClearChat = () => {
    Alert.alert(
      'Kosongkan Perbualan',
      'Adakah anda pasti mahu kosongkan semua mesej?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kosongkan',
          style: 'destructive',
          onPress: () => setMessages([]),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="school" size={28} color="#0dcaf0" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{t.ustazAi.title}</Text>
              <Text style={styles.headerSubtitle}>{t.ustazAi.subtitle}</Text>
            </View>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Messages or Welcome Screen */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            // Welcome Screen
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="school" size={64} color="#0dcaf0" />
              </View>
              <Text style={styles.welcomeTitle}>Assalamualaikum!</Text>
              <Text style={styles.welcomeText}>
                Saya Ustaz AI, pembantu rohani pintar anda. Tanya saya tentang:
              </Text>

              {/* Suggested Questions */}
              <View style={styles.suggestedContainer}>
                <Text style={styles.suggestedTitle}>{t.ustazAi.suggestedQuestions}</Text>
                {suggestedQuestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionCard}
                    onPress={() => handleQuickQuestion(item.example)}
                  >
                    <View style={styles.suggestionIcon}>
                      <Ionicons name={item.icon as any} size={24} color="#0dcaf0" />
                    </View>
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionTitle}>{item.question}</Text>
                      <Text style={styles.suggestionExample}>{item.example}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Features */}
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Saya Boleh Bantu:</Text>
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.featureText}>Terangkan ayat Al-Quran</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.featureText}>Semak kesahihan hadis</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.featureText}>Panduan solat lengkap</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.featureText}>Pembelajaran 30 Juz</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.featureText}>Modul Iqra 1-6</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.featureText}>Nasihat & motivasi harian</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            // Chat Messages
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                {message.role === 'assistant' && (
                  <View style={styles.assistantIcon}>
                    <Ionicons name="school" size={20} color="#0dcaf0" />
                  </View>
                )}
                <View
                  style={[
                    styles.messageContent,
                    message.role === 'user' ? styles.userContent : styles.assistantContent,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.role === 'user' ? styles.userText : styles.assistantText,
                    ]}
                  >
                    {message.content}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      message.role === 'user' ? styles.userTime : styles.assistantTime,
                    ]}
                  >
                    {message.timestamp.toLocaleTimeString('ms-MY', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color="#0dcaf0" />
                <Text style={styles.loadingText}>{t.ustazAi.thinking}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t.ustazAi.placeholder}
              placeholderTextColor="#6B7280"
              multiline
              maxLength={1000}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons
                name="send"
                size={24}
                color={inputText.trim() && !isLoading ? '#FFFFFF' : '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  clearButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  suggestedContainer: {
    width: '100%',
    marginBottom: 24,
  },
  suggestedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  suggestionExample: {
    fontSize: 13,
    color: '#6B7280',
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#D1D5DB',
    marginLeft: 12,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  assistantIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userContent: {
    backgroundColor: '#0dcaf0',
    borderBottomRightRadius: 4,
  },
  assistantContent: {
    backgroundColor: '#1F2937',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  assistantTime: {
    color: '#6B7280',
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    backgroundColor: '#111827',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1F2937',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0dcaf0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
});
