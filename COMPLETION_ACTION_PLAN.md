# Pelan Tindakan Penyelesaian QuranPulse

## Gambaran Keseluruhan

Projek QuranPulse kini berada pada tahap 85% siap. Pelan ini menggariskan langkah-langkah spesifik untuk mencapai 100% penyelesaian dalam masa 2-3 minggu.

## Fasa 1: Penyelesaian Ciri-ciri Asas (Minggu 1)

### 1.1 Selesaikan UI Pembaca Quran (2 hari)

#### Langkah 1: Integrasi VerseCard
- **File**: `app/surah/[id].tsx`
- **Tindakan**: Integrasi komponen VerseCard yang sedia ada
- **Komponen**: `components/quran/VerseCard.tsx`
- **Details**:
  - Ganti paparan ayat sedia ada dengan VerseCard
  - Pastikan semua fungsi (audio, penanda buku, dll) berfungsi
  - Uji dengan pelbagai peranti

#### Langkah 2: Pemilih Qari
- **Tindakan**: Tambah komponen ReciterSelector ke skrin Surah
- **Komponen**: `components/ReciterSelector.tsx`
- **Details**:
  - Tambah di bahagian atas skrin Surah
  - Integrasi dengan AudioContext
  - Simpan pilihan dalam tetapan pengguna

#### Langkah 3: Modal Tafsir
- **Tindakan**: Bina modal untuk paparan Tafsir Ibn Kathir
- **Details**:
  - Buka apabila butang Tafsir ditekan pada VerseCard
  - Integrasi dengan quranApi.ts untuk mendapatkan data Tafsir
  - Papar dalam format yang mudah dibaca

#### Langkah 4: Penjejakan Kemajuan Membaca
- **Tindakan**: Integrasi readingProgressService.ts
- **Details**:
  - Auto-kemaskini kemajuan apabila pengguna menggulir
  - Simpan kemajuan ke Supabase/AsyncStorage
  - Paparkan statistik kemajuan di profil

### 1.2 Widget Pemain Audio Apungan (1 hari)

#### Langkah 1: Bina Komponen AudioWidget
- **File**: `components/audio/AudioWidget.tsx`
- **Details**:
  - Paparkan di bahagian bawah skrin semasa audio dimainkan
  - Tunjuk ayat semasa, kawalan main/jeda, bar kemajuan
  - Boleh dimaksimumkan/minimakan

#### Langkah 2: Integrasi dengan Tab Navigation
- **File**: `app/_layout.tsx`
- **Details**:
  - Tambah AudioWidget sebagai komponen overlay
  - Sembunyikan apabila tiada audio aktif
  - Pastikan berfungsi merentasi semua skrin

### 1.3 Sistem Notifikasi Solat (2 hari)

#### Langkah 1: Konfigurasi Notifikasi
- **File**: `services/prayerService.ts`
- **Details**:
  - Gunakan Expo Notifications
- **Actions**:
  - Jadualkan notifikasi untuk setiap waktu solat
  - Gunakan ofset dari tetapan pengguna
  - Sokong zon solat JAKIM

#### Langkah 2: UI Notifikasi
- **File**: `app/settings.tsx`
- **Details**:
  - Tambah toggle untuk notifikasi solat
  - Benarkan pengguna laraskan waktu notifikasi
  - Pilih azan yang diingini

## Fasa 2: Pengembangan Ciri-ciri Lanjutan (Minggu 2)

### 2.1 Koleksi Hadith Lengkap (3 hari)

#### Langkah 1: API Hadith Service
- **File**: `services/hadithApi.ts`
- **Details**:
  - Integrasi dengan API Hadith sedia ada
  - Pastikan semua 6 buku hadith berfungsi
  - Tambah caching untuk prestasi

#### Langkah 2: UI Hadith
- **File**: `app/(tabs)/hadith.tsx`
- **Details**:
  - Paparkan senarai 6 buku hadith
  - Navigasi ke butiran setiap buku
  - Papar hadith dalam format yang cantik

#### Langkah 3: Cari Hadith
- **Tindakan**: Tambah fungsi carian untuk Hadith
- **Details**:
  - Carian dalam teks Arab dan terjemahan
  - Penapis oleh buku, bab, atau topik
  - Paparkan hasil carian dengan highlight

#### Langkah 4: Tandai Hadith Kegemaran
- **Tindakan**: Integrasi dengan bookmarkService.ts
- **Details**:
  - Tambah butang tandai pada setiap hadith
  - Simpan ke pangkalan data Supabase
  - Paparkan senarai hadith kegemaran

### 2.2 Mod Pembelajaran (2 hari)

#### Langkah 1: Pelajaran Iqra'
- **File**: `app/iqra.tsx`
- **Details**:
  - Bina UI untuk 6 peringkat Iqra'
  - Integrasi dengan iqraData.ts
  - Tambah fungsi Teks-ke-Untuk Pertuturan untuk sebutan

#### Langkah 2: Latihan Mukaddam
- **Tindakan**: Bina UI untuk latihan Mukaddam
- **Details**:
  - Paparkan halaman Mukaddam
  - Integrasi dengan audio untuk contoh sebutan
  - Tambah penjejakan kemajuan

### 2.3 Mod Luar Talian (2 hari)

#### Langkah 1: Pengurus Muat Turun
- **File**: `services/offlineDownloadService.ts`
- **Details**:
  - Lengkapkan fungsi muat turun audio Surah
  - Paparkan kemajuan muat turun
  - Pengurusan storan

#### Langkah 2: Cache Quran
- **Tindakan**: Tambah caching untuk teks Quran
- **Details**:
  - Cache semua Surah untuk akses luar talian
  - Auto-sync apabila dalam talian
  - Paparkan status cache

## Fasa 3: Penyempurnaan dan Persediaan Penyebaran (Minggu 3)

### 3.1 UI Carian Lanjutan (1 hari)

#### Langkah 1: Skrin Carian
- **File**: `app/search.tsx`
- **Details**:
  - Bina UI carian komprehensif
  - Carian merentasi Quran, Hadith, dan topik
  - Penapis lanjutan (jenis kandungan, sumber, dll)

### 3.2 Ujian dan Kualiti (2 hari)

#### Langkah 1: Ujian Unit
- **Tindakan**: Tambah ujian unit untuk semua komponen
- **Details**:
  - Liputi semua komponen UI penting
  - Uji semua perkhidmatan API
  - Pastikan coverage > 80%

#### Langkah 2: Ujian Integrasi
- **Tindakan**: Uji aliran pengguna utama
- **Details**:
  - Uji aliran pendaftaran dan log masuk
  - Uji aliran membaca Quran
  - Uji semua ciri sosial

#### Langkah 3: Ujian E2E
- **Tindakan**: Uji skenario pengguna lengkap
- **Details**:
  - Gunakan Detox atau Jest
  - Uji merentasi pelbagai peranti
  - Uji kedua-dua platform iOS dan Android

### 3.3 Pengoptimuman Prestasi (1 hari)

#### Langkah 1: Optimumkan Aplikasi
- **Tindakan**: Pengoptimuman untuk peranti kelajuan rendah
- **Details**:
  - Lazy loading untuk komponen besar
  - Optimumkan saiz imej
  - Kurangkan panggilan API yang tidak perlu

### 3.4 Aksesibiliti (1 hari)

#### Langkah 1: Peningkatan Aksesibiliti
- **Tindakan**: Tambah sokongan aksesibiliti
- **Details**:
  - Sokongan pembaca skrin
  - Saiz fon yang lebih besar
  - Kontras tinggi
  - Navigasi papan kekunci

### 3.5 Persediaan Penyebaran (1 hari)

#### Langkah 1: Konfigurasi Penyebaran
- **Tindakan**: Semak konfigurasi penyebaran
- **Details**:
  - Semak app.json, package.json
  - Konfigurasi ikon app dan splash screen
  - Sediakan skrin onboarding

#### Langkah 2: Dokumentasi Akhir
- **Tindakan**: Kemas kini dokumen
- **Details**:
  - Kemas kini README.md
  - Buat panduan pengguna akhir
  - Buat panduan pembangun

## Prioriti Pelaksanaan

### Tinggi (Mesti Dilakukan)
1. Selesaikan UI Pembaca Quran
2. Widget Pemain Audio Apungan
3. Sistem Notifikasi Solat
4. Ujian dan Kualiti

### Sederhana (Sebaiknya Dilakukan)
1. Koleksi Hadith Lengkap
2. Mod Pembelajaran
3. Mod Luar Talian
4. Pengoptimuman Prestasi

### Rendah (Boleh Dilakukan Kemudian)
1. UI Carian Lanjutan
2. Aksesibiliti
3. Dokumentasi Akhir

## Anggaran Masa

- **Fasa 1**: 5 hari (Minggu 1)
- **Fasa 2**: 7 hari (Minggu 2)
- **Fasa 3**: 5 hari (Minggu 3)
- **Jumlah**: 17 hari (sekitar 2.5 minggu)

## Sumber Diperlukan

### Pembangunan
- 1 pembangun utama (full-time)
- 1 pembangun sokongan (part-time, untuk ujian)

### Alat
- Akaun Expo (dengan pembayaran jika perlu)
- Akaun Supabase (tier percuma sudah mencukupi)
- Peranti ujian (iOS dan Android)

### Kos
- Tiada kos tambahan diperlukan
- Menggunakan perkhidmatan percuma (Expo, Supabase)

## Risiko dan Langkah Mitigasi

### Risiko 1: Isu API Pihak Ketiga
- **Mitigasi**: Gunakan caching dan fallback

### Risiko 2: Masalah Prestasi pada Peranti Lama
- **Mitigasi**: Pengoptimuman dan ujian pada peranti pelbagai

### Risiko 3: Isu Store Approval
- **Mitigasi**: Semak panduan store awal-awal

## Kriteria Kejayaan

1. **Fungsi**: Semua ciri berfungsi seperti yang dijangkakan
2. **Prestasi**: Aplikasi responsif pada semua peranti sasaran
3. **Kualiti**: Tiada kritikal bugs atau isu crash
4. **Pengalaman**: UX intuitif dan mesra pengguna
5. **Dokumentasi**: Dokumen lengkap untuk pengguna dan pembangun

Dengan mengikuti pelan ini, projek QuranPulse boleh mencapai 100% penyelesaian dalam masa 2-3 minggu dengan kualiti yang tinggi.