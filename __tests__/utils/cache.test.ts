/**
 * Cache Service Tests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cacheSet,
  cacheGet,
  cacheDelete,
  cacheClear,
  cacheGetOrFetch,
  cacheHas,
  createNamespacedCache,
} from '../../utils/cache';

describe('Cache Service', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  describe('cacheSet and cacheGet', () => {
    it('should store and retrieve data', async () => {
      const testData = { message: 'Hello, World!' };
      await cacheSet('test-key', testData);

      const retrieved = await cacheGet<typeof testData>('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent key', async () => {
      const result = await cacheGet('non-existent');
      expect(result).toBeNull();
    });

    it('should expire data after TTL', async () => {
      const testData = { value: 123 };
      await cacheSet('test-key', testData, { ttl: 100 }); // 100ms TTL

      // Should exist immediately
      const immediate = await cacheGet('test-key');
      expect(immediate).toEqual(testData);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be expired
      const expired = await cacheGet('test-key', { ttl: 100 });
      expect(expired).toBeNull();
    });

    it('should invalidate data on version mismatch', async () => {
      const testData = { value: 'test' };
      await cacheSet('test-key', testData, { version: 1 });

      // Get with different version
      const result = await cacheGet('test-key', { version: 2 });
      expect(result).toBeNull();
    });
  });

  describe('cacheDelete', () => {
    it('should delete cached data', async () => {
      await cacheSet('test-key', { data: 'test' });
      
      const before = await cacheGet('test-key');
      expect(before).not.toBeNull();

      await cacheDelete('test-key');

      const after = await cacheGet('test-key');
      expect(after).toBeNull();
    });
  });

  describe('cacheClear', () => {
    it('should clear all cache', async () => {
      await cacheSet('key1', { data: 'test1' });
      await cacheSet('key2', { data: 'test2' });

      await cacheClear();

      const result1 = await cacheGet('key1');
      const result2 = await cacheGet('key2');
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should clear cache with prefix', async () => {
      await cacheSet('quran:surah1', { data: 'surah1' });
      await cacheSet('prayer:times', { data: 'times' });

      await cacheClear('quran:');

      const quranResult = await cacheGet('quran:surah1');
      const prayerResult = await cacheGet('prayer:times');
      
      expect(quranResult).toBeNull();
      expect(prayerResult).not.toBeNull();
    });
  });

  describe('cacheGetOrFetch', () => {
    it('should return cached data if available', async () => {
      const testData = { value: 'cached' };
      await cacheSet('test-key', testData);

      const fetchFn = jest.fn();
      const result = await cacheGetOrFetch('test-key', fetchFn);

      expect(result).toEqual(testData);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if not available', async () => {
      const newData = { value: 'fetched' };
      const fetchFn = jest.fn().mockResolvedValue(newData);

      const result = await cacheGetOrFetch('test-key', fetchFn);

      expect(result).toEqual(newData);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Verify it was cached
      const cached = await cacheGet('test-key');
      expect(cached).toEqual(newData);
    });
  });

  describe('cacheHas', () => {
    it('should return true for existing valid cache', async () => {
      await cacheSet('test-key', { data: 'test' });
      const exists = await cacheHas('test-key');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent cache', async () => {
      const exists = await cacheHas('non-existent');
      expect(exists).toBe(false);
    });

    it('should return false for expired cache', async () => {
      await cacheSet('test-key', { data: 'test' }, { ttl: 100 });
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const exists = await cacheHas('test-key', { ttl: 100 });
      expect(exists).toBe(false);
    });
  });

  describe('createNamespacedCache', () => {
    it('should create namespaced cache functions', async () => {
      const quranCache = createNamespacedCache('quran');
      
      await quranCache.set('surah1', { name: 'Al-Fatihah' });
      const result = await quranCache.get<{ name: string }>('surah1');
      
      expect(result).toEqual({ name: 'Al-Fatihah' });
    });

    it('should isolate namespaces', async () => {
      const quranCache = createNamespacedCache('quran');
      const prayerCache = createNamespacedCache('prayer');
      
      await quranCache.set('data', { type: 'quran' });
      await prayerCache.set('data', { type: 'prayer' });
      
      const quranData = await quranCache.get('data');
      const prayerData = await prayerCache.get('data');
      
      expect(quranData).toEqual({ type: 'quran' });
      expect(prayerData).toEqual({ type: 'prayer' });
    });

    it('should clear only namespaced cache', async () => {
      const quranCache = createNamespacedCache('quran');
      const prayerCache = createNamespacedCache('prayer');
      
      await quranCache.set('data', { type: 'quran' });
      await prayerCache.set('data', { type: 'prayer' });
      
      await quranCache.clear();
      
      const quranData = await quranCache.get('data');
      const prayerData = await prayerCache.get('data');
      
      expect(quranData).toBeNull();
      expect(prayerData).not.toBeNull();
    });
  });
});
