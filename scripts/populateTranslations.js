/**
 * Script to populate Malay and Indonesian translations for all Quran verses
 * Uses alquran.cloud API with legitimate translations:
 * - Malay: Abdullah Muhammad Basmeih (ms.basmeih)
 * - Indonesian: Bahasa Indonesia (id.indonesian)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '../data/kalam');
const API_BASE = 'http://api.alquran.cloud/v1';
const DELAY_MS = 500; // Delay between API calls to be respectful

// Translation editions
const EDITIONS = {
  malay: 'ms.basmeih',
  indonesian: 'id.indonesian'
};

// Helper function to make HTTP GET request
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: 'GET'
    };

    const req = (urlObj.protocol === 'https:' ? https : require('http')).request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch translations for a surah
async function fetchSurahTranslations(surahNumber) {
  console.log(`Fetching translations for Surah ${surahNumber}...`);
  
  try {
    const url = `${API_BASE}/surah/${surahNumber}/editions/quran-uthmani,${EDITIONS.malay},${EDITIONS.indonesian}`;
    const response = await httpGet(url);
    
    if (response.code !== 200) {
      throw new Error(`API returned code ${response.code}`);
    }
    
    const arabicData = response.data[0]; // quran-uthmani
    const malayData = response.data[1];  // ms.basmeih
    const indonesianData = response.data[2]; // id.indonesian
    
    return {
      arabic: arabicData.ayahs,
      malay: malayData.ayahs,
      indonesian: indonesianData.ayahs
    };
  } catch (error) {
    console.error(`Error fetching Surah ${surahNumber}:`, error.message);
    throw error;
  }
}

// Update verse file with translations
async function updateVerseFile(surahNumber, translations) {
  const filePath = path.join(DATA_DIR, `verses_${surahNumber}.json`);
  
  // Read existing file
  let verses = [];
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    verses = JSON.parse(content);
  }
  
  // Update translations
  verses.forEach((verse, index) => {
    if (translations.malay[index]) {
      verse.translations.ms = translations.malay[index].text;
    }
    if (translations.indonesian[index]) {
      verse.translations.id = translations.indonesian[index].text;
    }
  });
  
  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(verses, null, 2), 'utf8');
  console.log(`✅ Updated ${filePath}`);
}

// Main function
async function main() {
  console.log('🚀 Starting translation population...\n');
  console.log(`Using translations:`);
  console.log(`  - Malay: Abdullah Muhammad Basmeih (${EDITIONS.malay})`);
  console.log(`  - Indonesian: Bahasa Indonesia (${EDITIONS.indonesian})\n`);
  
  const totalSurahs = 114;
  let successCount = 0;
  let errorCount = 0;
  
  for (let surahNumber = 1; surahNumber <= totalSurahs; surahNumber++) {
    try {
      // Fetch translations
      const translations = await fetchSurahTranslations(surahNumber);
      
      // Update verse file
      await updateVerseFile(surahNumber, translations);
      
      successCount++;
      console.log(`Progress: ${surahNumber}/${totalSurahs} (${Math.round(surahNumber/totalSurahs*100)}%)\n`);
      
      // Delay to be respectful to the API
      if (surahNumber < totalSurahs) {
        await delay(DELAY_MS);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Failed to process Surah ${surahNumber}: ${error.message}\n`);
      
      // Continue with next surah
      continue;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`  ✅ Success: ${successCount} surahs`);
  console.log(`  ❌ Errors: ${errorCount} surahs`);
  console.log(`  📈 Success Rate: ${Math.round(successCount/totalSurahs*100)}%`);
  console.log('='.repeat(50));
  
  if (successCount === totalSurahs) {
    console.log('\n🎉 All translations populated successfully!');
  } else {
    console.log('\n⚠️  Some translations failed. Please check the errors above.');
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

