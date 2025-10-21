/**
 * Motivation Screen
 * Islamic motivational quotes and reminders
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';

interface MotivationalQuote {
  id: string;
  category: 'verse' | 'hadith' | 'scholar' | 'dua';
  arabic?: string;
  english: string;
  malay: string;
  reference: string;
  icon: string;
  color: string;
}

const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    id: '1',
    category: 'verse',
    arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    english: 'Indeed, with hardship comes ease.',
    malay: 'Sesungguhnya bersama kesulitan ada kemudahan.',
    reference: 'Surah Ash-Sharh 94:6',
    icon: 'heart',
    color: '#EF4444',
  },
  {
    id: '2',
    category: 'verse',
    arabic: 'وَلَا تَيْأَسُوا مِن رَّوْحِ ٱللَّهِ',
    english: 'And do not despair of the mercy of Allah.',
    malay: 'Dan janganlah kamu berputus asa dari rahmat Allah.',
    reference: 'Surah Yusuf 12:87',
    icon: 'sunny',
    color: '#F59E0B',
  },
  {
    id: '3',
    category: 'hadith',
    english: 'The best among you are those who have the best manners and character.',
    malay: 'Sebaik-baik kamu adalah yang terbaik akhlaknya.',
    reference: 'Sahih Bukhari',
    icon: 'star',
    color: '#10B981',
  },
  {
    id: '4',
    category: 'verse',
    arabic: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    english: 'Verily, in the remembrance of Allah do hearts find rest.',
    malay: 'Ingatlah, dengan mengingati Allah hati menjadi tenang.',
    reference: 'Surah Ar-Ra\'d 13:28',
    icon: 'water',
    color: '#3B82F6',
  },
  {
    id: '5',
    category: 'hadith',
    english: 'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    malay: 'Barangsiapa beriman kepada Allah dan hari akhir, hendaklah berkata baik atau diam.',
    reference: 'Sahih Muslim',
    icon: 'chatbubbles',
    color: '#8B5CF6',
  },
  {
    id: '6',
    category: 'verse',
    arabic: 'وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا',
    english: 'And whoever fears Allah, He will make for him a way out.',
    malay: 'Barangsiapa bertakwa kepada Allah, niscaya Allah membukakan jalan keluar.',
    reference: 'Surah At-Talaq 65:2',
    icon: 'shield',
    color: '#06B6D4',
  },
  {
    id: '7',
    category: 'scholar',
    english: 'The heart is like a bird: love is its head, and fear and hope are its two wings.',
    malay: 'Hati ibarat burung: cinta adalah kepalanya, takut dan harapan adalah dua sayapnya.',
    reference: 'Imam Ibn Qayyim',
    icon: 'heart-circle',
    color: '#EC4899',
  },
  {
    id: '8',
    category: 'hadith',
    english: 'The strong person is not the one who can overpower others, but the one who controls himself when angry.',
    malay: 'Orang yang kuat bukanlah yang mengalahkan orang lain, tetapi yang mengawal dirinya ketika marah.',
    reference: 'Sahih Bukhari',
    icon: 'fitness',
    color: '#F97316',
  },
];

export default function MotivationScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dailyQuote, setDailyQuote] = useState<MotivationalQuote>(MOTIVATIONAL_QUOTES[0]);

  useEffect(() => {
    // Select daily quote based on date
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % MOTIVATIONAL_QUOTES.length;
    setDailyQuote(MOTIVATIONAL_QUOTES[index]);
  }, []);

  const filteredQuotes = selectedCategory === 'all'
    ? MOTIVATIONAL_QUOTES
    : MOTIVATIONAL_QUOTES.filter(q => q.category === selectedCategory);

  const handleShare = async (quote: MotivationalQuote) => {
    try {
      const text = language === 'ms'
        ? `${quote.arabic ? quote.arabic + '\n\n' : ''}${quote.malay}\n\n— ${quote.reference}\n\n#QuranPulse #IslamicMotivation`
        : `${quote.arabic ? quote.arabic + '\n\n' : ''}${quote.english}\n\n— ${quote.reference}\n\n#QuranPulse #IslamicMotivation`;
      
      await Share.share({
        message: text,
      });
    } catch (error) {
      console.error('Error sharing quote:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('motivation.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Quote Hero */}
        <View style={[styles.heroCard, { borderLeftColor: dailyQuote.color }]}>
          <View style={styles.heroHeader}>
            <View style={[styles.heroIcon, { backgroundColor: `${dailyQuote.color}20` }]}>
              <Ionicons name={dailyQuote.icon as any} size={32} color={dailyQuote.color} />
            </View>
            <View style={styles.heroHeaderText}>
              <Text style={styles.heroLabel}>{t('motivation.daily')}</Text>
              <Text style={styles.heroDate}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>

          {dailyQuote.arabic && (
            <Text style={styles.heroArabic}>{dailyQuote.arabic}</Text>
          )}

          <Text style={styles.heroText}>
            {language === 'ms' ? dailyQuote.malay : dailyQuote.english}
          </Text>

          <Text style={styles.heroReference}>{dailyQuote.reference}</Text>

          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: dailyQuote.color }]}
            onPress={() => handleShare(dailyQuote)}
          >
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>{t('motivation.share')}</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
              {t('motivation.all')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === 'verse' && styles.categoryChipActive]}
            onPress={() => setSelectedCategory('verse')}
          >
            <Ionicons name="book" size={16} color={selectedCategory === 'verse' ? '#10B981' : '#9CA3AF'} />
            <Text style={[styles.categoryText, selectedCategory === 'verse' && styles.categoryTextActive]}>
              {t('motivation.verses')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === 'hadith' && styles.categoryChipActive]}
            onPress={() => setSelectedCategory('hadith')}
          >
            <Ionicons name="library" size={16} color={selectedCategory === 'hadith' ? '#10B981' : '#9CA3AF'} />
            <Text style={[styles.categoryText, selectedCategory === 'hadith' && styles.categoryTextActive]}>
              {t('motivation.hadith')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === 'scholar' && styles.categoryChipActive]}
            onPress={() => setSelectedCategory('scholar')}
          >
            <Ionicons name="school" size={16} color={selectedCategory === 'scholar' ? '#10B981' : '#9CA3AF'} />
            <Text style={[styles.categoryText, selectedCategory === 'scholar' && styles.categoryTextActive]}>
              {t('motivation.scholars')}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Quotes Grid */}
        <View style={styles.quotesGrid}>
          {filteredQuotes.map((quote) => (
            <View key={quote.id} style={[styles.quoteCard, { borderLeftColor: quote.color }]}>
              <View style={[styles.quoteIcon, { backgroundColor: `${quote.color}20` }]}>
                <Ionicons name={quote.icon as any} size={24} color={quote.color} />
              </View>

              {quote.arabic && (
                <Text style={styles.quoteArabic}>{quote.arabic}</Text>
              )}

              <Text style={styles.quoteText}>
                {language === 'ms' ? quote.malay : quote.english}
              </Text>

              <Text style={styles.quoteReference}>{quote.reference}</Text>

              <TouchableOpacity
                style={styles.quoteShareButton}
                onPress={() => handleShare(quote)}
              >
                <Ionicons name="share-social-outline" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Reflection Section */}
        <View style={styles.reflectionCard}>
          <View style={styles.reflectionHeader}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <Text style={styles.reflectionTitle}>{t('motivation.reflection')}</Text>
          </View>
          
          <Text style={styles.reflectionText}>
            {t('motivation.reflectionMessage')}
          </Text>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  heroCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#374151',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroHeaderText: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  heroDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  heroArabic: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'right',
    marginBottom: 16,
    lineHeight: 40,
    fontWeight: '500',
  },
  heroText: {
    fontSize: 18,
    color: '#D1D5DB',
    lineHeight: 28,
    marginBottom: 16,
  },
  heroReference: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
    fontWeight: '500',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  categoryText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  quotesGrid: {
    gap: 16,
    marginBottom: 24,
  },
  quoteCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#374151',
  },
  quoteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteArabic: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'right',
    marginBottom: 12,
    lineHeight: 30,
  },
  quoteText: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 24,
    marginBottom: 12,
  },
  quoteReference: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
    fontWeight: '500',
  },
  quoteShareButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  reflectionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reflectionText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
  },
});
