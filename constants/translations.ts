/**
 * QuranPulse - Multi-language Translation System
 * Bahasa Melayu (Default), English, Indonesia
 */

export type Language = 'ms' | 'en' | 'id';

export interface Translations {
  // App Name & Tagline
  appName: string;
  tagline: string;

  // Navigation
  tabs: {
    home: string;
    quran: string;
    prayer: string;
    hadith: string;
    more: string;
    ustazAi: string;
  };

  // Authentication
  auth: {
    login: string;
    signup: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    forgotPassword: string;
    resetPassword: string;
    continueAsGuest: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    createAccount: string;
    welcomeBack: string;
    getStarted: string;
    enterEmail: string;
    enterPassword: string;
    enterFullName: string;
    createPasswordHint: string;
    passwordMismatch: string;
    emailInvalid: string;
    passwordTooShort: string;
    resetEmailSent: string;
    resetInstructions: string;
  };

  // Quran
  quran: {
    surah: string;
    ayah: string;
    verse: string;
    juz: string;
    page: string;
    searchSurah: string;
    verses: string;
    revelation: string;
    meccan: string;
    medinan: string;
    tafsir: string;
    transliteration: string;
    translation: string;
    bookmarkAdded: string;
    bookmarkRemoved: string;
    share: string;
    playAudio: string;
    pauseAudio: string;
    reciter: string;
    playbackSpeed: string;
  };

  // Prayer
  prayer: {
    prayerTimes: string;
    nextPrayer: string;
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    sunrise: string;
    qibla: string;
    hijriDate: string;
    selectZone: string;
    currentLocation: string;
    enableLocation: string;
  };

  // Hadith
  hadith: {
    hadith: string;
    collection: string;
    searchHadith: string;
    sahihBukhari: string;
    sahihMuslim: string;
    sunanAbuDawud: string;
    jamiAtTirmidhi: string;
    sunanAnNasai: string;
    sunanIbnMajah: string;
    narrator: string;
    authenticity: string;
  };

  // USTAZ AI
  ustazAi: {
    title: string;
    subtitle: string;
    askQuestion: string;
    placeholder: string;
    thinking: string;
    suggestedQuestions: string;
    askAboutQuran: string;
    askAboutHadith: string;
    askAboutPrayer: string;
    askAboutJuz: string;
    learnWithUstaz: string;
    verifyHadith: string;
    explainVerse: string;
    dailyTips: string;
  };

  // Bookmarks
  bookmarks: {
    bookmarks: string;
    saved: string;
    notes: string;
    addNotes: string;
    editNotes: string;
    deleteBookmark: string;
    noBookmarks: string;
    startReading: string;
  };

  // Settings
  settings: {
    settings: string;
    customize: string;
    general: string;
    quranReading: string;
    prayerSettings: string;
    appearance: string;
    language: string;
    selectLanguage: string;
    fontSize: string;
    small: string;
    medium: string;
    large: string;
    showTransliteration: string;
    showTranslation: string;
    arabicFont: string;
    playbackSpeed: string;
    selectReciter: string;
    prayerZone: string;
    notifications: string;
    about: string;
    version: string;
  };

  // Profile
  profile: {
    profile: string;
    myProfile: string;
    editProfile: string;
    statistics: string;
    readingProgress: string;
    bookmarksCount: string;
    prayersTracked: string;
    daysActive: string;
    saveChanges: string;
    user: string;
    level: string;
    beginnerRank: string;
    totalPoints: string;
    pointsToNextLevel: string;
    versesRead: string;
    timeSpent: string;
    days: string;
    currentStreak: string;
    achievements: string;
    recentAchievements: string;
    seeAll: string;
    quickActions: string;
    groups: string;
    downloads: string;
  };

  // Common
  common: {
    ok: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    retry: string;
    back: string;
    next: string;
    previous: string;
    today: string;
    yesterday: string;
    tomorrow: string;
  };
}

// ==========================================
// BAHASA MELAYU (DEFAULT)
// ==========================================

export const translationsMS: Translations = {
  appName: 'QuranPulse',
  tagline: 'Pendamping Rohani Anda',

  tabs: {
    home: 'Utama',
    quran: 'Al-Quran',
    prayer: 'Solat',
    hadith: 'Hadis',
    more: 'Lagi',
    ustazAi: 'Ustaz AI',
  },

  auth: {
    login: 'Log Masuk',
    signup: 'Daftar',
    logout: 'Log Keluar',
    email: 'E-mel',
    password: 'Kata Laluan',
    confirmPassword: 'Sahkan Kata Laluan',
    fullName: 'Nama Penuh',
    forgotPassword: 'Lupa Kata Laluan?',
    resetPassword: 'Set Semula Kata Laluan',
    continueAsGuest: 'Teruskan sebagai Tetamu',
    alreadyHaveAccount: 'Sudah ada akaun?',
    dontHaveAccount: 'Belum ada akaun?',
    createAccount: 'Buat Akaun',
    welcomeBack: 'Selamat Kembali',
    getStarted: 'Mari Bermula',
    enterEmail: 'Masukkan e-mel anda',
    enterPassword: 'Masukkan kata laluan',
    enterFullName: 'Masukkan nama penuh',
    createPasswordHint: 'Minimum 6 aksara',
    passwordMismatch: 'Kata laluan tidak sama',
    emailInvalid: 'E-mel tidak sah',
    passwordTooShort: 'Kata laluan terlalu pendek',
    resetEmailSent: 'E-mel set semula telah dihantar',
    resetInstructions: 'Masukkan e-mel anda dan kami akan hantar pautan untuk set semula kata laluan',
  },

  quran: {
    surah: 'Surah',
    ayah: 'Ayat',
    verse: 'Ayat',
    juz: 'Juzuk',
    page: 'Halaman',
    searchSurah: 'Cari Surah...',
    verses: 'ayat',
    revelation: 'Tempat Turun',
    meccan: 'Makkiyyah',
    medinan: 'Madaniyyah',
    tafsir: 'Tafsir',
    transliteration: 'Bacaan Rumi',
    translation: 'Terjemahan',
    bookmarkAdded: 'Penanda ditambah',
    bookmarkRemoved: 'Penanda dibuang',
    share: 'Kongsi',
    playAudio: 'Main Audio',
    pauseAudio: 'Jeda Audio',
    reciter: 'Qari',
    playbackSpeed: 'Kelajuan Main',
  },

  prayer: {
    prayerTimes: 'Waktu Solat',
    nextPrayer: 'Solat Seterusnya',
    fajr: 'Subuh',
    dhuhr: 'Zohor',
    asr: 'Asar',
    maghrib: 'Maghrib',
    isha: 'Isyak',
    sunrise: 'Matahari Terbit',
    qibla: 'Kiblat',
    hijriDate: 'Tarikh Hijrah',
    selectZone: 'Pilih Zon',
    currentLocation: 'Lokasi Semasa',
    enableLocation: 'Aktifkan Lokasi',
  },

  hadith: {
    hadith: 'Hadis',
    collection: 'Koleksi',
    searchHadith: 'Cari Hadis...',
    sahihBukhari: 'Sahih Bukhari',
    sahihMuslim: 'Sahih Muslim',
    sunanAbuDawud: 'Sunan Abu Dawud',
    jamiAtTirmidhi: "Jami' at-Tirmidhi",
    sunanAnNasai: "Sunan an-Nasa'i",
    sunanIbnMajah: 'Sunan Ibn Majah',
    narrator: 'Perawi',
    authenticity: 'Kesahihan',
  },

  ustazAi: {
    title: 'Ustaz AI',
    subtitle: 'Pembantu Rohani Pintar Anda',
    askQuestion: 'Tanya Soalan',
    placeholder: 'Tanya tentang Islam, Al-Quran, Hadis, Solat, Juzuk...',
    thinking: 'Ustaz AI sedang berfikir...',
    suggestedQuestions: 'Soalan Cadangan',
    askAboutQuran: 'Tanya tentang Al-Quran',
    askAboutHadith: 'Semak Hadis',
    askAboutPrayer: 'Tanya tentang Solat',
    askAboutJuz: 'Belajar Juzuk',
    learnWithUstaz: 'Mengaji Bersama Ustaz AI',
    verifyHadith: 'Adakah hadis ini sahih?',
    explainVerse: 'Terangkan ayat ini',
    dailyTips: 'Nasihat Harian',
  },

  bookmarks: {
    bookmarks: 'Penanda Halaman',
    saved: 'tersimpan',
    notes: 'Catatan',
    addNotes: 'Tambah Catatan',
    editNotes: 'Edit Catatan',
    deleteBookmark: 'Padam Penanda',
    noBookmarks: 'Tiada penanda lagi',
    startReading: 'Mula membaca untuk menambah penanda',
  },

  settings: {
    settings: 'Tetapan',
    customize: 'Sesuaikan pengalaman anda',
    general: 'Umum',
    quranReading: 'Bacaan Al-Quran',
    prayerSettings: 'Tetapan Solat',
    appearance: 'Penampilan',
    language: 'Bahasa',
    selectLanguage: 'Pilih Bahasa',
    fontSize: 'Saiz Fon',
    small: 'Kecil',
    medium: 'Sederhana',
    large: 'Besar',
    showTransliteration: 'Tunjuk Bacaan Rumi',
    showTranslation: 'Tunjuk Terjemahan',
    arabicFont: 'Fon Arab',
    playbackSpeed: 'Kelajuan Main',
    selectReciter: 'Pilih Qari',
    prayerZone: 'Zon Solat',
    notifications: 'Notifikasi',
    about: 'Tentang',
    version: 'Versi',
  },

  profile: {
    profile: 'Profil',
    myProfile: 'Profil Saya',
    editProfile: 'Edit Profil',
    statistics: 'Statistik',
    readingProgress: 'Kemajuan Bacaan',
    bookmarksCount: 'Penanda',
    prayersTracked: 'Solat Dijejak',
    daysActive: 'Hari Aktif',
    saveChanges: 'Simpan Perubahan',
    user: 'Pengguna',
    level: 'Tahap',
    beginnerRank: 'Permulaan',
    totalPoints: 'Jumlah Mata',
    pointsToNextLevel: 'mata ke tahap seterusnya',
    versesRead: 'Ayat Dibaca',
    timeSpent: 'Masa Dihabiskan',
    days: 'hari',
    currentStreak: 'Rentetan Semasa',
    achievements: 'Pencapaian',
    recentAchievements: 'Pencapaian Terkini',
    seeAll: 'Lihat Semua',
    quickActions: 'Tindakan Pantas',
    groups: 'Kumpulan',
    downloads: 'Muat Turun',
  },

  common: {
    ok: 'OK',
    cancel: 'Batal',
    save: 'Simpan',
    delete: 'Padam',
    edit: 'Edit',
    close: 'Tutup',
    search: 'Cari',
    loading: 'Memuatkan...',
    error: 'Ralat',
    success: 'Berjaya',
    retry: 'Cuba Lagi',
    back: 'Kembali',
    next: 'Seterusnya',
    previous: 'Sebelumnya',
    today: 'Hari Ini',
    yesterday: 'Semalam',
    tomorrow: 'Esok',
  },
};

// ==========================================
// ENGLISH
// ==========================================

export const translationsEN: Translations = {
  appName: 'QuranPulse',
  tagline: 'Your Spiritual Companion',

  tabs: {
    home: 'Home',
    quran: 'Quran',
    prayer: 'Prayer',
    hadith: 'Hadith',
    more: 'More',
    ustazAi: 'Ustaz AI',
  },

  auth: {
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    continueAsGuest: 'Continue as Guest',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    createAccount: 'Create Account',
    welcomeBack: 'Welcome Back',
    getStarted: "Let's Get Started",
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    enterFullName: 'Enter your full name',
    createPasswordHint: 'Minimum 6 characters',
    passwordMismatch: 'Passwords do not match',
    emailInvalid: 'Invalid email address',
    passwordTooShort: 'Password too short',
    resetEmailSent: 'Reset email sent',
    resetInstructions: 'Enter your email and we will send you a link to reset your password',
  },

  quran: {
    surah: 'Surah',
    ayah: 'Ayah',
    verse: 'Verse',
    juz: 'Juz',
    page: 'Page',
    searchSurah: 'Search Surah...',
    verses: 'verses',
    revelation: 'Revelation',
    meccan: 'Meccan',
    medinan: 'Medinan',
    tafsir: 'Tafsir',
    transliteration: 'Transliteration',
    translation: 'Translation',
    bookmarkAdded: 'Bookmark added',
    bookmarkRemoved: 'Bookmark removed',
    share: 'Share',
    playAudio: 'Play Audio',
    pauseAudio: 'Pause Audio',
    reciter: 'Reciter',
    playbackSpeed: 'Playback Speed',
  },

  prayer: {
    prayerTimes: 'Prayer Times',
    nextPrayer: 'Next Prayer',
    fajr: 'Fajr',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    sunrise: 'Sunrise',
    qibla: 'Qibla',
    hijriDate: 'Hijri Date',
    selectZone: 'Select Zone',
    currentLocation: 'Current Location',
    enableLocation: 'Enable Location',
  },

  hadith: {
    hadith: 'Hadith',
    collection: 'Collection',
    searchHadith: 'Search Hadith...',
    sahihBukhari: 'Sahih Bukhari',
    sahihMuslim: 'Sahih Muslim',
    sunanAbuDawud: 'Sunan Abu Dawud',
    jamiAtTirmidhi: "Jami' at-Tirmidhi",
    sunanAnNasai: "Sunan an-Nasa'i",
    sunanIbnMajah: 'Sunan Ibn Majah',
    narrator: 'Narrator',
    authenticity: 'Authenticity',
  },

  ustazAi: {
    title: 'Ustaz AI',
    subtitle: 'Your Smart Spiritual Assistant',
    askQuestion: 'Ask Question',
    placeholder: 'Ask about Islam, Quran, Hadith, Prayer, Juz...',
    thinking: 'Ustaz AI is thinking...',
    suggestedQuestions: 'Suggested Questions',
    askAboutQuran: 'Ask about Quran',
    askAboutHadith: 'Verify Hadith',
    askAboutPrayer: 'Ask about Prayer',
    askAboutJuz: 'Learn Juz',
    learnWithUstaz: 'Learn with Ustaz AI',
    verifyHadith: 'Is this hadith authentic?',
    explainVerse: 'Explain this verse',
    dailyTips: 'Daily Tips',
  },

  bookmarks: {
    bookmarks: 'Bookmarks',
    saved: 'saved',
    notes: 'Notes',
    addNotes: 'Add Notes',
    editNotes: 'Edit Notes',
    deleteBookmark: 'Delete Bookmark',
    noBookmarks: 'No bookmarks yet',
    startReading: 'Start reading to add bookmarks',
  },

  settings: {
    settings: 'Settings',
    customize: 'Customize your experience',
    general: 'General',
    quranReading: 'Quran Reading',
    prayerSettings: 'Prayer Settings',
    appearance: 'Appearance',
    language: 'Language',
    selectLanguage: 'Select Language',
    fontSize: 'Font Size',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    showTransliteration: 'Show Transliteration',
    showTranslation: 'Show Translation',
    arabicFont: 'Arabic Font',
    playbackSpeed: 'Playback Speed',
    selectReciter: 'Select Reciter',
    prayerZone: 'Prayer Zone',
    notifications: 'Notifications',
    about: 'About',
    version: 'Version',
  },

  profile: {
    profile: 'Profile',
    myProfile: 'My Profile',
    editProfile: 'Edit Profile',
    statistics: 'Statistics',
    readingProgress: 'Reading Progress',
    bookmarksCount: 'Bookmarks',
    prayersTracked: 'Prayers Tracked',
    daysActive: 'Days Active',
    saveChanges: 'Save Changes',
    user: 'User',
    level: 'Level',
    beginnerRank: 'Beginner',
    totalPoints: 'Total Points',
    pointsToNextLevel: 'points to next level',
    versesRead: 'Verses Read',
    timeSpent: 'Time Spent',
    days: 'days',
    currentStreak: 'Current Streak',
    achievements: 'Achievements',
    recentAchievements: 'Recent Achievements',
    seeAll: 'See All',
    quickActions: 'Quick Actions',
    groups: 'Groups',
    downloads: 'Downloads',
  },

  common: {
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    retry: 'Retry',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
  },
};

// ==========================================
// BAHASA INDONESIA
// ==========================================

export const translationsID: Translations = {
  appName: 'QuranPulse',
  tagline: 'Pendamping Spiritual Anda',

  tabs: {
    home: 'Beranda',
    quran: 'Al-Quran',
    prayer: 'Shalat',
    hadith: 'Hadits',
    more: 'Lainnya',
    ustazAi: 'Ustadz AI',
  },

  auth: {
    login: 'Masuk',
    signup: 'Daftar',
    logout: 'Keluar',
    email: 'Email',
    password: 'Kata Sandi',
    confirmPassword: 'Konfirmasi Kata Sandi',
    fullName: 'Nama Lengkap',
    forgotPassword: 'Lupa Kata Sandi?',
    resetPassword: 'Reset Kata Sandi',
    continueAsGuest: 'Lanjutkan sebagai Tamu',
    alreadyHaveAccount: 'Sudah punya akun?',
    dontHaveAccount: 'Belum punya akun?',
    createAccount: 'Buat Akun',
    welcomeBack: 'Selamat Datang Kembali',
    getStarted: 'Mari Mulai',
    enterEmail: 'Masukkan email anda',
    enterPassword: 'Masukkan kata sandi',
    enterFullName: 'Masukkan nama lengkap',
    createPasswordHint: 'Minimal 6 karakter',
    passwordMismatch: 'Kata sandi tidak sama',
    emailInvalid: 'Email tidak valid',
    passwordTooShort: 'Kata sandi terlalu pendek',
    resetEmailSent: 'Email reset telah dikirim',
    resetInstructions: 'Masukkan email anda dan kami akan mengirim tautan untuk reset kata sandi',
  },

  quran: {
    surah: 'Surah',
    ayah: 'Ayat',
    verse: 'Ayat',
    juz: 'Juz',
    page: 'Halaman',
    searchSurah: 'Cari Surah...',
    verses: 'ayat',
    revelation: 'Tempat Turun',
    meccan: 'Makkiyah',
    medinan: 'Madaniyah',
    tafsir: 'Tafsir',
    transliteration: 'Transliterasi',
    translation: 'Terjemahan',
    bookmarkAdded: 'Bookmark ditambahkan',
    bookmarkRemoved: 'Bookmark dihapus',
    share: 'Bagikan',
    playAudio: 'Putar Audio',
    pauseAudio: 'Jeda Audio',
    reciter: 'Qari',
    playbackSpeed: 'Kecepatan Putar',
  },

  prayer: {
    prayerTimes: 'Waktu Shalat',
    nextPrayer: 'Shalat Selanjutnya',
    fajr: 'Subuh',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya',
    sunrise: 'Matahari Terbit',
    qibla: 'Kiblat',
    hijriDate: 'Tanggal Hijriah',
    selectZone: 'Pilih Zona',
    currentLocation: 'Lokasi Saat Ini',
    enableLocation: 'Aktifkan Lokasi',
  },

  hadith: {
    hadith: 'Hadits',
    collection: 'Koleksi',
    searchHadith: 'Cari Hadits...',
    sahihBukhari: 'Sahih Bukhari',
    sahihMuslim: 'Sahih Muslim',
    sunanAbuDawud: 'Sunan Abu Dawud',
    jamiAtTirmidhi: "Jami' at-Tirmidzi",
    sunanAnNasai: "Sunan an-Nasa'i",
    sunanIbnMajah: 'Sunan Ibnu Majah',
    narrator: 'Perawi',
    authenticity: 'Keaslian',
  },

  ustazAi: {
    title: 'Ustadz AI',
    subtitle: 'Asisten Spiritual Cerdas Anda',
    askQuestion: 'Ajukan Pertanyaan',
    placeholder: 'Tanya tentang Islam, Al-Quran, Hadits, Shalat, Juz...',
    thinking: 'Ustadz AI sedang berpikir...',
    suggestedQuestions: 'Pertanyaan yang Disarankan',
    askAboutQuran: 'Tanya tentang Al-Quran',
    askAboutHadith: 'Verifikasi Hadits',
    askAboutPrayer: 'Tanya tentang Shalat',
    askAboutJuz: 'Belajar Juz',
    learnWithUstaz: 'Belajar dengan Ustadz AI',
    verifyHadith: 'Apakah hadits ini sahih?',
    explainVerse: 'Jelaskan ayat ini',
    dailyTips: 'Tips Harian',
  },

  bookmarks: {
    bookmarks: 'Bookmark',
    saved: 'tersimpan',
    notes: 'Catatan',
    addNotes: 'Tambah Catatan',
    editNotes: 'Edit Catatan',
    deleteBookmark: 'Hapus Bookmark',
    noBookmarks: 'Belum ada bookmark',
    startReading: 'Mulai membaca untuk menambah bookmark',
  },

  settings: {
    settings: 'Pengaturan',
    customize: 'Sesuaikan pengalaman anda',
    general: 'Umum',
    quranReading: 'Bacaan Al-Quran',
    prayerSettings: 'Pengaturan Shalat',
    appearance: 'Tampilan',
    language: 'Bahasa',
    selectLanguage: 'Pilih Bahasa',
    fontSize: 'Ukuran Font',
    small: 'Kecil',
    medium: 'Sedang',
    large: 'Besar',
    showTransliteration: 'Tampilkan Transliterasi',
    showTranslation: 'Tampilkan Terjemahan',
    arabicFont: 'Font Arab',
    playbackSpeed: 'Kecepatan Putar',
    selectReciter: 'Pilih Qari',
    prayerZone: 'Zona Shalat',
    notifications: 'Notifikasi',
    about: 'Tentang',
    version: 'Versi',
  },

  profile: {
    profile: 'Profil',
    myProfile: 'Profil Saya',
    editProfile: 'Edit Profil',
    statistics: 'Statistik',
    readingProgress: 'Kemajuan Bacaan',
    bookmarksCount: 'Bookmark',
    prayersTracked: 'Shalat Terlacak',
    daysActive: 'Hari Aktif',
    saveChanges: 'Simpan Perubahan',
    user: 'Pengguna',
    level: 'Level',
    beginnerRank: 'Pemula',
    totalPoints: 'Total Poin',
    pointsToNextLevel: 'poin menuju level berikutnya',
    versesRead: 'Ayat Dibaca',
    timeSpent: 'Waktu Dihabiskan',
    days: 'hari',
    currentStreak: 'Streak Saat Ini',
    achievements: 'Pencapaian',
    recentAchievements: 'Pencapaian Terbaru',
    seeAll: 'Lihat Semua',
    quickActions: 'Tindakan Cepat',
    groups: 'Grup',
    downloads: 'Unduhan',
  },

  common: {
    ok: 'OK',
    cancel: 'Batal',
    save: 'Simpan',
    delete: 'Hapus',
    edit: 'Edit',
    close: 'Tutup',
    search: 'Cari',
    loading: 'Memuat...',
    error: 'Error',
    success: 'Berhasil',
    retry: 'Coba Lagi',
    back: 'Kembali',
    next: 'Selanjutnya',
    previous: 'Sebelumnya',
    today: 'Hari Ini',
    yesterday: 'Kemarin',
    tomorrow: 'Besok',
  },
};

// ==========================================
// Translation Helper Functions
// ==========================================

export const TRANSLATIONS = {
  ms: translationsMS,
  en: translationsEN,
  id: translationsID,
};

export function getTranslations(language: Language): Translations {
  return TRANSLATIONS[language] || TRANSLATIONS.ms; // Default to Malay
}
