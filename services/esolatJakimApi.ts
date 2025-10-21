/**
 * E-Solat JAKIM API Service
 * Official prayer times from Malaysian government
 * Source: https://www.e-solat.gov.my/
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PrayerTime } from '../types';

const E_SOLAT_API_BASE = 'https://www.e-solat.gov.my/index.php';
const CACHE_KEY = 'esolat_prayer_times';
const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours

interface ESolatResponse {
  prayerTime: string[];
  status: string;
  serverTime: string;
  periodType: string;
  lang: string;
  zone: string;
  bearing: string;
}

interface ESolatPrayerTime {
  hijri: string;
  date: string;
  imsak: string;
  fajr: string;
  syuruk: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  zone: string;
}

/**
 * Fetch prayer times from E-Solat JAKIM
 * @param zone - JAKIM zone code (e.g., 'WLY01' for Kuala Lumpur)
 * @returns Prayer times for today
 */
export async function getESolatPrayerTimes(zone: string = 'WLY01'): Promise<PrayerTime> {
  try {
    const cacheKey = `${CACHE_KEY}_${zone}`;
    
    // Check cache
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      if (now - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    // Get current date
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();

    // Fetch from E-Solat API
    // Note: E-Solat may require specific format or have rate limiting
    // This is a simplified version - may need adjustment based on actual API
    const response = await axios.get(E_SOLAT_API_BASE, {
      params: {
        r: 'esolatApi/TakwimSolat',
        period: 'today',
        zone: zone,
      },
      headers: {
        'User-Agent': 'QuranPulse/2.0',
      },
    });

    if (!response.data || !response.data.prayerTime) {
      throw new Error('Invalid response from E-Solat API');
    }

    const prayerData = response.data.prayerTime[0];
    
    const prayerTimes: PrayerTime = {
      Fajr: prayerData.fajr,
      Dhuhr: prayerData.dhuhr,
      Asr: prayerData.asr,
      Maghrib: prayerData.maghrib,
      Isha: prayerData.isha,
      Sunrise: prayerData.syuruk,
      Imsak: prayerData.imsak,
      Midnight: '', // Not provided by E-Solat
    };

    // Cache the result
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: prayerTimes,
        timestamp: Date.now(),
      })
    );

    return prayerTimes;
  } catch (error) {
    console.error('Error fetching E-Solat prayer times:', error);
    // Fallback to Aladhan API if E-Solat fails
    throw error;
  }
}

/**
 * Get Hijri date from E-Solat
 * @returns Hijri date string
 */
export async function getESolatHijriDate(): Promise<string> {
  try {
    const cacheKey = 'esolat_hijri_date';
    const today = new Date().toDateString();

    // Check cache
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, date } = JSON.parse(cached);
      if (date === today) {
        return data;
      }
    }

    // Fetch from E-Solat
    const response = await axios.get(E_SOLAT_API_BASE, {
      params: {
        r: 'esolatApi/TakwimSolat',
        period: 'today',
        zone: 'WLY01',
      },
    });

    if (response.data && response.data.prayerTime && response.data.prayerTime[0]) {
      const hijri = response.data.prayerTime[0].hijri;
      
      // Cache
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: hijri,
          date: today,
        })
      );

      return hijri;
    }

    return '';
  } catch (error) {
    console.error('Error fetching Hijri date from E-Solat:', error);
    return '';
  }
}

/**
 * Get prayer times for a date range
 * @param zone - JAKIM zone code
 * @param startDate - Start date
 * @param endDate - End date (optional, defaults to start date)
 * @returns Array of prayer times
 */
export async function getESolatMonthlyTimes(
  zone: string,
  year: number,
  month: number
): Promise<ESolatPrayerTime[]> {
  try {
    const response = await axios.get(E_SOLAT_API_BASE, {
      params: {
        r: 'esolatApi/TakwimSolat',
        period: 'month',
        zone: zone,
        year: year,
        month: month,
      },
    });

    if (!response.data || !response.data.prayerTime) {
      throw new Error('Invalid response from E-Solat API');
    }

    return response.data.prayerTime;
  } catch (error) {
    console.error('Error fetching monthly prayer times:', error);
    return [];
  }
}

/**
 * Clear E-Solat cache
 */
export async function clearESolatCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const esolatKeys = keys.filter(key => key.startsWith('esolat_'));
    await AsyncStorage.multiRemove(esolatKeys);
  } catch (error) {
    console.error('Error clearing E-Solat cache:', error);
  }
}
