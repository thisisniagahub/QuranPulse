/**
 * Iqra 1-6 Data - Learn to Read Arabic
 * Step-by-step Quranic reading lessons
 */

export interface IqraLesson {
  id: string;
  iqraBook: number; // 1-6
  lessonNumber: number;
  title: string;
  titleMalay: string;
  titleArabic: string;
  description: string;
  descriptionMalay: string;
  focus: string; // What this lesson teaches
  focusMalay: string;
  examples: string[]; // Arabic examples
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface IqraBook {
  bookNumber: number;
  title: string;
  titleMalay: string;
  titleArabic: string;
  description: string;
  descriptionMalay: string;
  totalLessons: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  objectivesMalay: string[];
}

// Iqra Books Overview
export const IQRA_BOOKS: IqraBook[] = [
  {
    bookNumber: 1,
    title: 'Iqra 1 - Basic Arabic Letters',
    titleMalay: 'Iqra 1 - Huruf Asas Arab',
    titleArabic: 'إقرأ ١ - الحروف الأساسية',
    description: 'Introduction to Arabic letters with fatha (َ) vowel',
    descriptionMalay: 'Pengenalan huruf Arab dengan baris fatha (َ)',
    totalLessons: 29,
    level: 'beginner',
    objectives: [
      'Recognize all 29 Arabic letters',
      'Read letters with fatha vowel',
      'Understand letter shapes in different positions',
    ],
    objectivesMalay: [
      'Mengenali semua 29 huruf Arab',
      'Membaca huruf dengan baris fatha',
      'Memahami bentuk huruf di kedudukan berbeza',
    ],
  },
  {
    bookNumber: 2,
    title: 'Iqra 2 - Kasrah & Dhammah',
    titleMalay: 'Iqra 2 - Kasrah & Dhammah',
    titleArabic: 'إقرأ ٢ - الكسرة والضمة',
    description: 'Learning kasrah (ِ) and dhammah (ُ) vowels with letter combinations',
    descriptionMalay: 'Belajar baris kasrah (ِ) dan dhammah (ُ) dengan gabungan huruf',
    totalLessons: 30,
    level: 'beginner',
    objectives: [
      'Master kasrah and dhammah vowels',
      'Read 2-letter combinations',
      'Practice different vowel patterns',
    ],
    objectivesMalay: [
      'Menguasai baris kasrah dan dhammah',
      'Membaca gabungan 2 huruf',
      'Berlatih pola baris berbeza',
    ],
  },
  {
    bookNumber: 3,
    title: 'Iqra 3 - Sukun & Tanwin',
    titleMalay: 'Iqra 3 - Sukun & Tanwin',
    titleArabic: 'إقرأ ٣ - السكون والتنوين',
    description: 'Introduction to sukun (ْ) and tanwin (double vowels)',
    descriptionMalay: 'Pengenalan sukun (ْ) dan tanwin (baris dua)',
    totalLessons: 30,
    level: 'intermediate',
    objectives: [
      'Understand sukun (silent letter)',
      'Read tanwin correctly',
      'Practice longer word combinations',
    ],
    objectivesMalay: [
      'Memahami sukun (huruf mati)',
      'Membaca tanwin dengan betul',
      'Berlatih gabungan perkataan yang lebih panjang',
    ],
  },
  {
    bookNumber: 4,
    title: 'Iqra 4 - Mad & Waqaf',
    titleMalay: 'Iqra 4 - Mad & Waqaf',
    titleArabic: 'إقرأ ٤ - المد والوقف',
    description: 'Learning elongation (mad) and stopping rules (waqaf)',
    descriptionMalay: 'Belajar cara memanjangkan (mad) dan berhenti (waqaf)',
    totalLessons: 28,
    level: 'intermediate',
    objectives: [
      'Master mad (elongation) rules',
      'Understand waqaf (stopping)',
      'Read with proper rhythm',
    ],
    objectivesMalay: [
      'Menguasai hukum mad (bacaan panjang)',
      'Memahami waqaf (cara berhenti)',
      'Membaca dengan irama yang betul',
    ],
  },
  {
    bookNumber: 5,
    title: 'Iqra 5 - Tasydid & Nun Sakinah',
    titleMalay: 'Iqra 5 - Tasydid & Nun Sakinah',
    titleArabic: 'إقرأ ٥ - التشديد والنون الساكنة',
    description: 'Advanced rules: tasydid (ّ), ghunnah, and nun rules',
    descriptionMalay: 'Hukum lanjutan: tasydid (ّ), ghunnah, dan hukum nun',
    totalLessons: 26,
    level: 'advanced',
    objectives: [
      'Master tasydid pronunciation',
      'Apply nun sakinah rules',
      'Understand ghunnah',
    ],
    objectivesMalay: [
      'Menguasai sebutan tasydid',
      'Mengaplikasikan hukum nun sakinah',
      'Memahami ghunnah',
    ],
  },
  {
    bookNumber: 6,
    title: 'Iqra 6 - Tajwid Basics',
    titleMalay: 'Iqra 6 - Asas Tajwid',
    titleArabic: 'إقرأ ٦ - أساسيات التجويد',
    description: 'Complete tajwid basics and Quranic reading practice',
    descriptionMalay: 'Asas tajwid lengkap dan latihan bacaan Al-Quran',
    totalLessons: 25,
    level: 'advanced',
    objectives: [
      'Master basic tajwid rules',
      'Read Quranic verses correctly',
      'Practice makhraj (pronunciation)',
    ],
    objectivesMalay: [
      'Menguasai hukum tajwid asas',
      'Membaca ayat Al-Quran dengan betul',
      'Berlatih makhraj (tempat sebutan)',
    ],
  },
];

// Sample Iqra Lessons (simplified for demo)
export const IQRA_LESSONS: IqraLesson[] = [
  // IQRA 1
  {
    id: 'iqra1_lesson1',
    iqraBook: 1,
    lessonNumber: 1,
    title: 'Letters: Ba, Ta, Tha',
    titleMalay: 'Huruf: Ba, Ta, Tsa',
    titleArabic: 'الحروف: ب ت ث',
    description: 'Learn the first three Arabic letters with fatha',
    descriptionMalay: 'Belajar tiga huruf Arab pertama dengan baris fatha',
    focus: 'Letter recognition and fatha pronunciation',
    focusMalay: 'Mengenali huruf dan sebutan baris fatha',
    examples: ['بَ', 'تَ', 'ثَ', 'بَتَ', 'تَبَ'],
    difficulty: 'beginner',
  },
  {
    id: 'iqra1_lesson2',
    iqraBook: 1,
    lessonNumber: 2,
    title: 'Letters: Jim, Ha, Kha',
    titleMalay: 'Huruf: Jim, Ha, Kho',
    titleArabic: 'الحروف: ج ح خ',
    description: 'Continue with Jim, Ha, and Kha letters',
    descriptionMalay: 'Sambung dengan huruf Jim, Ha, dan Kho',
    focus: 'Throat letters pronunciation',
    focusMalay: 'Sebutan huruf halqi (dari tekak)',
    examples: ['جَ', 'حَ', 'خَ', 'جَحَ', 'حَجَ'],
    difficulty: 'beginner',
  },
  {
    id: 'iqra1_lesson3',
    iqraBook: 1,
    lessonNumber: 3,
    title: 'Letters: Dal, Dzal',
    titleMalay: 'Huruf: Dal, Dzal',
    titleArabic: 'الحروف: د ذ',
    description: 'Learn Dal and Dzal with correct pronunciation',
    descriptionMalay: 'Belajar Dal dan Dzal dengan sebutan yang betul',
    focus: 'Dental letters from tip of tongue',
    focusMalay: 'Huruf dari hujung lidah',
    examples: ['دَ', 'ذَ', 'دَذَ', 'ذَدَ'],
    difficulty: 'beginner',
  },
  
  // IQRA 2
  {
    id: 'iqra2_lesson1',
    iqraBook: 2,
    lessonNumber: 1,
    title: 'Kasrah Introduction',
    titleMalay: 'Pengenalan Kasrah',
    titleArabic: 'مقدمة الكسرة',
    description: 'Learn kasrah (ِ) vowel with all letters',
    descriptionMalay: 'Belajar baris kasrah (ِ) dengan semua huruf',
    focus: 'Kasrah pronunciation (ee sound)',
    focusMalay: 'Sebutan kasrah (bunyi ii)',
    examples: ['بِ', 'تِ', 'ثِ', 'جِ', 'حِ'],
    difficulty: 'beginner',
  },
  {
    id: 'iqra2_lesson2',
    iqraBook: 2,
    lessonNumber: 2,
    title: 'Dhammah Introduction',
    titleMalay: 'Pengenalan Dhammah',
    titleArabic: 'مقدمة الضمة',
    description: 'Learn dhammah (ُ) vowel with all letters',
    descriptionMalay: 'Belajar baris dhammah (ُ) dengan semua huruf',
    focus: 'Dhammah pronunciation (oo sound)',
    focusMalay: 'Sebutan dhammah (bunyi uu)',
    examples: ['بُ', 'تُ', 'ثُ', 'جُ', 'حُ'],
    difficulty: 'beginner',
  },

  // IQRA 3
  {
    id: 'iqra3_lesson1',
    iqraBook: 3,
    lessonNumber: 1,
    title: 'Sukun Basics',
    titleMalay: 'Asas Sukun',
    titleArabic: 'أساسيات السكون',
    description: 'Understanding sukun (ْ) - the silent marker',
    descriptionMalay: 'Memahami sukun (ْ) - tanda mati',
    focus: 'Silent letters and stopping',
    focusMalay: 'Huruf mati dan cara berhenti',
    examples: ['بْ', 'تْ', 'مَنْ', 'عَنْ'],
    difficulty: 'intermediate',
  },
  {
    id: 'iqra3_lesson2',
    iqraBook: 3,
    lessonNumber: 2,
    title: 'Tanwin Fatha',
    titleMalay: 'Tanwin Fathah',
    titleArabic: 'التنوين بالفتح',
    description: 'Learning double fatha (ً) for an/en sound',
    descriptionMalay: 'Belajar tanwin fathah (ً) untuk bunyi an',
    focus: 'Tanwin pronunciation',
    focusMalay: 'Sebutan tanwin',
    examples: ['بَـً', 'تَـً', 'أَحَدً', 'كِتَابً'],
    difficulty: 'intermediate',
  },

  // IQRA 4
  {
    id: 'iqra4_lesson1',
    iqraBook: 4,
    lessonNumber: 1,
    title: 'Mad Thobi\'i',
    titleMalay: 'Mad Thobi\'i',
    titleArabic: 'المد الطبيعي',
    description: 'Natural elongation - 2 counts',
    descriptionMalay: 'Bacaan panjang asli - 2 harakat',
    focus: 'Alif, Waw, Ya elongation',
    focusMalay: 'Mad dengan Alif, Wau, Ya',
    examples: ['قَالَ', 'يَقُولُ', 'فِي', 'مَا'],
    difficulty: 'intermediate',
  },

  // IQRA 5
  {
    id: 'iqra5_lesson1',
    iqraBook: 5,
    lessonNumber: 1,
    title: 'Tasydid Rules',
    titleMalay: 'Hukum Tasydid',
    titleArabic: 'أحكام التشديد',
    description: 'Double pronunciation with tasydid (ّ)',
    descriptionMalay: 'Sebutan berganda dengan tasydid (ّ)',
    focus: 'Stressed consonants',
    focusMalay: 'Huruf yang ditekankan',
    examples: ['رَبّ', 'حَقّ', 'إِنَّ', 'كُلّ'],
    difficulty: 'advanced',
  },

  // IQRA 6
  {
    id: 'iqra6_lesson1',
    iqraBook: 6,
    lessonNumber: 1,
    title: 'Tajwid Overview',
    titleMalay: 'Gambaran Tajwid',
    titleArabic: 'نظرة عامة على التجويد',
    description: 'Complete introduction to tajwid science',
    descriptionMalay: 'Pengenalan lengkap ilmu tajwid',
    focus: 'Makhraj and sifat of letters',
    focusMalay: 'Makhraj dan sifat huruf',
    examples: ['بِسْمِ اللَّهِ', 'ٱلْحَمْدُ لِلَّهِ'],
    difficulty: 'advanced',
  },
];

/**
 * Get Iqra book by number
 */
export function getIqraBook(bookNumber: number): IqraBook | undefined {
  return IQRA_BOOKS.find(book => book.bookNumber === bookNumber);
}

/**
 * Get all lessons for an Iqra book
 */
export function getLessonsByBook(bookNumber: number): IqraLesson[] {
  return IQRA_LESSONS.filter(lesson => lesson.iqraBook === bookNumber);
}

/**
 * Get specific lesson
 */
export function getLesson(bookNumber: number, lessonNumber: number): IqraLesson | undefined {
  return IQRA_LESSONS.find(
    lesson => lesson.iqraBook === bookNumber && lesson.lessonNumber === lessonNumber
  );
}

/**
 * Calculate progress for an Iqra book
 */
export function calculateBookProgress(bookNumber: number, completedLessons: number): number {
  const book = getIqraBook(bookNumber);
  if (!book) return 0;
  
  const progress = (completedLessons / book.totalLessons) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Get next lesson
 */
export function getNextLesson(currentBook: number, currentLesson: number): IqraLesson | null {
  const book = getIqraBook(currentBook);
  if (!book) return null;

  // Check if there's next lesson in current book
  if (currentLesson < book.totalLessons) {
    const nextLesson = getLesson(currentBook, currentLesson + 1);
    if (nextLesson) return nextLesson;
  }

  // Move to next book
  if (currentBook < 6) {
    const firstLessonNextBook = getLesson(currentBook + 1, 1);
    if (firstLessonNextBook) return firstLessonNextBook;
  }

  return null; // Completed all Iqra!
}

/**
 * Get recommended daily practice
 */
export function getDailyPractice(bookNumber: number): {
  duration: number; // minutes
  repetitions: number;
  focus: string;
  focusMalay: string;
} {
  const book = getIqraBook(bookNumber);
  if (!book) {
    return {
      duration: 15,
      repetitions: 3,
      focus: 'Basic practice',
      focusMalay: 'Latihan asas',
    };
  }

  switch (book.level) {
    case 'beginner':
      return {
        duration: 15,
        repetitions: 5,
        focus: 'Repeat each letter 5 times clearly',
        focusMalay: 'Ulang setiap huruf 5 kali dengan jelas',
      };
    case 'intermediate':
      return {
        duration: 20,
        repetitions: 4,
        focus: 'Practice word combinations slowly',
        focusMalay: 'Latih gabungan perkataan dengan perlahan',
      };
    case 'advanced':
      return {
        duration: 25,
        repetitions: 3,
        focus: 'Read with proper tajwid and rhythm',
        focusMalay: 'Baca dengan tajwid dan irama yang betul',
      };
  }
}
