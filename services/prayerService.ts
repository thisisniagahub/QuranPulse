import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PrayerTime, LocationData } from '../types';
import { getESolatPrayerTimes } from './esolatJakimApi';
import { createApiClient, executeWithRetry, createCircuitBreaker, ApiError } from '../utils/apiClient';
import { getValidatedEnv } from '../utils/env';

const config = getValidatedEnv();
const PRAYER_API_BASE = config.prayerApiBase;
const CACHE_KEY = 'prayer_times_cache';
const LOCATION_KEY = 'last_location';
const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours
const USE_ESOLAT_JAKIM = true; // Use official JAKIM E-Solat API

// Create API client and circuit breaker for Aladhan API
const prayerClient = createApiClient(PRAYER_API_BASE, { timeout: 8000 });
const prayerBreaker = createCircuitBreaker(3, 60000); // 3 failures, 60s reset

interface PrayerTimesCache {
  data: PrayerTime;
  timestamp: number;
  location: LocationData;
}

/**
 * Get user's current location
 */
export async function getCurrentLocation(): Promise<LocationData> {
  try {
    // Check for cached location first
    const cachedLocation = await AsyncStorage.getItem(LOCATION_KEY);
    if (cachedLocation) {
      const parsed: LocationData = JSON.parse(cachedLocation);
      // Use cached if less than 1 hour old
      if (Date.now() - (parsed as any).timestamp < 3600000) {
        return parsed;
      }
    }

    // Request permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // Get current position
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Reverse geocode to get city/country
    const [address] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      city: address?.city || address?.subregion || 'Unknown',
      country: address?.country || 'Unknown',
      timezone: address?.timezone || undefined,
    };

    // Cache location
    await AsyncStorage.setItem(
      LOCATION_KEY,
      JSON.stringify({ ...locationData, timestamp: Date.now() })
    );

    return locationData;
  } catch (error) {
    console.error('Error getting location:', error);
    throw new Error('Failed to get location. Please enable location services.');
  }
}

/**
 * Fetch prayer times for current location
 * @param location - User location (optional, will fetch if not provided)
 * @param method - Calculation method (default: 2 for ISNA)
 * @param jakimZone - JAKIM zone code (e.g., 'WLY01' for KL)
 * @returns Prayer times for today
 */
export async function getPrayerTimes(
  location?: LocationData,
  method: number = 2,
  jakimZone?: string
): Promise<PrayerTime> {
  try {
    // Get location if not provided
    const userLocation = location || await getCurrentLocation();

    // Check cache
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache: PrayerTimesCache = JSON.parse(cached);
      const isSameLocation = 
        Math.abs(parsedCache.location.latitude - userLocation.latitude) < 0.01 &&
        Math.abs(parsedCache.location.longitude - userLocation.longitude) < 0.01;
      
      if (isSameLocation && Date.now() - parsedCache.timestamp < CACHE_DURATION) {
        return parsedCache.data;
      }
    }

    // TRY E-SOLAT JAKIM FIRST (Official Malaysia source)
    if (USE_ESOLAT_JAKIM && jakimZone) {
      try {
        console.log('Fetching from E-Solat JAKIM (Official)...');
        const esolatTimes = await getESolatPrayerTimes(jakimZone);
        
        // Cache the result
        const cacheData: PrayerTimesCache = {
          data: esolatTimes,
          timestamp: Date.now(),
          location: userLocation,
        };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        return esolatTimes;
      } catch (esolatError) {
        console.warn('E-Solat JAKIM failed, falling back to Aladhan:', esolatError);
        // Continue to Aladhan fallback
      }
    }

    // FALLBACK: Fetch from Aladhan API with circuit breaker
    console.log('Using Aladhan API (Fallback)...');
    const response = await prayerBreaker.execute(() =>
      executeWithRetry(
        () => prayerClient.get('/timings', {
          params: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            method: method,
          },
        }),
        { maxRetries: 2, retryDelay: 1000 }
      )
    );

    if (response.data.code !== 200) {
      throw new Error('Failed to fetch prayer times');
    }

    const timings = response.data.data.timings;
    const date = response.data.data.date;

    const prayerTimes: PrayerTime = {
      Fajr: timings.Fajr,
      Dhuhr: timings.Dhuhr,
      Asr: timings.Asr,
      Maghrib: timings.Maghrib,
      Isha: timings.Isha,
      Sunrise: timings.Sunrise,
      Imsak: timings.Imsak,
      Midnight: timings.Midnight,
    };

    // Cache the result
    const cacheData: PrayerTimesCache = {
      data: prayerTimes,
      timestamp: Date.now(),
      location: userLocation,
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    return prayerTimes;
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error fetching prayer times:', apiError.userMessage);
    
    // Check if circuit breaker is open
    if (apiError.code === 'CIRCUIT_OPEN') {
      throw new Error('Prayer times service is temporarily unavailable. Please try again in a few moments.');
    }
    
    throw new Error(apiError.userMessage || 'Failed to fetch prayer times. Please check your internet connection.');
  }
}

/**
 * Get next prayer name and time
 * @param prayerTimes - Today's prayer times
 * @returns Next prayer info
 */
export function getNextPrayer(prayerTimes: PrayerTime): { name: string; time: string; timeUntil: string } | null {
  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Fajr', time: prayerTimes.Fajr },
      { name: 'Sunrise', time: prayerTimes.Sunrise || '' },
      { name: 'Dhuhr', time: prayerTimes.Dhuhr },
      { name: 'Asr', time: prayerTimes.Asr },
      { name: 'Maghrib', time: prayerTimes.Maghrib },
      { name: 'Isha', time: prayerTimes.Isha },
    ].filter(p => p.time); // Filter out empty times

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        const minutesUntil = prayerMinutes - currentMinutes;
        const hoursUntil = Math.floor(minutesUntil / 60);
        const minsUntil = minutesUntil % 60;
        
        const timeUntil = hoursUntil > 0 
          ? `${hoursUntil}h ${minsUntil}m`
          : `${minsUntil}m`;

        return {
          name: prayer.name,
          time: prayer.time,
          timeUntil,
        };
      }
    }

    // If all prayers have passed, next is Fajr tomorrow
    return {
      name: 'Fajr',
      time: prayerTimes.Fajr,
      timeUntil: 'Tomorrow',
    };
  } catch (error) {
    console.error('Error getting next prayer:', error);
    return null;
  }
}

/**
 * Format time to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (HH:mm)
 * @returns Time in 12-hour format
 */
export function formatTime12Hour(time24: string): string {
  try {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    return time24;
  }
}

/**
 * Check if it's time for a specific prayer (with offset)
 * @param prayerTime - Prayer time string (HH:mm)
 * @param offsetMinutes - Minutes before prayer to notify
 * @returns True if it's time for prayer notification
 */
export function isPrayerTime(prayerTime: string, offsetMinutes: number = 0): boolean {
  try {
    const now = new Date();
    const [hours, minutes] = prayerTime.split(':').map(Number);
    
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes - offsetMinutes, 0, 0);
    
    // Check if current time matches prayer time (within 1 minute)
    const diff = Math.abs(now.getTime() - prayerDate.getTime());
    return diff < 60000; // Less than 1 minute
  } catch (error) {
    return false;
  }
}

/**
 * Get Hijri date for today
 * @returns Hijri date string
 */
export async function getHijriDate(): Promise<string> {
  try {
    const response = await executeWithRetry(
      () => prayerClient.get('/currentDate', {
        params: {
          zone: 'Asia/Kuala_Lumpur',
        },
      })
    );

    if (response.data.code === 200) {
      const hijri = response.data.data.hijri;
      return `${hijri.day} ${hijri.month.en} ${hijri.year} H`;
    }

    throw new Error('Failed to fetch Hijri date');
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error fetching Hijri date:', apiError.userMessage);
    return '';
  }
}

/**
 * Clear prayer times cache
 */
export async function clearPrayerTimesCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    await AsyncStorage.removeItem(LOCATION_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
