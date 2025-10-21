import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  TextInput,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as hadithApi from '../../services/hadithApi';

interface HadithBook {
  id: string;
  name: string;
  nameArabic: string;
  total: number;
}

interface Hadith {
  number: string;
  arab: string;
  malay: string;
}

export default function HadithScreen() {
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchingBook, setSearchingBook] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [favoriteHadiths, setFavoriteHadiths] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    fetchBooks();
    loadFavoriteHadiths();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Use real API
      try {
        // Try to get real collections from API
        const collections = await hadithApi.getCollections();

        // Transform API response to match our interface
        const transformedBooks = collections.map((collection, index) => ({
          id: collection.id,
          name: collection.name,
          nameArabic: collection.nameArabic || collection.name,
          total: collection.totalHadith || 0,
        }));

        setBooks(transformedBooks);
      } catch (apiError) {
        // If API fails, use fallback data
        console.log('API failed, using fallback data');
        setBooks([
          { id: '1', name: 'Sahih Bukhari', nameArabic: 'صحيح البخاري', total: 7563 },
          { id: '2', name: 'Sahih Muslim', nameArabic: 'صحيح مسلم', total: 7563 },
          { id: '3', name: 'Sunan Abu Daud', nameArabic: 'سنن أبي داود', total: 5274 },
          { id: '4', name: 'Jami At-Tirmizi', nameArabic: 'جامع الترمذي', total: 3956 },
          { id: '5', name: 'Sunan An-Nasai', nameArabic: 'سنن النسائي', total: 5758 },
          { id: '6', name: 'Sunan Ibn Majah', nameArabic: 'سنن ابن ماجه', total: 4341 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching hadith books:', error);
      // Use fallback data on any error
      setBooks([
        { id: '1', name: 'Sahih Bukhari', nameArabic: 'صحيح البخاري', total: 7563 },
        { id: '2', name: 'Sahih Muslim', nameArabic: 'صحيح مسلم', total: 7563 },
        { id: '3', name: 'Sunan Abu Daud', nameArabic: 'سنن أبي داود', total: 5274 },
        { id: '4', name: 'Jami At-Tirmizi', nameArabic: 'جامع الترمذي', total: 3956 },
        { id: '5', name: 'Sunan An-Nasai', nameArabic: 'سنن النسائي', total: 5758 },
        { id: '6', name: 'Sunan Ibn Majah', nameArabic: 'سنن ابن ماجه', total: 4341 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteHadiths = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorite_hadiths');
      if (favorites) {
        setFavoriteHadiths(JSON.parse(favorites));
      }
    } catch (error) {
      console.error('Error loading favorite hadiths:', error);
    }
  };

  const toggleFavorite = async (hadith: Hadith) => {
    try {
      const hadithKey = `${selectedBook?.id}-${hadith.number}`;
      let newFavorites;

      if (favoriteHadiths.includes(hadithKey)) {
        newFavorites = favoriteHadiths.filter(id => id !== hadithKey);
      } else {
        newFavorites = [...favoriteHadiths, hadithKey];
      }

      setFavoriteHadiths(newFavorites);
      await AsyncStorage.setItem('favorite_hadiths', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const searchHadiths = async (query: string, bookId?: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await hadithApi.searchHadiths(query, bookId || '');

      // Transform to match our interface
      const transformedResults = results.map(h => ({
        number: h.hadithNumber.toString(),
        arab: h.arabicText,
        malay: h.englishText,
      }));

      setSearchResults(transformedResults);
    } catch (error) {
      console.error('Error searching hadiths:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.trim()) {
      searchHadiths(text, selectedBook?.id);
    } else {
      setSearchResults([]);
    }
  };

  const shareHadith = async (hadith: Hadith) => {
    try {
      await Share.share({
        message: `${hadith.arab}\n\n${hadith.malay}\n\n- Hadis #${hadith.number} (${selectedBook?.name})`,
      });
    } catch (error) {
      console.error('Error sharing hadith:', error);
    }
  };

  const fetchHadiths = async (bookId: string) => {
    try {
      setLoadingHadiths(true);
      // Fetch real hadiths from API (book 1)
      const realHadiths = await hadithApi.getHadithsByBook(bookId, 1);

      // Transform to match our interface
      const transformedHadiths = realHadiths.slice(0, 10).map(h => ({
        number: h.hadithNumber.toString(),
        arab: h.arabicText,
        malay: h.englishText, // Use English as fallback if Malay not available
      }));

      setHadiths(transformedHadiths);
    } catch (error) {
      console.error('Error fetching hadiths:', error);
      // Fallback to sample data on error
      const sampleHadiths = [
        {
          number: '1',
          arab: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
          malay: 'Sesungguhnya setiap amalan itu bergantung kepada niat, dan sesungguhnya setiap orang akan mendapat apa yang dia niatkan.',
        },
      ];
      setHadiths(sampleHadiths);
      alert('Failed to load Hadith. Showing offline data.');
    } finally {
      setLoadingHadiths(false);
    }
  };

  const handleBookSelect = (book: HadithBook) => {
    setSelectedBook(book);
    fetchHadiths(book.id);
  };

  const renderBookItem = ({ item }: { item: HadithBook }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => handleBookSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.bookIcon}>
        <Ionicons name="book" size={32} color="#10B981" />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookName}>{item.name}</Text>
        <Text style={styles.bookNameArabic}>{item.nameArabic}</Text>
        <Text style={styles.bookTotal}>{item.total} Hadis</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderHadithItem = ({ item, index }: { item: Hadith; index: number }) => {
    const hadithKey = selectedBook ? `${selectedBook.id}-${item.number}` : '';
    const isFavorite = favoriteHadiths.includes(hadithKey);

    return (
      <View style={styles.hadithCard}>
        <View style={styles.hadithHeader}>
          <View style={styles.hadithNumber}>
            <Text style={styles.hadithNumberText}>{item.number}</Text>
          </View>
          <Text style={styles.hadithLabel}>Hadis #{item.number}</Text>
          <View style={styles.hadithActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleFavorite(item)}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? "#EF4444" : "#9CA3AF"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => shareHadith(item)}
            >
              <Ionicons name="share-social-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.hadithArabic}>{item.arab}</Text>
        <View style={styles.divider} />
        <Text style={styles.hadithMalay}>{item.malay}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Memuatkan koleksi hadis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedBook) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedBook(null)}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{selectedBook.name}</Text>
            <Text style={styles.headerSubtitle}>{selectedBook.nameArabic}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {loadingHadiths ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Memuatkan hadis...</Text>
          </View>
        ) : (
          <FlatList
            data={hadiths}
            renderItem={renderHadithItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hadis</Text>
          <Text style={styles.headerSubtitle}>Koleksi Hadis Sahih</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowFavorites(!showFavorites)}
          >
            <Ionicons name="heart" size={20} color={showFavorites ? "#EF4444" : "#9CA3AF"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name="search" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.jakimBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.jakimText}>JAKIM</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari hadith..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Book selector for search */}
          <View style={styles.searchBookSelector}>
            <Text style={styles.searchBookLabel}>Cari dalam:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.searchBookOption,
                  !searchingBook && styles.searchBookOptionSelected
                ]}
                onPress={() => {
                  setSearchingBook('');
                  if (searchQuery) searchHadiths(searchQuery);
                }}
              >
                <Text style={[
                  styles.searchBookOptionText,
                  !searchingBook && styles.searchBookOptionTextSelected
                ]}>
                  Semua Buku
                </Text>
              </TouchableOpacity>

              {books.map(book => (
                <TouchableOpacity
                  key={book.id}
                  style={[
                    styles.searchBookOption,
                    searchingBook === book.id && styles.searchBookOptionSelected
                  ]}
                  onPress={() => {
                    setSearchingBook(book.id);
                    if (searchQuery) searchHadiths(searchQuery, book.id);
                  }}
                >
                  <Text style={[
                    styles.searchBookOptionText,
                    searchingBook === book.id && styles.searchBookOptionTextSelected
                  ]}>
                    {book.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {showFavorites ? (
        <View style={styles.favoritesContainer}>
          <Text style={styles.favoritesTitle}>Hadis Kegemaran</Text>
          {favoriteHadiths.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color="#374151" />
              <Text style={styles.emptyStateTitle}>Tiada Hadis Kegemaran</Text>
              <Text style={styles.emptyStateText}>
                Tandai hadis sebagai kegemaran untuk akses pantas
              </Text>
            </View>
          ) : (
            <Text style={styles.favoritesNote}>
              {favoriteHadiths.length} hadis ditandai sebagai kegemaran
            </Text>
          )}
        </View>
      ) : null}

      {isSearching ? (
        <View style={styles.searchResultsContainer}>
          <Text style={styles.searchResultsTitle}>
            Hasil carian untuk "{searchQuery}"
          </Text>
          {searchResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color="#374151" />
              <Text style={styles.emptyStateTitle}>Tiada Hasil</Text>
              <Text style={styles.emptyStateText}>
                Cuba cari dengan kata kunci yang berbeza
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {showFavorites ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart" size={64} color="#374151" />
          <Text style={styles.emptyStateTitle}>Hadis Kegemaran</Text>
          <Text style={styles.emptyStateText}>
            {favoriteHadiths.length} hadis ditandai sebagai kegemaran
          </Text>
        </View>
      ) : isSearching ? (
        searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderHadithItem}
            keyExtractor={(item, index) => `search-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#374151" />
            <Text style={styles.emptyStateTitle}>Tiada Hasil</Text>
            <Text style={styles.emptyStateText}>
              Cuba cari dengan kata kunci yang berbeza
            </Text>
          </View>
        )
      ) : (
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color="#374151" />
              <Text style={styles.emptyStateTitle}>Tiada Buku Hadis</Text>
              <Text style={styles.emptyStateText}>
                Pastikan sambungan internet anda stabil
              </Text>
            </View>
          }
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  jakimBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  jakimText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bookIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bookNameArabic: {
    fontSize: 16,
    color: '#10B981',
    marginBottom: 4,
  },
  bookTotal: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  hadithCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  hadithHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hadithNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hadithNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  hadithLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  hadithArabic: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'right',
    lineHeight: 36,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginBottom: 16,
  },
  hadithMalay: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hadithActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchContainer: {
    backgroundColor: '#1F2937',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
  },
  searchBookSelector: {
    marginTop: 12,
  },
  searchBookLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  searchBookOption: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  searchBookOptionSelected: {
    backgroundColor: '#10B981',
  },
  searchBookOptionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  searchBookOptionTextSelected: {
    color: '#FFFFFF',
  },
  searchResultsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  favoritesContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  favoritesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  favoritesNote: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
