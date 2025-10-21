/**
 * Quran API Service Tests
 */

import axios from 'axios';
import { getSurah, getSurahVerses, getVerse } from '../../services/quranApi';
import { SURAHS } from '../../constants/surahs';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Quran API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSurah', () => {
    it('should fetch and return surah data', async () => {
      const mockResponse = {
        data: {
          code: 200,
          data: {
            number: 1,
            name: 'سُورَةُ ٱلْفَاتِحَةِ',
            englishName: 'Al-Fatihah',
            englishNameTranslation: 'The Opening',
            numberOfAyahs: 7,
            revelationType: 'Meccan',
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const surah = await getSurah(1);

      expect(surah).toEqual({
        number: 1,
        name: 'سُورَةُ ٱلْفَاتِحَةِ',
        englishName: 'Al-Fatihah',
        englishNameTranslation: 'The Opening',
        numberOfAyahs: 7,
        revelationType: 'Meccan',
        arabicName: 'سُورَةُ ٱلْفَاتِحَةِ',
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/surah/1')
      );
    });

    it('should fallback to constants when API fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const surah = await getSurah(1);

      expect(surah).toEqual(SURAHS[0]);
    });

    it('should cache successful API responses', async () => {
      const mockResponse = {
        data: {
          code: 200,
          data: {
            number: 2,
            name: 'سُورَةُ البَقَرَةِ',
            englishName: 'Al-Baqarah',
            englishNameTranslation: 'The Cow',
            numberOfAyahs: 286,
            revelationType: 'Medinan',
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // First call - should hit API
      await getSurah(2);

      // Second call - should use cache
      await getSurah(2);

      // API should only be called once
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSurahVerses', () => {
    it('should fetch verses with translations', async () => {
      const mockArabicResponse = {
        data: {
          code: 200,
          data: {
            ayahs: [
              {
                number: 1,
                numberInSurah: 1,
                text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
              },
            ],
          },
        },
      };

      const mockTranslationResponse = {
        data: {
          code: 200,
          data: {
            ayahs: [
              {
                number: 1,
                numberInSurah: 1,
                text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
              },
            ],
          },
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockArabicResponse)
        .mockResolvedValueOnce(mockTranslationResponse);

      const verses = await getSurahVerses(1);

      expect(verses).toHaveLength(1);
      expect(verses[0]).toMatchObject({
        verseNumber: 1,
        verse_key: '1:1',
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translationText: expect.stringContaining('Allah'),
        surahNumber: 1,
      });
    });

    it('should throw error when both API calls fail', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(getSurahVerses(1)).rejects.toThrow('Failed to fetch verses');
    });
  });

  describe('getVerse', () => {
    it('should fetch specific verse by key', async () => {
      const mockArabicResponse = {
        data: {
          code: 200,
          data: {
            number: 1,
            numberInSurah: 1,
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
          },
        },
      };

      const mockTranslationResponse = {
        data: {
          code: 200,
          data: {
            number: 1,
            numberInSurah: 1,
            text: 'In the name of Allah...',
          },
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockArabicResponse)
        .mockResolvedValueOnce(mockTranslationResponse);

      const verse = await getVerse('1:1');

      expect(verse).toMatchObject({
        verse_key: '1:1',
        arabicText: expect.any(String),
        translationText: expect.any(String),
      });
    });
  });
});
