/**
 * Al-Ma'thurat Service
 * Manages wirid, doa, zikir and istighfar from Quranic verses
 */

import almathuratData from '../data/almathurat.json';

export interface AlMathuratItem {
  id: string;
  category: 'wirid' | 'doa' | 'zikir' | 'istighfar';
  title: string;
  arabic: string;
  translation: {
    ms: string;
    en: string;
  };
  reference: string;
  surahNumber: number | null;
  ayahNumber: number | null;
  repetition: number;
  benefits: string;
}

export interface AlMathuratSection {
  title: string;
  description: string;
  items: AlMathuratItem[];
}

export type AlMathuratTime = 'morning' | 'evening';

/**
 * Get Al-Ma'thurat for specific time (morning or evening)
 */
export function getAlMathurat(time: AlMathuratTime): AlMathuratSection {
  return almathuratData[time] as AlMathuratSection;
}

/**
 * Get all morning Al-Ma'thurat
 */
export function getMorningAlMathurat(): AlMathuratSection {
  return getAlMathurat('morning');
}

/**
 * Get all evening Al-Ma'thurat
 */
export function getEveningAlMathurat(): AlMathuratSection {
  return getAlMathurat('evening');
}

/**
 * Get Al-Ma'thurat items by category
 */
export function getAlMathuratByCategory(
  time: AlMathuratTime,
  category: 'wirid' | 'doa' | 'zikir' | 'istighfar'
): AlMathuratItem[] {
  const section = getAlMathurat(time);
  return section.items.filter(item => item.category === category);
}

/**
 * Get a specific Al-Ma'thurat item by ID
 */
export function getAlMathuratItem(
  time: AlMathuratTime,
  itemId: string
): AlMathuratItem | undefined {
  const section = getAlMathurat(time);
  return section.items.find(item => item.id === itemId);
}

/**
 * Get total count of items for a time
 */
export function getAlMathuratCount(time: AlMathuratTime): number {
  const section = getAlMathurat(time);
  return section.items.length;
}

/**
 * Get total repetitions needed for a time
 */
export function getTotalRepetitions(time: AlMathuratTime): number {
  const section = getAlMathurat(time);
  return section.items.reduce((total, item) => total + item.repetition, 0);
}

/**
 * Get estimated time to complete (in minutes)
 * Assumes average 30 seconds per repetition
 */
export function getEstimatedTime(time: AlMathuratTime): number {
  const totalReps = getTotalRepetitions(time);
  return Math.ceil((totalReps * 30) / 60); // Convert seconds to minutes
}

/**
 * Get Al-Ma'thurat statistics
 */
export function getAlMathuratStatistics(time: AlMathuratTime): {
  totalItems: number;
  wirid: number;
  doa: number;
  zikir: number;
  istighfar: number;
  totalRepetitions: number;
  estimatedMinutes: number;
} {
  const section = getAlMathurat(time);
  
  return {
    totalItems: section.items.length,
    wirid: section.items.filter(i => i.category === 'wirid').length,
    doa: section.items.filter(i => i.category === 'doa').length,
    zikir: section.items.filter(i => i.category === 'zikir').length,
    istighfar: section.items.filter(i => i.category === 'istighfar').length,
    totalRepetitions: getTotalRepetitions(time),
    estimatedMinutes: getEstimatedTime(time),
  };
}

/**
 * Search Al-Ma'thurat by keyword
 */
export function searchAlMathurat(
  time: AlMathuratTime,
  keyword: string
): AlMathuratItem[] {
  const section = getAlMathurat(time);
  const lowerKeyword = keyword.toLowerCase();
  
  return section.items.filter(item =>
    item.title.toLowerCase().includes(lowerKeyword) ||
    item.arabic.includes(keyword) ||
    item.translation.ms.toLowerCase().includes(lowerKeyword) ||
    item.translation.en.toLowerCase().includes(lowerKeyword) ||
    item.benefits.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Get recommended time for Al-Ma'thurat based on current time
 */
export function getRecommendedTime(): AlMathuratTime {
  const hour = new Date().getHours();
  
  // Morning: 5 AM - 12 PM
  // Evening: 3 PM - 8 PM
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else {
    return 'evening';
  }
}

/**
 * Check if it's time for Al-Ma'thurat
 */
export function isAlMathuratTime(): {
  isTime: boolean;
  type: AlMathuratTime | null;
  message: string;
} {
  const hour = new Date().getHours();
  
  // Morning time: 5 AM - 12 PM
  if (hour >= 5 && hour < 12) {
    return {
      isTime: true,
      type: 'morning',
      message: 'Waktu untuk Al-Ma\'thurat Pagi',
    };
  }
  
  // Evening time: 3 PM - 8 PM
  if (hour >= 15 && hour < 20) {
    return {
      isTime: true,
      type: 'evening',
      message: 'Waktu untuk Al-Ma\'thurat Petang',
    };
  }
  
  return {
    isTime: false,
    type: null,
    message: 'Bukan waktu Al-Ma\'thurat',
  };
}

