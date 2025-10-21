#!/usr/bin/env node

/**
 * Kalam Al-Quran AI Data Cloning Script
 * 
 * This script clones data from https://kalam.alquran.ai/ and saves it locally
 * 
 * Usage:
 *   node scripts/cloneKalamData.js
 *   node scripts/cloneKalamData.js --surahs-only
 *   node scripts/cloneKalamData.js --verses-only
 *   node scripts/cloneKalamData.js --reciters-only
 *   node scripts/cloneKalamData.js --translations-only
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const KALAM_API_BASE = 'https://api.alquran.cloud/v1';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'kalam');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Helper function to save data to file
function saveToFile(filename, data) {
  const filePath = path.join(OUTPUT_DIR, filename);
  const jsonString = JSON.stringify(data, null, 2);
  
  fs.writeFileSync(filePath, jsonString, 'utf8');
  console.log(`✅ Saved ${filename} (${(jsonString.length / 1024).toFixed(2)} KB)`);
}

// Helper function to check if file is recent
function isFileRecent(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  const stats = fs.statSync(filePath);
  const age = Date.now() - stats.mtime.getTime();
  return age < CACHE_DURATION;
}

// Clone Surahs
async function cloneSurahs() {
  console.log('🔄 Cloning Surahs...');
  
  const filePath = path.join(OUTPUT_DIR, 'surahs.json');
  
  if (isFileRecent(filePath)) {
    console.log('✅ Using cached Surahs data');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  try {
    const data = await makeRequest(`${KALAM_API_BASE}/surah`);
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format for Surahs');
    }
    
    const surahs = data.data.map(surah => ({
      id: surah.id || surah.number,
      name: surah.name || surah.englishName,
      nameArabic: surah.nameArabic || surah.arabicName,
      nameEnglish: surah.nameEnglish || surah.englishName,
      nameTransliteration: surah.nameTransliteration || surah.transliteration,
      numberOfAyahs: surah.numberOfAyahs || surah.ayahCount,
      revelationType: surah.revelationType || (surah.revelationPlace === 'Mecca' ? 'Meccan' : 'Medinan'),
      revelationOrder: surah.revelationOrder || surah.order,
      bismillahPre: surah.bismillahPre || false,
      description: surah.description,
    }));
    
    saveToFile('surahs.json', surahs);
    return surahs;
    
  } catch (error) {
    console.error('❌ Error cloning Surahs:', error.message);
    throw error;
  }
}

// Clone verses for a specific Surah
async function cloneSurahVerses(surahId) {
  console.log(`🔄 Cloning verses for Surah ${surahId}...`);
  
  const filePath = path.join(OUTPUT_DIR, `verses_${surahId}.json`);
  
  if (isFileRecent(filePath)) {
    console.log(`✅ Using cached verses for Surah ${surahId}`);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  try {
    const [versesData, translationsData] = await Promise.all([
      makeRequest(`${KALAM_API_BASE}/surah/${surahId}`).catch(() => ({ data: { ayahs: [] } })),
      makeRequest(`${KALAM_API_BASE}/surah/${surahId}/en.asad`).catch(() => ({ data: { ayahs: [] } }))
    ]);
    
    const verses = versesData.data?.ayahs || [];
    const translations = translationsData.data?.ayahs || [];
    
    const ayahs = verses.map((verse, index) => ({
      id: verse.id || verse.number,
      surahId: surahId,
      ayahNumber: verse.ayahNumber || verse.numberInSurah || (index + 1),
      arabicText: verse.text,
      translations: {
        en: translations[index]?.text || verse.translation || '',
        ms: verse.malayTranslation || '',
        id: verse.indonesianTranslation || '',
        ar: verse.text,
      },
      audioUrl: verse.audioUrl,
      tafsir: verse.tafsir ? {
        en: verse.tafsir.en,
        ms: verse.tafsir.ms,
        id: verse.tafsir.id,
      } : undefined,
      transliteration: verse.transliteration,
    }));
    
    saveToFile(`verses_${surahId}.json`, ayahs);
    return ayahs;
    
  } catch (error) {
    console.error(`❌ Error cloning verses for Surah ${surahId}:`, error.message);
    return [];
  }
}

// Clone all verses
async function cloneAllVerses(surahs) {
  console.log('🔄 Cloning all verses...');
  
  const allVerses = {};
  
  for (let i = 0; i < surahs.length; i++) {
    const surah = surahs[i];
    console.log(`📖 Cloning verses for ${surah.nameEnglish} (${i + 1}/${surahs.length})...`);
    
    try {
      const verses = await cloneSurahVerses(surah.id);
      allVerses[surah.id] = verses;
      
      // Rate limiting - wait 1 second between requests
      if (i < surahs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`⚠️ Failed to clone verses for Surah ${surah.id}:`, error.message);
      allVerses[surah.id] = [];
    }
  }
  
  saveToFile('all_verses.json', allVerses);
  return allVerses;
}

// Clone reciters
async function cloneReciters() {
  console.log('🔄 Cloning reciters...');
  
  const filePath = path.join(OUTPUT_DIR, 'reciters.json');
  
  if (isFileRecent(filePath)) {
    console.log('✅ Using cached reciters data');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  try {
    const data = await makeRequest(`${KALAM_API_BASE}/edition`);
    
    const reciters = (data.data || []).map(reciter => ({
      id: reciter.id,
      name: reciter.name || reciter.englishName,
      nameArabic: reciter.nameArabic || reciter.arabicName,
      language: reciter.language || 'Arabic',
      region: reciter.region || reciter.country,
      style: reciter.style || reciter.recitationStyle,
      description: reciter.description,
    }));
    
    saveToFile('reciters.json', reciters);
    return reciters;
    
  } catch (error) {
    console.error('❌ Error cloning reciters:', error.message);
    return [];
  }
}

// Clone translations
async function cloneTranslations() {
  console.log('🔄 Cloning translations...');
  
  const filePath = path.join(OUTPUT_DIR, 'translations.json');
  
  if (isFileRecent(filePath)) {
    console.log('✅ Using cached translations data');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  try {
    const data = await makeRequest(`${KALAM_API_BASE}/edition`);
    
    const translations = (data.data || []).map(translation => ({
      id: translation.id,
      name: translation.name || translation.englishName,
      nameArabic: translation.nameArabic || translation.arabicName,
      language: translation.language || translation.lang,
      author: translation.author || translation.translator,
      description: translation.description,
    }));
    
    saveToFile('translations.json', translations);
    return translations;
    
  } catch (error) {
    console.error('❌ Error cloning translations:', error.message);
    return [];
  }
}

// Main cloning function
async function cloneData(options = {}) {
  console.log('🚀 Starting Kalam Al-Quran AI data cloning...');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  const startTime = Date.now();
  
  try {
    let surahs = [];
    let verses = {};
    let reciters = [];
    let translations = [];
    
    // Clone based on options
    if (options.surahsOnly || !options.versesOnly && !options.recitersOnly && !options.translationsOnly) {
      surahs = await cloneSurahs();
    }
    
    if (options.versesOnly || !options.surahsOnly && !options.recitersOnly && !options.translationsOnly) {
      if (surahs.length === 0) {
        surahs = await cloneSurahs();
      }
      verses = await cloneAllVerses(surahs);
    }
    
    if (options.recitersOnly || !options.surahsOnly && !options.versesOnly && !options.translationsOnly) {
      reciters = await cloneReciters();
    }
    
    if (options.translationsOnly || !options.surahsOnly && !options.versesOnly && !options.recitersOnly) {
      translations = await cloneTranslations();
    }
    
    // Create summary
    const summary = {
      clonedAt: new Date().toISOString(),
      source: 'kalam.alquran.ai',
      data: {
        surahs: surahs.length,
        verses: Object.keys(verses).length,
        reciters: reciters.length,
        translations: translations.length,
      },
      files: fs.readdirSync(OUTPUT_DIR).filter(file => file.endsWith('.json')),
    };
    
    saveToFile('cloning_summary.json', summary);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('🎉 Data cloning completed successfully!');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📊 Cloned data summary:`);
    console.log(`   • ${surahs.length} Surahs`);
    console.log(`   • ${Object.keys(verses).length} Surahs with verses`);
    console.log(`   • ${reciters.length} Reciters`);
    console.log(`   • ${translations.length} Translations`);
    console.log(`📁 Data saved to: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error('❌ Data cloning failed:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  surahsOnly: args.includes('--surahs-only'),
  versesOnly: args.includes('--verses-only'),
  recitersOnly: args.includes('--reciters-only'),
  translationsOnly: args.includes('--translations-only'),
};

// Run the cloning process
cloneData(options).catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});