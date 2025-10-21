/**
 * 30 Juz Data - Complete Quran Organization
 * Official Juz divisions with verse ranges and themes
 */

export interface JuzInfo {
  juzNumber: number;
  startSurah: number;
  startSurahName: string;
  startSurahNameArabic: string;
  startAyah: number;
  endSurah: number;
  endSurahName: string;
  endSurahNameArabic: string;
  endAyah: number;
  totalAyahs: number;
  theme: string;
  themeArabic: string;
  description: string;
  descriptionMalay: string;
}

export const JUZ_DATA: JuzInfo[] = [
  {
    juzNumber: 1,
    startSurah: 1,
    startSurahName: 'Al-Fatihah',
    startSurahNameArabic: 'الفاتحة',
    startAyah: 1,
    endSurah: 2,
    endSurahName: 'Al-Baqarah',
    endSurahNameArabic: 'البقرة',
    endAyah: 141,
    totalAyahs: 148,
    theme: 'Foundation of Faith',
    themeArabic: 'أساس الإيمان',
    description: 'Beginning of Quran focusing on worship, guidance, and stories of previous nations',
    descriptionMalay: 'Permulaan Al-Quran yang memberi tumpuan kepada ibadah, hidayah, dan kisah umat terdahulu',
  },
  {
    juzNumber: 2,
    startSurah: 2,
    startSurahName: 'Al-Baqarah',
    startSurahNameArabic: 'البقرة',
    startAyah: 142,
    endSurah: 2,
    endSurahName: 'Al-Baqarah',
    endSurahNameArabic: 'البقرة',
    endAyah: 252,
    totalAyahs: 111,
    theme: 'Islamic Laws & Obligations',
    themeArabic: 'الشرائع والفرائض',
    description: 'Continuation of Al-Baqarah covering prayer direction, fasting, Hajj, and jihad',
    descriptionMalay: 'Sambungan Al-Baqarah yang merangkumi arah kiblat, puasa, haji, dan jihad',
  },
  {
    juzNumber: 3,
    startSurah: 2,
    startSurahName: 'Al-Baqarah',
    startSurahNameArabic: 'البقرة',
    startAyah: 253,
    endSurah: 3,
    endSurahName: 'Ali Imran',
    endSurahNameArabic: 'آل عمران',
    endAyah: 92,
    totalAyahs: 126,
    theme: 'Social Laws & Unity',
    themeArabic: 'الأحكام الاجتماعية والوحدة',
    description: 'Marriage, divorce, financial dealings, and the importance of Muslim unity',
    descriptionMalay: 'Perkahwinan, perceraian, muamalat kewangan, dan kepentingan perpaduan umat Islam',
  },
  {
    juzNumber: 4,
    startSurah: 3,
    startSurahName: 'Ali Imran',
    startSurahNameArabic: 'آل عمران',
    startAyah: 93,
    endSurah: 4,
    endSurahName: 'An-Nisa',
    endSurahNameArabic: 'النساء',
    endAyah: 23,
    totalAyahs: 131,
    theme: 'Battle of Uhud & Women Rights',
    themeArabic: 'غزوة أحد وحقوق النساء',
    description: 'Lessons from Uhud, perseverance in faith, and rights of women',
    descriptionMalay: 'Pengajaran dari Uhud, ketabahan dalam iman, dan hak-hak wanita',
  },
  {
    juzNumber: 5,
    startSurah: 4,
    startSurahName: 'An-Nisa',
    startSurahNameArabic: 'النساء',
    startAyah: 24,
    endSurah: 4,
    endSurahName: 'An-Nisa',
    endSurahNameArabic: 'النساء',
    endAyah: 147,
    totalAyahs: 124,
    theme: 'Family Laws & Justice',
    themeArabic: 'أحكام الأسرة والعدالة',
    description: 'Marriage regulations, inheritance laws, and social justice',
    descriptionMalay: 'Peraturan perkahwinan, hukum pusaka, dan keadilan sosial',
  },
  {
    juzNumber: 6,
    startSurah: 4,
    startSurahName: 'An-Nisa',
    startSurahNameArabic: 'النساء',
    startAyah: 148,
    endSurah: 5,
    endSurahName: 'Al-Maidah',
    endSurahNameArabic: 'المائدة',
    endAyah: 81,
    totalAyahs: 110,
    theme: 'Hypocrisy & Treaties',
    themeArabic: 'النفاق والمعاهدات',
    description: 'Warning against hypocrisy, fulfilling treaties, and dietary laws',
    descriptionMalay: 'Peringatan terhadap kemunafikan, memenuhi perjanjian, dan hukum makanan',
  },
  {
    juzNumber: 7,
    startSurah: 5,
    startSurahName: 'Al-Maidah',
    startSurahNameArabic: 'المائدة',
    startAyah: 82,
    endSurah: 6,
    endSurahName: 'Al-Anam',
    endSurahNameArabic: 'الأنعام',
    endAyah: 110,
    totalAyahs: 149,
    theme: 'Prophets & Monotheism',
    themeArabic: 'الأنبياء والتوحيد',
    description: 'Stories of prophets, proofs of Allah\'s oneness, and warning to disbelievers',
    descriptionMalay: 'Kisah para nabi, bukti keesaan Allah, dan peringatan kepada kafir',
  },
  {
    juzNumber: 8,
    startSurah: 6,
    startSurahName: 'Al-Anam',
    startSurahNameArabic: 'الأنعام',
    startAyah: 111,
    endSurah: 7,
    endSurahName: 'Al-Araf',
    endSurahNameArabic: 'الأعراف',
    endAyah: 87,
    totalAyahs: 143,
    theme: 'Creation & Prophetic Stories',
    themeArabic: 'الخلق وقصص الأنبياء',
    description: 'Creation of heavens and earth, stories of Noah, Hud, Saleh, and Lot',
    descriptionMalay: 'Penciptaan langit dan bumi, kisah Nuh, Hud, Saleh, dan Lut',
  },
  {
    juzNumber: 9,
    startSurah: 7,
    startSurahName: 'Al-Araf',
    startSurahNameArabic: 'الأعراف',
    startAyah: 88,
    endSurah: 8,
    endSurahName: 'Al-Anfal',
    endSurahNameArabic: 'الأنفال',
    endAyah: 40,
    totalAyahs: 129,
    theme: 'Moses & Pharaoh, Battle of Badr',
    themeArabic: 'موسى وفرعون وغزوة بدر',
    description: 'Detailed story of Moses and Pharaoh, lessons from Battle of Badr',
    descriptionMalay: 'Kisah terperinci Musa dan Firaun, pengajaran dari Perang Badr',
  },
  {
    juzNumber: 10,
    startSurah: 8,
    startSurahName: 'Al-Anfal',
    startSurahNameArabic: 'الأنفال',
    startAyah: 41,
    endSurah: 9,
    endSurahName: 'At-Tawbah',
    endSurahNameArabic: 'التوبة',
    endAyah: 92,
    totalAyahs: 127,
    theme: 'Spoils of War & Repentance',
    themeArabic: 'الغنائم والتوبة',
    description: 'Distribution of war spoils, importance of repentance, and dealing with hypocrites',
    descriptionMalay: 'Pembahagian harta rampasan perang, kepentingan taubat, dan berurusan dengan munafik',
  },
  {
    juzNumber: 11,
    startSurah: 9,
    startSurahName: 'At-Tawbah',
    startSurahNameArabic: 'التوبة',
    startAyah: 93,
    endSurah: 11,
    endSurahName: 'Hud',
    endSurahNameArabic: 'هود',
    endAyah: 5,
    totalAyahs: 151,
    theme: 'Prophetic Missions',
    themeArabic: 'رسالات الأنبياء',
    description: 'Stories of Noah, Hud, Saleh, Abraham, Lot, Shu\'aib, and Moses',
    descriptionMalay: 'Kisah Nuh, Hud, Saleh, Ibrahim, Lut, Shu\'aib, dan Musa',
  },
  {
    juzNumber: 12,
    startSurah: 11,
    startSurahName: 'Hud',
    startSurahNameArabic: 'هود',
    startAyah: 6,
    endSurah: 12,
    endSurahName: 'Yusuf',
    endSurahNameArabic: 'يوسف',
    endAyah: 52,
    totalAyahs: 153,
    theme: 'Story of Prophet Yusuf',
    themeArabic: 'قصة يوسف عليه السلام',
    description: 'Complete story of Prophet Joseph from childhood to leadership in Egypt',
    descriptionMalay: 'Kisah lengkap Nabi Yusuf dari kanak-kanak hingga menjadi pemimpin di Mesir',
  },
  {
    juzNumber: 13,
    startSurah: 12,
    startSurahName: 'Yusuf',
    startSurahNameArabic: 'يوسف',
    startAyah: 53,
    endSurah: 14,
    endSurahName: 'Ibrahim',
    endSurahNameArabic: 'إبراهيم',
    endAyah: 52,
    totalAyahs: 135,
    theme: 'Gratitude & Warnings',
    themeArabic: 'الشكر والإنذار',
    description: 'Importance of gratitude to Allah and warnings about heedlessness',
    descriptionMalay: 'Kepentingan bersyukur kepada Allah dan peringatan tentang kelalaian',
  },
  {
    juzNumber: 14,
    startSurah: 15,
    startSurahName: 'Al-Hijr',
    startSurahNameArabic: 'الحجر',
    startAyah: 1,
    endSurah: 16,
    endSurahName: 'An-Nahl',
    endSurahNameArabic: 'النحل',
    endAyah: 128,
    totalAyahs: 227,
    theme: 'Signs of Allah',
    themeArabic: 'آيات الله',
    description: 'Countless blessings and signs of Allah in creation',
    descriptionMalay: 'Nikmat dan tanda-tanda Allah yang tidak terhitung dalam ciptaan',
  },
  {
    juzNumber: 15,
    startSurah: 17,
    startSurahName: 'Al-Isra',
    startSurahNameArabic: 'الإسراء',
    startAyah: 1,
    endSurah: 18,
    endSurahName: 'Al-Kahf',
    endSurahNameArabic: 'الكهف',
    endAyah: 74,
    totalAyahs: 185,
    theme: 'Night Journey & Cave Story',
    themeArabic: 'الإسراء والكهف',
    description: 'Prophet\'s night journey, story of cave companions, and Dhul-Qarnayn',
    descriptionMalay: 'Perjalanan malam Nabi, kisah penghuni gua, dan Zulkarnain',
  },
  {
    juzNumber: 16,
    startSurah: 18,
    startSurahName: 'Al-Kahf',
    startSurahNameArabic: 'الكهف',
    startAyah: 75,
    endSurah: 20,
    endSurahName: 'Ta-Ha',
    endSurahNameArabic: 'طه',
    endAyah: 135,
    totalAyahs: 172,
    theme: 'Moses & Aaron',
    themeArabic: 'موسى وهارون',
    description: 'Detailed story of Moses calling Pharaoh to Islam',
    descriptionMalay: 'Kisah terperinci Musa menyeru Firaun kepada Islam',
  },
  {
    juzNumber: 17,
    startSurah: 21,
    startSurahName: 'Al-Anbiya',
    startSurahNameArabic: 'الأنبياء',
    startAyah: 1,
    endSurah: 22,
    endSurahName: 'Al-Hajj',
    endSurahNameArabic: 'الحج',
    endAyah: 78,
    totalAyahs: 190,
    theme: 'The Prophets & Hajj',
    themeArabic: 'الأنبياء والحج',
    description: 'Stories of 16 prophets and regulations of Hajj pilgrimage',
    descriptionMalay: 'Kisah 16 nabi dan peraturan ibadat haji',
  },
  {
    juzNumber: 18,
    startSurah: 23,
    startSurahName: 'Al-Muminun',
    startSurahNameArabic: 'المؤمنون',
    startAyah: 1,
    endSurah: 25,
    endSurahName: 'Al-Furqan',
    endSurahNameArabic: 'الفرقان',
    endAyah: 20,
    totalAyahs: 201,
    theme: 'Characteristics of Believers',
    themeArabic: 'صفات المؤمنين',
    description: 'Qualities of true believers and servants of the Most Merciful',
    descriptionMalay: 'Ciri-ciri mukmin sejati dan hamba-hamba Ar-Rahman',
  },
  {
    juzNumber: 19,
    startSurah: 25,
    startSurahName: 'Al-Furqan',
    startSurahNameArabic: 'الفرقان',
    startAyah: 21,
    endSurah: 27,
    endSurahName: 'An-Naml',
    endSurahNameArabic: 'النمل',
    endAyah: 55,
    totalAyahs: 186,
    theme: 'Stories of Solomon & Queen of Sheba',
    themeArabic: 'قصة سليمان وملكة سبأ',
    description: 'Prophet Solomon, the hoopoe bird, and Queen of Sheba',
    descriptionMalay: 'Nabi Sulaiman, burung hud-hud, dan Ratu Balqis',
  },
  {
    juzNumber: 20,
    startSurah: 27,
    startSurahName: 'An-Naml',
    startSurahNameArabic: 'النمل',
    startAyah: 56,
    endSurah: 29,
    endSurahName: 'Al-Ankabut',
    endSurahNameArabic: 'العنكبوت',
    endAyah: 45,
    totalAyahs: 160,
    theme: 'Trials & Patience',
    themeArabic: 'الابتلاء والصبر',
    description: 'Tests of faith and importance of patience in adversity',
    descriptionMalay: 'Ujian keimanan dan kepentingan sabar dalam kesusahan',
  },
  {
    juzNumber: 21,
    startSurah: 29,
    startSurahName: 'Al-Ankabut',
    startSurahNameArabic: 'العنكبوت',
    startAyah: 46,
    endSurah: 33,
    endSurahName: 'Al-Ahzab',
    endSurahNameArabic: 'الأحزاب',
    endAyah: 30,
    totalAyahs: 173,
    theme: 'Battle of the Trench',
    themeArabic: 'غزوة الأحزاب',
    description: 'Lessons from Battle of the Trench and regulations for Prophet\'s household',
    descriptionMalay: 'Pengajaran dari Perang Khandak dan peraturan untuk keluarga Nabi',
  },
  {
    juzNumber: 22,
    startSurah: 33,
    startSurahName: 'Al-Ahzab',
    startSurahNameArabic: 'الأحزاب',
    startAyah: 31,
    endSurah: 36,
    endSurahName: 'Ya-Sin',
    endSurahNameArabic: 'يس',
    endAyah: 27,
    totalAyahs: 171,
    theme: 'Heart of the Quran',
    themeArabic: 'قلب القرآن',
    description: 'Ya-Sin, the heart of Quran, about resurrection and afterlife',
    descriptionMalay: 'Ya-Sin, jantung Al-Quran, tentang kebangkitan dan akhirat',
  },
  {
    juzNumber: 23,
    startSurah: 36,
    startSurahName: 'Ya-Sin',
    startSurahNameArabic: 'يس',
    startAyah: 28,
    endSurah: 39,
    endSurahName: 'Az-Zumar',
    endSurahNameArabic: 'الزمر',
    endAyah: 31,
    totalAyahs: 188,
    theme: 'Sincerity in Worship',
    themeArabic: 'الإخلاص في العبادة',
    description: 'Pure monotheism and sincerity in worshipping Allah alone',
    descriptionMalay: 'Tauhid murni dan keikhlasan dalam beribadah kepada Allah',
  },
  {
    juzNumber: 24,
    startSurah: 39,
    startSurahName: 'Az-Zumar',
    startSurahNameArabic: 'الزمر',
    startAyah: 32,
    endSurah: 41,
    endSurahName: 'Fussilat',
    endSurahNameArabic: 'فصلت',
    endAyah: 46,
    totalAyahs: 189,
    theme: 'Divine Justice',
    themeArabic: 'العدل الإلهي',
    description: 'Perfect justice of Allah and warnings about Day of Judgment',
    descriptionMalay: 'Keadilan sempurna Allah dan peringatan tentang Hari Kiamat',
  },
  {
    juzNumber: 25,
    startSurah: 41,
    startSurahName: 'Fussilat',
    startSurahNameArabic: 'فصلت',
    startAyah: 47,
    endSurah: 45,
    endSurahName: 'Al-Jathiyah',
    endSurahNameArabic: 'الجاثية',
    endAyah: 37,
    totalAyahs: 197,
    theme: 'Consultation & Humility',
    themeArabic: 'الشورى والتواضع',
    description: 'Importance of consultation and humbling oneself before Allah',
    descriptionMalay: 'Kepentingan bermusyawarah dan merendah diri di hadapan Allah',
  },
  {
    juzNumber: 26,
    startSurah: 46,
    startSurahName: 'Al-Ahqaf',
    startSurahNameArabic: 'الأحقاف',
    startAyah: 1,
    endSurah: 51,
    endSurahName: 'Adh-Dhariyat',
    endSurahNameArabic: 'الذاريات',
    endAyah: 30,
    totalAyahs: 223,
    theme: 'Previous Nations',
    themeArabic: 'الأمم السابقة',
    description: 'Lessons from destruction of previous nations who rejected prophets',
    descriptionMalay: 'Pengajaran dari kebinasaan umat terdahulu yang menolak para nabi',
  },
  {
    juzNumber: 27,
    startSurah: 51,
    startSurahName: 'Adh-Dhariyat',
    startSurahNameArabic: 'الذاريات',
    startAyah: 31,
    endSurah: 57,
    endSurahName: 'Al-Hadid',
    endSurahNameArabic: 'الحديد',
    endAyah: 29,
    totalAyahs: 266,
    theme: 'Purpose of Creation',
    themeArabic: 'الغاية من الخلق',
    description: 'Purpose of creating jinn and mankind: to worship Allah',
    descriptionMalay: 'Tujuan mencipta jin dan manusia: untuk beribadah kepada Allah',
  },
  {
    juzNumber: 28,
    startSurah: 58,
    startSurahName: 'Al-Mujadila',
    startSurahNameArabic: 'المجادلة',
    startAyah: 1,
    endSurah: 66,
    endSurahName: 'At-Tahrim',
    endSurahNameArabic: 'التحريم',
    endAyah: 12,
    totalAyahs: 225,
    theme: 'Social Issues & Women',
    themeArabic: 'القضايا الاجتماعية والنساء',
    description: 'Various social issues and examples of righteous and evil women',
    descriptionMalay: 'Pelbagai isu sosial dan contoh wanita solehah dan jahat',
  },
  {
    juzNumber: 29,
    startSurah: 67,
    startSurahName: 'Al-Mulk',
    startSurahNameArabic: 'الملك',
    startAyah: 1,
    endSurah: 77,
    endSurahName: 'Al-Mursalat',
    endSurahNameArabic: 'المرسلات',
    endAyah: 50,
    totalAyahs: 390,
    theme: 'The Hereafter',
    themeArabic: 'الآخرة',
    description: 'Vivid descriptions of Day of Judgment, Paradise, and Hellfire',
    descriptionMalay: 'Gambaran jelas tentang Hari Kiamat, Syurga, dan Neraka',
  },
  {
    juzNumber: 30,
    startSurah: 78,
    startSurahName: 'An-Naba',
    startSurahNameArabic: 'النبإ',
    startAyah: 1,
    endSurah: 114,
    endSurahName: 'An-Nas',
    endSurahNameArabic: 'الناس',
    endAyah: 6,
    totalAyahs: 564,
    theme: 'Short Surahs & Protection',
    themeArabic: 'السور القصيرة والحماية',
    description: 'Short but powerful chapters often recited for protection and daily prayers',
    descriptionMalay: 'Surah-surah pendek tetapi kuat yang sering dibaca untuk perlindungan dan solat harian',
  },
];

/**
 * Get Juz by number
 */
export function getJuzByNumber(juzNumber: number): JuzInfo | undefined {
  return JUZ_DATA.find(juz => juz.juzNumber === juzNumber);
}

/**
 * Get all Juz data
 */
export function getAllJuz(): JuzInfo[] {
  return JUZ_DATA;
}

/**
 * Get Juz number for a specific surah and ayah
 */
export function getJuzForVerse(surahNumber: number, ayahNumber: number): number {
  // This is a simplified version - in real implementation, 
  // you'd need complete verse-to-juz mapping
  
  for (let i = 0; i < JUZ_DATA.length; i++) {
    const juz = JUZ_DATA[i];
    
    // Check if verse falls within this juz
    if (surahNumber === juz.startSurah && ayahNumber >= juz.startAyah) {
      if (i === JUZ_DATA.length - 1) return juz.juzNumber;
      
      const nextJuz = JUZ_DATA[i + 1];
      if (surahNumber < nextJuz.startSurah || 
          (surahNumber === nextJuz.startSurah && ayahNumber < nextJuz.startAyah)) {
        return juz.juzNumber;
      }
    }
    
    if (surahNumber > juz.startSurah && surahNumber < juz.endSurah) {
      return juz.juzNumber;
    }
    
    if (surahNumber === juz.endSurah && ayahNumber <= juz.endAyah) {
      return juz.juzNumber;
    }
  }
  
  return 1; // Default to first juz
}

/**
 * Calculate reading progress for a Juz
 * @param juzNumber - Juz number (1-30)
 * @param completedAyahs - Number of ayahs read
 * @returns Progress percentage
 */
export function calculateJuzProgress(juzNumber: number, completedAyahs: number): number {
  const juz = getJuzByNumber(juzNumber);
  if (!juz) return 0;
  
  const progress = (completedAyahs / juz.totalAyahs) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Get recommended daily Juz for completing Quran in 30 days
 * @param day - Day number (1-30)
 * @returns Juz to read on that day
 */
export function getDailyJuz(day: number): JuzInfo | undefined {
  if (day < 1 || day > 30) return undefined;
  return getJuzByNumber(day);
}

/**
 * Create 30-day Khatam schedule
 * @param startDate - Starting date
 * @returns Array of daily reading schedule
 */
export function createKhatamSchedule(startDate: Date): Array<{
  day: number;
  date: Date;
  juz: JuzInfo;
}> {
  const schedule = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const juz = getJuzByNumber(i + 1);
    if (juz) {
      schedule.push({
        day: i + 1,
        date,
        juz,
      });
    }
  }
  
  return schedule;
}
