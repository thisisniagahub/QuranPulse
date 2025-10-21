# Data Al-Quran dari API Al-Quran Cloud

Data ini di-clone dari API Al-Quran Cloud (https://api.alquran.cloud/) pada tanggal 21 Oktober 2025.

## Struktur Data

### 1. Surahs (surahs.json)
- **Jumlah**: 114 Surah
- **Format**: Array of objects
- **Fields**:
  - `id`: Nomor Surah (1-114)
  - `name`: Nama Surah dalam bahasa Arab
  - `nameArabic`: Nama Surah dalam bahasa Arab
  - `nameEnglish`: Nama Surah dalam bahasa Inggris
  - `nameTransliteration`: Transliterasi nama Surah
  - `numberOfAyahs`: Jumlah ayat dalam Surah
  - `revelationType`: Tipe wahyu (Meccan/Medinan)
  - `revelationOrder`: Urutan turunnya wahyu
  - `bismillahPre`: Apakah ada Bismillah di awal
  - `description`: Deskripsi Surah

### 2. Verses (verses_*.json)
- **Jumlah**: 114 file (satu per Surah)
- **Format**: Array of objects
- **Fields**:
  - `id`: ID ayat
  - `surahId`: ID Surah
  - `ayahNumber`: Nomor ayat dalam Surah
  - `arabicText`: Teks Arab
  - `translations`: Object dengan terjemahan dalam berbagai bahasa
    - `en`: Terjemahan bahasa Inggris
    - `ms`: Terjemahan bahasa Melayu
    - `id`: Terjemahan bahasa Indonesia
    - `ar`: Teks Arab
  - `audioUrl`: URL audio (jika tersedia)
  - `tafsir`: Tafsir dalam berbagai bahasa
  - `transliteration`: Transliterasi

### 3. All Verses (all_verses.json)
- **Format**: Object dengan key surahId dan value array of verses
- **Contoh**: `{ "1": [...], "2": [...], ... }`

### 4. Reciters (reciters.json)
- **Jumlah**: 167 Qari
- **Format**: Array of objects
- **Fields**:
  - `id`: ID Qari
  - `name`: Nama Qari
  - `nameArabic`: Nama Qari dalam bahasa Arab
  - `language`: Bahasa
  - `region`: Wilayah
  - `style`: Gaya pembacaan
  - `description`: Deskripsi

### 5. Translations (translations.json)
- **Jumlah**: 167 Terjemahan
- **Format**: Array of objects
- **Fields**:
  - `id`: ID Terjemahan
  - `name`: Nama Terjemahan
  - `nameArabic`: Nama dalam bahasa Arab
  - `language`: Bahasa
  - `author`: Penulis
  - `description`: Deskripsi

## Cara Menggunakan

### 1. Membaca Data Surah
```javascript
const surahs = require('./surahs.json');
console.log(surahs[0]); // Surah Al-Fatihah
```

### 2. Membaca Ayat dari Surah Tertentu
```javascript
const verses = require('./verses_1.json'); // Surah Al-Fatihah
console.log(verses[0]); // Ayat pertama
```

### 3. Membaca Semua Ayat
```javascript
const allVerses = require('./all_verses.json');
console.log(allVerses['1']); // Semua ayat Surah Al-Fatihah
```

### 4. Mencari Qari
```javascript
const reciters = require('./reciters.json');
const mishary = reciters.find(r => r.name.includes('Mishary'));
```

### 5. Mencari Terjemahan
```javascript
const translations = require('./translations.json');
const english = translations.filter(t => t.language === 'en');
```

## Statistik Data

- **Total Surah**: 114
- **Total Ayat**: 6,236
- **Total Qari**: 167
- **Total Terjemahan**: 167
- **Ukuran Total**: ~5.1 MB
- **Waktu Cloning**: 136.78 detik

## Update Data

Untuk mengupdate data, jalankan:

```bash
# Clone semua data
npm run clone-kalam-data

# Clone hanya Surah
npm run clone-surahs

# Clone hanya ayat
npm run clone-verses

# Clone hanya Qari
npm run clone-reciters

# Clone hanya terjemahan
npm run clone-translations
```

## Catatan

- Data di-cache selama 24 jam
- Rate limiting diterapkan untuk menghindari overload API
- Data tersimpan dalam format JSON yang mudah dibaca
- Semua file menggunakan encoding UTF-8
- Data sudah terstruktur dan siap digunakan dalam aplikasi

## Lisensi

Data ini berasal dari API Al-Quran Cloud yang tersedia secara publik. Silakan merujuk ke https://api.alquran.cloud/ untuk informasi lisensi lebih lanjut.