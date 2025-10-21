/**
 * Advanced Search Screen
 * Search Quran verses, Hadith, Tafsir, and Notes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { searchVerses, searchTafsir, getTafsir } from '../services/quranApi';
import { searchHadiths } from '../services/hadithApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';

type SearchTab = 'quran' | 'hadith' | 'tafsir' | 'notes';

interface SearchResult {
  id: string;
  type: 'quran' | 'hadith' | 'tafsir' | 'note';
  title: string;
  subtitle: string;
  arabicText?: string;
  translationText?: string;
  reference: string;
  surahNumber?: number;
  ayahNumber?: number;
}

export default function SearchScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<SearchTab>('quran');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    surahRange: { from: 1, to: 114 },
    juzRange: { from: 1, to: 30 },
    hadithCollections: ['bukhari', 'muslim'],
    includeTafsir: true,
    includeTranslation: true,
    exactMatch: false,
  });

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const recent = await AsyncStorage.getItem('recent_searches');
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (query: string, tab: string = 'quran') => {
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
      setRecentSearches(updated);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(updated));

      // Also save to Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('search_history').insert({
          user_id: user.id,
          query: query,
          search_type: tab,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem('recent_searches');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      await saveRecentSearch(searchQuery);

      if (activeTab === 'quran') {
        // Search Quran verses
        const verses = await searchVerses(searchQuery);
        const formattedResults: SearchResult[] = verses.map((verse: any) => ({
          id: `${verse.surah}:${verse.ayah}`,
          type: 'quran',
          title: `Surah ${verse.surahName} (${verse.surah}:${verse.ayah})`,
          subtitle: verse.translation,
          arabicText: verse.text,
          translationText: verse.translation,
          reference: `${verse.surah}:${verse.ayah}`,
          surahNumber: verse.surah,
          ayahNumber: verse.ayah,
        }));
        setResults(formattedResults);
      } else if (activeTab === 'hadith') {
        // Advanced Hadith search with multiple collections
        setLoading(true);
        try {
          const hadithResults = await searchHadiths(searchQuery, '');
          const formattedResults: SearchResult[] = hadithResults.map((hadith: any) => ({
            id: `hadith_${hadith.id || hadith.hadithNumber}`,
            type: 'hadith',
            title: `${hadith.book || 'Hadith'} #${hadith.hadithNumber}`,
            subtitle: hadith.collection || 'Hadith Collection',
            arabicText: hadith.arabicText,
            translationText: hadith.englishText,
            reference: `${hadith.book || 'Hadith'} ${hadith.hadithNumber}`,
          }));
          setResults(formattedResults);

          // Cache recent search
          await saveRecentSearch(searchQuery, 'hadith');
        } catch (error) {
          console.error('Hadith search error:', error);
          setResults([]);
        }
      } else if (activeTab === 'tafsir') {
        // Enhanced Tafsir search - search all verses with tafsir
        setLoading(true);
        try {
          const tafsirResults = await searchTafsir(searchQuery);
          const formattedResults: SearchResult[] = tafsirResults.map((item: any) => ({
            id: `tafsir_${item.surah}_${item.ayah}`,
            type: 'tafsir',
            title: `${item.surahName} ${item.surah}:${item.ayah}`,
            subtitle: 'Tafsir Ibn Kathir',
            arabicText: item.arabicText,
            translationText: item.tafsir.substring(0, 300) + '...',
            reference: `${item.surah}:${item.ayah}`,
          }));
          setResults(formattedResults);

          // Cache recent search
          await saveRecentSearch(searchQuery, 'tafsir');
        } catch (error) {
          console.error('Tafsir search error:', error);
          // Fallback to basic search
          const formattedResults = [];

          // Search through available surahs
          for (let i = 1; i <= 114; i++) {
            try {
              const tafsir = await getTafsir(i.toString());
              if (tafsir && tafsir.toLowerCase().includes(searchQuery.toLowerCase())) {
                formattedResults.push({
                  id: `tafsir_${i}_1`,
                  type: 'tafsir',
                  title: `Surah ${i}, Ayah 1`,
                  subtitle: 'Tafsir',
                  translationText: tafsir.substring(0, 300) + '...',
                  reference: `${i}:1`,
                });

                // Limit results for performance
                if (formattedResults.length >= 20) break;
              }
            } catch (error) {
              // Skip if tafsir not available for this surah
            }
          }
          setResults(formattedResults as SearchResult[]);
        }
      } else if (activeTab === 'notes') {
        // Enhanced Notes search with Supabase sync
        setLoading(true);
        try {
          // First try to get from Supabase if user is logged in
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            const { data: notes, error } = await supabase
              .from('user_notes')
              .select('*')
              .eq('user_id', user.id)
              .or(`content.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`)
              .order('created_at', { ascending: false });

            if (!error && notes) {
              const formattedResults: SearchResult[] = notes.map((note: any) => ({
                id: note.id,
                type: 'note',
                title: note.title || `Note on ${note.surah_name} ${note.surah}:${note.ayah}`,
                subtitle: new Date(note.created_at).toLocaleDateString(),
                translationText: note.content,
                reference: `${note.surah}:${note.ayah}`,
              }));
              setResults(formattedResults);
            }
          } else {
            // Fallback to local storage
            const savedNotes = await AsyncStorage.getItem('userNotes');
            if (savedNotes) {
              const notes = JSON.parse(savedNotes);
              const filteredNotes = notes.filter((note: any) =>
                note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
              );
              const formattedResults: SearchResult[] = filteredNotes.map((note: any) => ({
                id: note.id,
                type: 'note',
                title: note.title || 'Personal Note',
                subtitle: new Date(note.createdAt).toLocaleDateString(),
                translationText: note.content,
                reference: 'Personal Note',
              }));
              setResults(formattedResults);
            } else {
              setResults([]);
            }
          }

          // Cache recent search
          await saveRecentSearch(searchQuery, 'notes');
        } catch (error) {
          console.error('Notes search error:', error);
          setResults([]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Apply filters to current search
    performSearch();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      surahRange: { from: 1, to: 114 },
      juzRange: { from: 1, to: 30 },
      hadithCollections: ['bukhari', 'muslim'],
      includeTafsir: true,
      includeTranslation: true,
      exactMatch: false,
    });
  };

  const saveSearch = async (query: string) => {
    try {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
      setRecentSearches(updated);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(updated));

      // Save to Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('saved_searches').insert({
          user_id: user.id,
          query: query,
          filters: filters,
          search_type: activeTab,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const loadSavedSearches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: savedSearches } = await supabase
          .from('saved_searches')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (savedSearches) {
          return savedSearches;
        }
      }
      return [];
    } catch (error) {
      console.error('Error loading saved searches:', error);
      return [];
    }
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'quran' && result.surahNumber) {
      router.push(`/surah/${result.surahNumber}` as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Quran, Hadith, Tafsir, Notes..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={performSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={performSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'quran' && styles.tabActive]}
          onPress={() => setActiveTab('quran')}
        >
          <Ionicons
            name="book"
            size={20}
            color={activeTab === 'quran' ? '#10B981' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'quran' && styles.tabTextActive]}>
            {'Quran'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'hadith' && styles.tabActive]}
          onPress={() => setActiveTab('hadith')}
        >
          <Ionicons
            name="library"
            size={20}
            color={activeTab === 'hadith' ? '#10B981' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'hadith' && styles.tabTextActive]}>
            {'Hadith'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'tafsir' && styles.tabActive]}
          onPress={() => setActiveTab('tafsir')}
        >
          <Ionicons
            name="chatbox"
            size={20}
            color={activeTab === 'tafsir' ? '#10B981' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'tafsir' && styles.tabTextActive]}>
            {'Tafsir'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
          onPress={() => setActiveTab('notes')}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={activeTab === 'notes' ? '#10B981' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
            {'Notes'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Search Filters</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'quran' && (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Surah Range:</Text>
              <View style={styles.rangeRow}>
                <TextInput
                  style={styles.rangeInput}
                  value={filters.surahRange.from.toString()}
                  onChangeText={(text) => setFilters({
                    ...filters,
                    surahRange: { ...filters.surahRange, from: parseInt(text) || 1 }
                  })}
                  keyboardType="numeric"
                  placeholder="From"
                />
                <Text style={styles.rangeTo}>to</Text>
                <TextInput
                  style={styles.rangeInput}
                  value={filters.surahRange.to.toString()}
                  onChangeText={(text) => setFilters({
                    ...filters,
                    surahRange: { ...filters.surahRange, to: parseInt(text) || 114 }
                  })}
                  keyboardType="numeric"
                  placeholder="To"
                />
              </View>

              <Text style={styles.filterLabel}>Juz Range:</Text>
              <View style={styles.rangeRow}>
                <TextInput
                  style={styles.rangeInput}
                  value={filters.juzRange.from.toString()}
                  onChangeText={(text) => setFilters({
                    ...filters,
                    juzRange: { ...filters.juzRange, from: parseInt(text) || 1 }
                  })}
                  keyboardType="numeric"
                  placeholder="From"
                />
                <Text style={styles.rangeTo}>to</Text>
                <TextInput
                  style={styles.rangeInput}
                  value={filters.juzRange.to.toString()}
                  onChangeText={(text) => setFilters({
                    ...filters,
                    juzRange: { ...filters.juzRange, to: parseInt(text) || 30 }
                  })}
                  keyboardType="numeric"
                  placeholder="To"
                />
              </View>

              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setFilters({
                    ...filters,
                    includeTafsir: !filters.includeTafsir
                  })}
                >
                  <Ionicons
                    name={filters.includeTafsir ? "checkbox" : "square-outline"}
                    size={20}
                    color={filters.includeTafsir ? "#10B981" : "#9CA3AF"}
                  />
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Include Tafsir</Text>
              </View>

              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setFilters({
                    ...filters,
                    includeTranslation: !filters.includeTranslation
                  })}
                >
                  <Ionicons
                    name={filters.includeTranslation ? "checkbox" : "square-outline"}
                    size={20}
                    color={filters.includeTranslation ? "#10B981" : "#9CA3AF"}
                  />
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Include Translation</Text>
              </View>

              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setFilters({
                    ...filters,
                    exactMatch: !filters.exactMatch
                  })}
                >
                  <Ionicons
                    name={filters.exactMatch ? "checkbox" : "square-outline"}
                    size={20}
                    color={filters.exactMatch ? "#10B981" : "#9CA3AF"}
                  />
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Exact Match</Text>
              </View>
            </View>
          )}

          {activeTab === 'hadith' && (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Collections:</Text>
              <View style={styles.collectionsGrid}>
                {['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah'].map((collection) => (
                  <TouchableOpacity
                    key={collection}
                    style={[
                      styles.collectionChip,
                      filters.hadithCollections.includes(collection) && styles.collectionChipSelected
                    ]}
                    onPress={() => {
                      const newCollections = filters.hadithCollections.includes(collection)
                        ? filters.hadithCollections.filter(c => c !== collection)
                        : [...filters.hadithCollections, collection];

                      setFilters({
                        ...filters,
                        hadithCollections: newCollections
                      });
                    }}
                  >
                    <Text style={[
                      styles.collectionChipText,
                      filters.hadithCollections.includes(collection) && styles.collectionChipTextSelected
                    ]}>
                      {collection.charAt(0).toUpperCase() + collection.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.applyFiltersButton} onPress={applyFilters}>
            <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : !searched ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentItem}
                    onPress={() => {
                      setSearchQuery(search);
                      performSearch();
                    }}
                  >
                    <Ionicons name="time-outline" size={20} color="#9CA3AF" />
                    <Text style={styles.recentText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quick Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Topics</Text>

              <View style={styles.quickSearches}>
                {['Faith', 'Prayer', 'Patience', 'Gratitude', 'Forgiveness', 'Love'].map(
                  (topic) => (
                    <TouchableOpacity
                      key={topic}
                      style={styles.quickSearchChip}
                      onPress={() => {
                        setSearchQuery(topic);
                        performSearch();
                      }}
                    >
                      <Text style={styles.quickSearchText}>{topic}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Tips */}
            <View style={styles.tipsCard}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb-outline" size={24} color="#F59E0B" />
                <Text style={styles.tipTitle}>Search Tips</Text>
              </View>

              <Text style={styles.tipText}>• Use Arabic terms for more accurate Quran results</Text>
              <Text style={styles.tipText}>• Try different spellings or variations of your search</Text>
              <Text style={styles.tipText}>• Use filters to narrow down your search results</Text>
            </View>
          </>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#6B7280" />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptySubtitle}>Try different keywords or adjust your filters</Text>
          </View>
        ) : (
          <View style={styles.results}>
            <Text style={styles.resultsCount}>
              {results.length} results found
            </Text>

            {results.map((result) => (
              <TouchableOpacity
                key={result.id}
                style={styles.resultItem}
                onPress={() => handleResultPress(result)}
              >
                <View style={styles.resultIcon}>
                  <Ionicons
                    name={
                      result.type === 'quran'
                        ? 'book'
                        : result.type === 'hadith'
                          ? 'library'
                          : result.type === 'tafsir'
                            ? 'chatbox'
                            : 'document-text'
                    }
                    size={24}
                    color="#10B981"
                  />
                </View>

                <View style={styles.resultContent}>
                  <Text style={styles.resultTitle}>{result.title}</Text>

                  {result.arabicText && (
                    <Text style={styles.resultArabic} numberOfLines={2}>
                      {result.arabicText}
                    </Text>
                  )}

                  <Text style={styles.resultTranslation} numberOfLines={3}>
                    {result.translationText || result.subtitle}
                  </Text>

                  <Text style={styles.resultReference}>{result.reference}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  searchButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  tabText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clearText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  quickSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSearchChip: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickSearchText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  tipsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    lineHeight: 20,
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
  results: {
    paddingBottom: 20,
  },
  resultsCount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  resultArabic: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'right',
    marginBottom: 8,
    lineHeight: 28,
  },
  resultTranslation: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultReference: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterButton: {
    padding: 8,
  },
  filtersPanel: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resetText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
  },
  rangeTo: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  collectionChip: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  collectionChipSelected: {
    backgroundColor: '#10B981',
  },
  collectionChipText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  collectionChipTextSelected: {
    color: '#FFFFFF',
  },
  applyFiltersButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
