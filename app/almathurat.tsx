import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getMorningAlMathurat,
  getEveningAlMathurat,
  getAlMathuratStatistics,
  getRecommendedTime,
  type AlMathuratTime,
  type AlMathuratItem,
} from '../services/almathuratService';

const { width } = Dimensions.get('window');

export default function AlMathuratScreen() {
  const [selectedTime, setSelectedTime] = useState<AlMathuratTime>(getRecommendedTime());
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const currentSection = selectedTime === 'morning' 
    ? getMorningAlMathurat() 
    : getEveningAlMathurat();
  
  const stats = getAlMathuratStatistics(selectedTime);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wirid':
        return 'book-outline';
      case 'doa':
        return 'hand-left-outline';
      case 'zikir':
        return 'repeat-outline';
      case 'istighfar':
        return 'heart-outline';
      default:
        return 'star-outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'wirid':
        return '#4CAF50';
      case 'doa':
        return '#2196F3';
      case 'zikir':
        return '#FF9800';
      case 'istighfar':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  const toggleItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const renderItem = (item: AlMathuratItem) => {
    const isExpanded = expandedItem === item.id;
    const categoryColor = getCategoryColor(item.category);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.itemCard}
        onPress={() => toggleItem(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleRow}>
            <Ionicons
              name={getCategoryIcon(item.category) as any}
              size={24}
              color={categoryColor}
            />
            <View style={styles.itemTitleContainer}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemCategory}>
                {item.category.toUpperCase()} • {item.repetition}x
              </Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#666"
          />
        </View>

        {isExpanded && (
          <View style={styles.itemContent}>
            {/* Arabic Text */}
            <View style={styles.arabicContainer}>
              <Text style={styles.arabicText}>{item.arabic}</Text>
            </View>

            {/* Translation */}
            <View style={styles.translationContainer}>
              <Text style={styles.translationLabel}>Terjemahan:</Text>
              <Text style={styles.translationText}>{item.translation.ms}</Text>
            </View>

            {/* Reference */}
            <View style={styles.referenceContainer}>
              <Ionicons name="bookmark-outline" size={16} color="#666" />
              <Text style={styles.referenceText}>{item.reference}</Text>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Ionicons name="star-outline" size={16} color="#FF9800" />
              <Text style={styles.benefitsText}>{item.benefits}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Al-Ma'thurat</Text>
        <Text style={styles.headerSubtitle}>
          Wirid, Doa, Zikir & Istighfar dari Al-Quran
        </Text>
      </LinearGradient>

      {/* Time Selector */}
      <View style={styles.timeSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.timeButton,
            selectedTime === 'morning' && styles.timeButtonActive,
          ]}
          onPress={() => setSelectedTime('morning')}
        >
          <Ionicons
            name="sunny-outline"
            size={24}
            color={selectedTime === 'morning' ? '#FFF' : '#666'}
          />
          <Text
            style={[
              styles.timeButtonText,
              selectedTime === 'morning' && styles.timeButtonTextActive,
            ]}
          >
            Pagi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.timeButton,
            selectedTime === 'evening' && styles.timeButtonActive,
          ]}
          onPress={() => setSelectedTime('evening')}
        >
          <Ionicons
            name="moon-outline"
            size={24}
            color={selectedTime === 'evening' ? '#FFF' : '#666'}
          />
          <Text
            style={[
              styles.timeButtonText,
              selectedTime === 'evening' && styles.timeButtonTextActive,
            ]}
          >
            Petang
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalItems}</Text>
          <Text style={styles.statLabel}>Bacaan</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalRepetitions}</Text>
          <Text style={styles.statLabel}>Ulangan</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>~{stats.estimatedMinutes}</Text>
          <Text style={styles.statLabel}>Minit</Text>
        </View>
      </View>

      {/* Category Summary */}
      <View style={styles.categorySummary}>
        <View style={styles.categoryItem}>
          <Ionicons name="book-outline" size={16} color="#4CAF50" />
          <Text style={styles.categoryText}>{stats.wirid} Wirid</Text>
        </View>
        <View style={styles.categoryItem}>
          <Ionicons name="hand-left-outline" size={16} color="#2196F3" />
          <Text style={styles.categoryText}>{stats.doa} Doa</Text>
        </View>
        <View style={styles.categoryItem}>
          <Ionicons name="repeat-outline" size={16} color="#FF9800" />
          <Text style={styles.categoryText}>{stats.zikir} Zikir</Text>
        </View>
        <View style={styles.categoryItem}>
          <Ionicons name="heart-outline" size={16} color="#9C27B0" />
          <Text style={styles.categoryText}>{stats.istighfar} Istighfar</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{currentSection.title}</Text>
        <Text style={styles.sectionDescription}>{currentSection.description}</Text>

        {currentSection.items.map(renderItem)}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bacaan ini diambil dari ayat-ayat Al-Quran yang suci
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  timeSelectorContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#FFF',
    gap: 8,
  },
  timeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  timeButtonTextActive: {
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 10,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categorySummary: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 10,
    flexWrap: 'wrap',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  itemTitleContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  itemContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  arabicContainer: {
    backgroundColor: '#FFF9F0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  arabicText: {
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'right',
    color: '#000',
  },
  translationContainer: {
    marginBottom: 15,
  },
  translationLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
    fontWeight: '600',
  },
  translationText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  referenceText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  benefitsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
  },
  benefitsText: {
    fontSize: 12,
    color: '#E65100',
    flex: 1,
  },
  footer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

