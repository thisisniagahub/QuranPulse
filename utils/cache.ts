/**
 * Unified Cache Service
 * Provides consistent caching interface for all data types
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  version?: number; // Cache version for invalidation
}

const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour
const CURRENT_CACHE_VERSION = 1;

/**
 * Set item in cache
 */
export async function cacheSet<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    version: options.version || CURRENT_CACHE_VERSION,
  };

  try {
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
}

/**
 * Get item from cache
 */
export async function cacheGet<T>(
  key: string,
  options: CacheOptions = {}
): Promise<T | null> {
  try {
    const item = await AsyncStorage.getItem(key);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);

    // Check version
    const expectedVersion = options.version || CURRENT_CACHE_VERSION;
    if (entry.version !== expectedVersion) {
      await cacheDelete(key);
      return null;
    }

    // Check TTL
    const ttl = options.ttl || DEFAULT_TTL;
    const age = Date.now() - entry.timestamp;
    if (age > ttl) {
      await cacheDelete(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
}

/**
 * Delete item from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
  }
}

/**
 * Clear all cache with optional prefix filter
 */
export async function cacheClear(prefix?: string): Promise<void> {
  try {
    if (prefix) {
      const keys = await AsyncStorage.getAllKeys();
      const keysToDelete = keys.filter(key => key.startsWith(prefix));
      await AsyncStorage.multiRemove(keysToDelete);
    } else {
      await AsyncStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get cached data or fetch if not available
 */
export async function cacheGetOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache
  const cached = await cacheGet<T>(key, options);
  if (cached !== null) {
    return cached;
  }

  // Fetch new data
  const data = await fetchFn();

  // Cache the result
  await cacheSet(key, data, options);

  return data;
}

/**
 * Check if cache entry exists and is valid
 */
export async function cacheHas(
  key: string,
  options: CacheOptions = {}
): Promise<boolean> {
  const data = await cacheGet(key, options);
  return data !== null;
}

/**
 * Get cache statistics
 */
export async function cacheStats(): Promise<{
  totalKeys: number;
  totalSize: number; // Approximate size in bytes
}> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const item = await AsyncStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    }

    return {
      totalKeys: keys.length,
      totalSize,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalKeys: 0, totalSize: 0 };
  }
}

/**
 * Invalidate cache by version bump
 */
export async function cacheInvalidateAll(): Promise<void> {
  // This would require incrementing a global cache version
  // For now, just clear all cache
  await cacheClear();
}

/**
 * Create namespaced cache functions
 */
export function createNamespacedCache(namespace: string) {
  const prefixKey = (key: string) => `${namespace}:${key}`;

  return {
    set: <T>(key: string, data: T, options?: CacheOptions) =>
      cacheSet(prefixKey(key), data, options),
    
    get: <T>(key: string, options?: CacheOptions) =>
      cacheGet<T>(prefixKey(key), options),
    
    delete: (key: string) =>
      cacheDelete(prefixKey(key)),
    
    clear: () =>
      cacheClear(namespace),
    
    getOrFetch: <T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions) =>
      cacheGetOrFetch(prefixKey(key), fetchFn, options),
    
    has: (key: string, options?: CacheOptions) =>
      cacheHas(prefixKey(key), options),
  };
}

// Export namespaced caches for different features
export const quranCache = createNamespacedCache('quran');
export const prayerCache = createNamespacedCache('prayer');
export const hadithCache = createNamespacedCache('hadith');
export const userCache = createNamespacedCache('user');
