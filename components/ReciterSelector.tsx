/**
 * Reciter Selector Component
 * Allows users to choose from multiple Quran reciters
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RECITERS, getReciterById, DEFAULT_RECITER_ID } from '../constants/reciters';
import { useLanguage } from '../contexts/LanguageContext';
import type { Reciter } from '../types';

const SELECTED_RECITER_KEY = 'selected_reciter';
const FAVORITE_RECITERS_KEY = 'favorite_reciters';

interface ReciterSelectorProps {
  onReciterChange?: (reciter: Reciter) => void;
  showLabel?: boolean;
  compact?: boolean;
}

export function ReciterSelector({ 
  onReciterChange, 
  showLabel = true,
  compact = false 
}: ReciterSelectorProps) {
  const { t } = useLanguage();
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [favoriteReciters, setFavoriteReciters] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSelectedReciter();
    loadFavoriteReciters();
  }, []);

  const loadSelectedReciter = async () => {
    try {
      const stored = await AsyncStorage.getItem(SELECTED_RECITER_KEY);
      const reciterId = stored ? parseInt(stored) : DEFAULT_RECITER_ID;
      const reciter = getReciterById(reciterId);
      if (reciter) {
        setSelectedReciter(reciter);
        onReciterChange?.(reciter);
      }
    } catch (error) {
      console.error('Error loading selected reciter:', error);
      const defaultReciter = getReciterById(DEFAULT_RECITER_ID);
      if (defaultReciter) {
        setSelectedReciter(defaultReciter);
      }
    }
  };

  const loadFavoriteReciters = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITE_RECITERS_KEY);
      if (stored) {
        setFavoriteReciters(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorite reciters:', error);
    }
  };

  const selectReciter = async (reciter: Reciter) => {
    setSelectedReciter(reciter);
    setModalVisible(false);
    
    // Save selection
    await AsyncStorage.setItem(SELECTED_RECITER_KEY, reciter.id.toString());
    
    // Callback
    onReciterChange?.(reciter);
    
    // Add to recent/favorites if not already there
    if (!favoriteReciters.includes(reciter.id)) {
      const updated = [reciter.id, ...favoriteReciters].slice(0, 5);
      setFavoriteReciters(updated);
      await AsyncStorage.setItem(FAVORITE_RECITERS_KEY, JSON.stringify(updated));
    }
  };

  const toggleFavorite = async (reciterId: number) => {
    const updated = favoriteReciters.includes(reciterId)
      ? favoriteReciters.filter(id => id !== reciterId)
      : [...favoriteReciters, reciterId];
    
    setFavoriteReciters(updated);
    await AsyncStorage.setItem(FAVORITE_RECITERS_KEY, JSON.stringify(updated));
  };

  const filteredReciters = RECITERS.filter(reciter =>
    reciter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reciter.arabicName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group reciters
  const favoriteRecitersList = filteredReciters.filter(r => favoriteReciters.includes(r.id));
  const otherReciters = filteredReciters.filter(r => !favoriteReciters.includes(r.id));

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactSelector}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="mic" size={20} color="#0dcaf0" />
        <Text style={styles.compactText}>
          {selectedReciter?.name.split(' ')[0] || 'Select'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          {showLabel && (
            <Text style={styles.label}>{t('reciter') || 'Reciter'}</Text>
          )}
          <View style={styles.selectedInfo}>
            <Ionicons name="mic" size={24} color="#0dcaf0" />
            <View style={styles.reciterInfo}>
              <Text style={styles.reciterName}>
                {selectedReciter?.name || 'Select Reciter'}
              </Text>
              {selectedReciter?.arabicName && (
                <Text style={styles.reciterNameArabic}>
                  {selectedReciter.arabicName}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('selectReciter') || 'Choose Reciter'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder={t('searchReciter') || 'Search reciter...'}
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Reciters List */}
            <ScrollView style={styles.recitersList} showsVerticalScrollIndicator={false}>
              {/* Favorites Section */}
              {favoriteRecitersList.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>
                    {t('favorites') || 'Favorites'}
                  </Text>
                  {favoriteRecitersList.map(reciter => (
                    <ReciterItem
                      key={reciter.id}
                      reciter={reciter}
                      isSelected={selectedReciter?.id === reciter.id}
                      isFavorite={true}
                      onSelect={() => selectReciter(reciter)}
                      onToggleFavorite={() => toggleFavorite(reciter.id)}
                    />
                  ))}
                </>
              )}

              {/* All Reciters Section */}
              <Text style={styles.sectionTitle}>
                {favoriteRecitersList.length > 0 ? (t('allReciters') || 'All Reciters') : (t('selectReciter') || 'Select Reciter')}
              </Text>
              {otherReciters.map(reciter => (
                <ReciterItem
                  key={reciter.id}
                  reciter={reciter}
                  isSelected={selectedReciter?.id === reciter.id}
                  isFavorite={false}
                  onSelect={() => selectReciter(reciter)}
                  onToggleFavorite={() => toggleFavorite(reciter.id)}
                />
              ))}
            </ScrollView>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // Download reciter's audio
                  setModalVisible(false);
                }}
              >
                <Ionicons name="download" size={20} color="#0dcaf0" />
                <Text style={styles.actionText}>Download Audio</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // Play sample
                  setModalVisible(false);
                }}
              >
                <Ionicons name="play" size={20} color="#10B981" />
                <Text style={styles.actionText}>Play Sample</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Reciter Item Component
function ReciterItem({
  reciter,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  reciter: Reciter;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.reciterItem, isSelected && styles.reciterItemSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.reciterItemContent}>
        <View style={styles.reciterAvatar}>
          <Ionicons 
            name="mic" 
            size={24} 
            color={isSelected ? '#0dcaf0' : '#6B7280'} 
          />
        </View>
        
        <View style={styles.reciterDetails}>
          <Text style={[styles.reciterItemName, isSelected && styles.reciterItemNameSelected]}>
            {reciter.name}
          </Text>
          {reciter.arabicName && (
            <Text style={styles.reciterItemNameArabic}>
              {reciter.arabicName}
            </Text>
          )}
        </View>

        <View style={styles.reciterActions}>
          <TouchableOpacity
            onPress={onToggleFavorite}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavorite ? 'star' : 'star-outline'}
              size={20}
              color={isFavorite ? '#F59E0B' : '#6B7280'}
            />
          </TouchableOpacity>
          
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color="#0dcaf0" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  selector: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  selectorContent: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reciterInfo: {
    flex: 1,
  },
  reciterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reciterNameArabic: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  compactSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  compactText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  recitersList: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  reciterItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reciterItemSelected: {
    borderColor: '#0dcaf0',
    backgroundColor: 'rgba(13, 202, 240, 0.1)',
  },
  reciterItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reciterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reciterDetails: {
    flex: 1,
  },
  reciterItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reciterItemNameSelected: {
    color: '#0dcaf0',
  },
  reciterItemNameArabic: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  reciterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoriteButton: {
    padding: 4,
  },
  quickActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// Also need to import TextInput
import { TextInput } from 'react-native';
