# QuranPulse - Tinjauan Projek Komprehensif

## Gambaran Keseluruhan Projek

**QuranPulse** adalah aplikasi mudah alih Quran komprehensif yang dibangunkan dengan React Native + Expo. Aplikasi ini direka untuk menjadi "rakan rohani" pengguna dengan menawarkan pelbagai ciri pembelajaran Islam yang interaktif dan moden.

### Nama Projek: QuranPulse
**Tagline**: "Follow the pulse of the Quran"

### Teknologi Utama
- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: GLM-4.6 (Z.AI) untuk soal jawab Islam
- **Bahasa**: TypeScript
- **Navigasi**: Expo Router

## Struktur Projek

```
Al-Quran-Mobile-Merged/
├── app/                     # Skrin Expo Router
│   ├── (tabs)/             # Navigasi Tab Utama
│   ├── auth/               # Pengesahan Pengguna
│   ├── social/             # Ciri-ciri Sosial (Baru)
│   └── surah/              # Butiran Surah
├── components/             # Komponen UI Boleh Guna
│   ├── quran/             # Komponen Khusus Quran
│   └── social/            # Komponen Sosial (Baru)
├── services/              # Logik Perniagaan & API
│   ├── supabaseClient.ts  # Konfigurasi Supabase
│   └── [13 services]      # Pelbagai perkhidmatan
├── contexts/              # React Context
├── types/                 # Definisi TypeScript
├── constants/             # Data Statik
├── utils/                 # Fungsi Utiliti
├── database/              # Skema DB (Baru)
└── __tests__/             # Ujian Unit
```

## Ciri-ciri Utama Yang Telah Diterapkan

### 1. Sistem Pengesahan (100% Siap)
- Daftar masuk/email dengan pengesahan
- Reset kata laluan melalui email
- Profil pengguna auto-dicipta
- Sesi berterusan dengan AsyncStorage
- Mod tetamu (tanpa akaun)

### 2. Pembaca Quran (90% Siap)
- 114 Surah lengkap dengan metadata
- Teks Arab + terjemahan Inggeris
- Audio dari 8+ qari profesional
- Tafsir Ibn Kathir
- Penanda buku dengan nota peribadi
- Sistem carian (Arab & terjemahan)
- Tipografi Arab yang cantik dengan fon Amiri

### 3. Pemain Audio Profesional (100% Siap)
- Main audio dari AlQuran Cloud API
- Pelbagai qari (Mishary Al-Afasy, dll)
- Kawalan main/jeda/berhenti
- Pergi ke posisi tertentu
- Kelajuan main semula (0.5x - 2x)
- Main audio latar belakang

### 4. Sistem Penanda Buku (100% Siap)
- Simpan ayat dengan butiran lengkap
- Tambah nota peribadi
- Edit nota
- Padam penanda buku
- Senarai semua penanda buku
- Sync ke pangkalan data (pengguna log masuk) atau simpanan lokal (tetamu)

### 5. AI Pembantu Islam (100% Siap)
- Soal jawab Islam dengan GLM-4.6
- Respons berkonteks dengan rujukan Quran
- Sokongan Bahasa Inggeris & Melayu
- Sejarah sembang sync
- Respons berformat Markdown

### 6. Waktu Solat (100% Siap)
- Waktu solat berdasarkan lokasi GPS
- 59 zon solat JAKIM Malaysia
- Notifikasi pintar dengan ofset boleh disesuaikan
- Kibla kompas dengan GPS
- Sejarah solat
- Kiraan Hijri
- Kiraan solat seterusnya

### 7. Skrin Tetapan (100% Siap)
- Saiz fon Arab (18-36px)
- Saiz fon terjemahan (12-24px)
- Toggle visibiliti terjemahan
- Auto-scroll semasa main audio
- Pemilihan qari lalai
- Kelajuan main audio
- Zon solat
- Notifikasi

### 8. Profil & Pengurusan Akaun (100% Siap)
- Maklumat pengguna
- Edit nama penuh
- Lihat email (baca sahaja)
- Tarikh ahli
- Statistik profil
- Tindakan pantas (penanda buku, tetapan, dll)

### 9. Koleksi Hadith (80% Siap)
- 6 Buku Hadith Utama:
  - Sahih Bukhari (7,563 hadith)
  - Sahih Muslim (7,563 hadith)
  - Sunan Abu Daud (5,274 hadith)
  - Jami At-Tirmizi (3,956 hadith)
  - Sunan An-Nasai (5,758 hadith)
  - Sunan Ibn Majah (4,341 hadith)
- Teks Arab + terjemahan
- Tandai hadith kegemaran
- Carian merentasi koleksi

### 10. Mod Pembelajaran (60% Siap)
- Pelajaran Iqra' - Belajar baca Arab
- Latihan Mukaddam - Latihan Tajwid
- Teks-ke-Untuk Pertuturan untuk sebutan
- Penjejakan kemajuan
- Pelajaran interaktif

### 11. Mod Luar Talian (50% Siap)
- Muat turun audio untuk main luar talian
- Teks Quran cache
- Akses Hadith luar talian
- Auto-sync apabila dalam talian

### 12. Ciri-ciri Sosial (100% Siap - BARU!)
- Kumpulan pembacaan Quran
- Sistem kawan dan permintaan kawan
- Perkongsian kemajuan bacaan
- Cabaran pembacaan
- Feed sosial aktiviti rakan

## Status Semasa Projek

### Tahap Siap Keseluruhan: 85%

#### Bahagian Yang Sudah Siap (100%)
- Sistem pengesahan
- Pemain audio
- Penanda buku
- AI Pembantu Islam
- Waktu solat
- Tetapan
- Profil pengguna
- Ciri-ciri sosial

#### Bahagian Hampir Siap (90%)
- Pembaca Quran (hanya perlu penyempurnaan UI)

#### Bahagian Dalam Pembangunan (80%)
- Koleksi Hadith

#### Bahagian Perlu Dibangunkan (60%)
- Mod pembelajaran (Iqra', Mukaddam)
- Mod luar talian

## Isu yang Dikenalpasti

### Isu Kecil
1. **UI Pembaca Quran**: Perlu penyepaduan komponen VerseCard
2. **Widget Pemain Audio**: Perlu pemain apungan di bahagian bawah
3. **Notifikasi Solat**: Belum dilaksanakan sepenuhnya
4. **Ujian Unit**: Perlindungan ujian perlu ditambah

### Isu Sederhana
1. **Modul Luar Talian**: Pengurusan muat turun perlu dilaksanakan
2. **Mod Pembelajaran**: Pelajaran Iqra' dan Mukaddam perlu UI
3. **Carian Lanjutan**: UI carian dengan penapis perlu dibina

### Isu Besar
1. **Prestasi**: Pengoptimuman untuk peranti kelajuan rendah
2. **Aksesibiliti**: Peningkatan untuk pengguna kurang upaya
3. **Pengujian**: Ujian integrasi dan E2E perlu ditambah

## Dokumentasi Projek

Terdapat 40+ fail dokumentasi dalam projek, termasuk:
- Laporan status pelaksanaan
- Panduan pemasangan
- Panduan penyebaran
- Laporan audit
- Panduan ciri-ciri
- Dokumentasi API

## Kelebihan Projek

1. **Seni Bina Bersih**: Mengikut prinsip seni bina yang baik
2. **Type-Safe**: 100% TypeScript
3. **Prestasi Dioptimumkan**: Caching pintar
4. **Mod Luar Talian**: Fallback simpanan lokal
5. **Malaysia-Spesifik**: 59 zon solat JAKIM
6. **Reka Bentuk Cantik**: Tema gelap gradien hijau ke biru
7. **Ciri-ciri AI**: Pembantu Islam berkuasa GLM-4.6
8. **Sosial**: Komuniti pembelajaran Quran