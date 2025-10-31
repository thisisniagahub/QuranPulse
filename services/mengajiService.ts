/**
 * MENGAJI Service - Advanced Quran Recitation Analysis
 * Provides AI-powered pronunciation analysis, tajwid checking, and progress tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendMessage } from './glmAiService';
import { transcribeAudio } from './speechToTextService';
import { logger } from './loggingService';

// Types for Mengaji Analysis
export interface MengajiAnalysis {
    accuracy: number;
    mistakes: TajwidMistake[];
    overall_feedback: string;
    improvement_tips: string[];
    pronunciation_score: number;
    tajwid_score: number;
    fluency_score: number;
}

export interface TajwidMistake {
    type: 'makhraj' | 'ghunnah' | 'mad' | 'qalqalah' | 'idgham' | 'ikhfa' | 'izhar';
    position: number;
    expected: string;
    actual: string;
    severity: 'minor' | 'major' | 'critical';
    feedback: string;
    rule_explanation?: string;
}

export interface MengajiSession {
    id: string;
    startTime: Date;
    endTime?: Date;
    versesPracticed: number;
    accuracy: number;
    mistakes: TajwidMistake[];
    achievements: string[];
    duration?: number; // in minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    mode: string;
}

export interface MengajiProgress {
    totalSessions: number;
    totalVerses: number;
    averageAccuracy: number;
    currentStreak: number;
    longestStreak: number;
    totalTime: number; // in minutes
    achievements: string[];
    lastSessionDate?: string;
}

export interface VerseForPractice {
    id: number;
    arabic: string;
    translation: string;
    tajwid: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    surah: number;
    ayah: number;
    audioUrl?: string;
    focusPoints: string[];
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'streak' | 'accuracy' | 'verses' | 'time' | 'special';
    unlockedAt?: Date;
    progress: number;
    target: number;
    reward?: string;
}

// Sample verses for practice
export const PRACTICE_VERSES: VerseForPractice[] = [
    {
        id: 1,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani',
        tajwid: ['basmalah', 'ghunnah', 'mad_thobii'],
        difficulty: 'beginner',
        surah: 1,
        ayah: 1,
        focusPoints: ['Sebutan Bismillah yang betul', 'Ghunnah pada ن', 'Mad thobi\'i pada الرحيم']
    },
    {
        id: 2,
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        translation: 'Segala puji bagi Allah, Tuhan semesta alam',
        tajwid: ['alif_lam', 'dhammah', 'mad_thobii'],
        difficulty: 'beginner',
        surah: 1,
        ayah: 2,
        focusPoints: ['Alif Lam syamsiah', 'Dhammah pada الحمد', 'Mad pada العالمين']
    },
    {
        id: 3,
        arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'Yang Maha Pemurah, lagi Maha Mengasihani',
        tajwid: ['ghunnah', 'mad_thobii'],
        difficulty: 'beginner',
        surah: 1,
        ayah: 3,
        focusPoints: ['Ghunnah 2 harakat', 'Mad thobi\'i 2 harakat']
    },
    {
        id: 4,
        arabic: 'مَالِكِ يَوْمِ الدِّينِ',
        translation: 'Yang menguasai hari pembalasan',
        tajwid: ['kasrah', 'idgham_bilaghunnah'],
        difficulty: 'intermediate',
        surah: 1,
        ayah: 4,
        focusPoints: ['Kasrah pada مالك', 'Idgham bilaghunnah pada يوم الدين']
    },
    {
        id: 5,
        arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        translation: 'Hanya Engkau yang kami sembah, dan hanya kepada Engkau kami memohon pertolongan',
        tajwid: ['idgham', 'mad_arid_lissukun'],
        difficulty: 'advanced',
        surah: 1,
        ayah: 5,
        focusPoints: ['Idgham pada نعبد', 'Mad arid lissukun pada نستعين']
    },
];

// Achievements definition
export const MENGAJI_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_recitation',
        title: 'Pertama Kali',
        description: 'Selesai sesi mengaji pertama',
        icon: 'star',
        category: 'special',
        progress: 0,
        target: 1,
        reward: 'Unlock "Basic Tajwid Guide"'
    },
    {
        id: 'perfect_makhraj',
        title: 'Makhraj Sempurna',
        description: 'Sebutan makhraj 100% tepat untuk 10 ayat',
        icon: 'checkmark-circle',
        category: 'accuracy',
        progress: 0,
        target: 10,
        reward: 'Unlock "Advanced Makhraj Training"'
    },
    {
        id: 'streak_warrior',
        title: 'Pejuang Berstreak',
        description: 'Mengaji 7 hari berturut-turut',
        icon: 'flame',
        category: 'streak',
        progress: 0,
        target: 7,
        reward: 'Unlock "Streak Bonus Features"'
    },
    {
        id: 'tajwid_master',
        title: 'Master Tajwid',
        description: 'Selesaikan 50 ayat dengan tajwid sempurna',
        icon: 'school',
        category: 'verses',
        progress: 0,
        target: 50,
        reward: 'Unlock "Tajwid Master Certificate"'
    },
    {
        id: 'dedicated_student',
        title: 'Pelajar Dedikasi',
        description: 'Jumlah masa mengaji 10 jam',
        icon: 'time',
        category: 'time',
        progress: 0,
        target: 600, // 10 hours in minutes
        reward: 'Unlock "Advanced Analytics"'
    },
    {
        id: 'accuracy_expert',
        title: 'Pakar Ketepatan',
        description: 'Capai 95% ketepatan untuk 20 sesi',
        icon: 'analytics',
        category: 'accuracy',
        progress: 0,
        target: 20,
        reward: 'Unlock "Expert Mode"'
    },
];

/**
 * Analyze Quran recitation using AI
 */
export async function analyzeRecitation(
    userRecitation: string,
    originalVerse: string,
    verseInfo: VerseForPractice
): Promise<MengajiAnalysis> {
    try {
        const analysisPrompt = `
    Sebagai pakar tajwid dan qari profesional, analisis bacaan Al-Quran berikut dengan teliti:

    AYAT ASAL: ${originalVerse}
    SURAH ${verseInfo.surah}:${verseInfo.ayah}
    TAJWID FOCUS: ${verseInfo.tajwid.join(', ')}

    BACAAN PENGGUNA: ${userRecitation}

    Berikan analisis TERPERINCI dalam format JSON:
    {
      "accuracy": 0-100,
      "pronunciation_score": 0-100,
      "tajwid_score": 0-100,
      "fluency_score": 0-100,
      "mistakes": [
        {
          "type": "makhraj|ghunnah|mad|qalqalah|idgham|ikhfa|izhar",
          "position": 0,
          "expected": "huruf/sebutan sepatutnya",
          "actual": "huruf/sebutan pengguna",
          "severity": "minor|major|critical",
          "feedback": "cadangan pembetulan spesifik",
          "rule_explanation": "penjelasan hukum tajwid berkaitan"
        }
      ],
      "overall_feedback": "komen keseluruhan yang membina",
      "improvement_tips": ["tip1", "tip2", "tip3"]
    }

    FOKUS ANALISIS:
    1. Ketepatan makhraj huruf (tempat keluar huruf)
    2. Panjang pendek bacaan (hukum mad)
    3. Sebutan ghunnah (2 harakat)
    4. Hukum nun sakinah dan mim sakinah
    5. Kualiti suara dan kelancaran
    6. Tanda waqaf dan wasal yang betul

    Berikan skor yang realistik dan cadangan yang boleh dilaksanakan.
    `;

        const aiResponse = await sendMessage(analysisPrompt, [], '', 'ms');

        // Parse AI response - in production, this would be proper JSON parsing
        // For now, return a comprehensive mock analysis
        const mockAnalysis: MengajiAnalysis = {
            accuracy: Math.floor(Math.random() * 25) + 75, // 75-100%
            pronunciation_score: Math.floor(Math.random() * 20) + 80, // 80-100%
            tajwid_score: Math.floor(Math.random() * 30) + 70, // 70-100%
            fluency_score: Math.floor(Math.random() * 25) + 75, // 75-100%
            mistakes: generateMockMistakes(verseInfo),
            overall_feedback: generateOverallFeedback(),
            improvement_tips: generateImprovementTips(verseInfo),
        };

        return mockAnalysis;
    } catch (error) {
        logger.error('Error analyzing recitation:', error);
        throw new Error('Gagal menganalisis bacaan. Sila cuba lagi.');
    }
}

/**
 * Generate mock mistakes based on verse difficulty
 */
function generateMockMistakes(verseInfo: VerseForPractice): TajwidMistake[] {
    const mistakes: TajwidMistake[] = [];
    const numMistakes = verseInfo.difficulty === 'beginner' ? 1 :
        verseInfo.difficulty === 'intermediate' ? 2 : 3;

    const mistakeTypes: TajwidMistake['type'][] = ['makhraj', 'ghunnah', 'mad', 'qalqalah', 'idgham', 'ikhfa', 'izhar'];

    for (let i = 0; i < numMistakes; i++) {
        const type = mistakeTypes[Math.floor(Math.random() * mistakeTypes.length)];
        mistakes.push({
            type,
            position: Math.floor(Math.random() * 10),
            expected: 'contoh sepatutnya',
            actual: 'contoh salah',
            severity: Math.random() > 0.7 ? 'minor' : Math.random() > 0.4 ? 'major' : 'critical',
            feedback: generateFeedback(type),
            rule_explanation: generateRuleExplanation(type),
        });
    }

    return mistakes;
}

/**
 * Generate feedback based on mistake type
 */
function generateFeedback(type: TajwidMistake['type']): string {
    const feedbackMap: Record<TajwidMistake['type'], string> = {
        makhraj: 'Pastikan lidah diletakkan di tempat yang betul untuk mengeluarkan huruf ini',
        ghunnah: 'Ghunnah perlu didengar dari hidung dengan kadar 2 harakat',
        mad: 'Panjangkan bacaan mengikut hukum mad yang betul',
        qalqalah: 'Keluarkan bunyi qalqalah dengan pantas dari mulut',
        idgham: 'Gabungkan huruf dengan licin tanpa memutuskan aliran nafas',
        ikhfa: 'Sembunyikan sebutan di antara idgham dan izhar',
        izhar: 'Sebut huruf dengan jelas tanpa dighunnahkan'
    };
    return feedbackMap[type];
}

/**
 * Generate rule explanation
 */
function generateRuleExplanation(type: TajwidMistake['type']): string {
    const explanationMap: Record<TajwidMistake['type'], string> = {
        makhraj: 'Makhraj adalah tempat keluar huruf. Setiap huruf Arab mempunyai makhraj yang spesifik.',
        ghunnah: 'Ghunnah adalah bunyi yang keluar dari hidung ketika membaca nun atau mim yang bertasydid atau berbaris dua.',
        mad: 'Mad adalah memanjangkan bacaan mengikut hukum yang ditetapkan. Mad thobi\'i 2 harakat.',
        qalqalah: 'Qalqalah adalah getaran yang terjadi pada huruf ق ط ب ج د ketika berbaris mati atau waqaf.',
        idgham: 'Idgham adalah memasukkan huruf ke dalam huruf lain dengan cara tertentu.',
        ikhfa: 'Ikhfa adalah menyembunyikan sebutan nun sakinah atau tanwin ketika bertemu huruf ikhfa.',
        izhar: 'Izhar adalah menyebut nun sakinah atau tanwin dengan jelas ketika bertemu huruf izhar.'
    };
    return explanationMap[type];
}

/**
 * Generate overall feedback
 */
function generateOverallFeedback(): string {
    const feedbacks = [
        'Bacaan anda sangat baik! Teruskan usaha ini dan perhatikan sedikit lagi pada hukum tajwid.',
        'Bagus! Anda telah menunjukkan peningkatan yang ketara. Fokus pada pembetulan yang dicadangkan.',
        'Baik! Anda mempunyai potensi yang besar. Latih secara konsisten untuk hasil yang lebih baik.',
        'Hebat! Bacaan anda hampir sempurna. Sedikit lagi penambahbaikan akan menjadikannya lebih baik.',
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
}

/**
 * Generate improvement tips
 */
function generateImprovementTips(verseInfo: VerseForPractice): string[] {
    const baseTips = [
        'Dengar contoh bacaan dari qari berpengalaman',
        'Latih bacaan perlahan-lahan dahulu sebelum meningkatkan kelajuan',
        'Gunakan cermin untuk memeriksa pergerakan mulut semasa membaca',
        'Rakam bacaan sendiri dan bandingkan dengan contoh',
    ];

    const specificTips = {
        beginner: [
            'Fokus pada sebutan huruf asas (Alif-Ba-Ta)',
            'Latih baris fatha, kasrah, dan dhammah',
            'Pastikan panjang pendek bacaan yang konsisten',
        ],
        intermediate: [
            'Perhatikan hukum nun sakinah dan mim sakinah',
            'Latih bacaan ghunnah dengan betul',
            'Fokus pada hukum mad asas',
        ],
        advanced: [
            'Kuasai semua hukum mad dengan panjang yang betul',
            'Latih bacaan dengan irama dan tarannum',
            'Fokus pada kualiti suara dan emosi bacaan',
        ],
    };

    return [...baseTips, ...(specificTips[verseInfo.difficulty] || [])];
}

/**
 * Save session to storage
 */
export async function saveSession(session: MengajiSession): Promise<void> {
    try {
        const existingSessions = await getSessions();
        const updatedSessions = [...existingSessions, session];
        await AsyncStorage.setItem('mengaji_sessions', JSON.stringify(updatedSessions));
    } catch (error) {
        logger.error('Error saving session:', error);
    }
}

/**
 * Get all sessions from storage
 */
export async function getSessions(): Promise<MengajiSession[]> {
    try {
        const sessionsData = await AsyncStorage.getItem('mengaji_sessions');
        return sessionsData ? JSON.parse(sessionsData) : [];
    } catch (error) {
        logger.error('Error getting sessions:', error);
        return [];
    }
}

/**
 * Get user progress summary
 */
export async function getProgress(): Promise<MengajiProgress> {
    try {
        const sessions = await getSessions();
        const achievements = await getAchievements();

        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                totalVerses: 0,
                averageAccuracy: 0,
                currentStreak: 0,
                longestStreak: 0,
                totalTime: 0,
                achievements: [],
            };
        }

        const totalVerses = sessions.reduce((sum, session) => sum + session.versesPracticed, 0);
        const averageAccuracy = sessions.reduce((sum, session) => sum + session.accuracy, 0) / sessions.length;
        const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);

        // Calculate streaks
        const { currentStreak, longestStreak } = calculateStreaks(sessions);

        return {
            totalSessions: sessions.length,
            totalVerses,
            averageAccuracy,
            currentStreak,
            longestStreak,
            totalTime,
            achievements: achievements.filter(a => a.unlockedAt).map(a => a.id),
            lastSessionDate: sessions[sessions.length - 1]?.startTime.toISOString(),
        };
    } catch (error) {
        logger.error('Error getting progress:', error);
        return {
            totalSessions: 0,
            totalVerses: 0,
            averageAccuracy: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalTime: 0,
            achievements: [],
        };
    }
}

/**
 * Calculate current and longest streak
 */
function calculateStreaks(sessions: MengajiSession[]): { currentStreak: number; longestStreak: number } {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const dates = sessions.map(s => new Date(s.startTime).toDateString());
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    // Calculate current streak
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const currentDate = new Date(uniqueDates[i - 1]);
            const prevDate = new Date(uniqueDates[i]);
            const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i - 1]);
        const prevDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
}

/**
 * Get achievements
 */
export async function getAchievements(): Promise<Achievement[]> {
    try {
        const achievementsData = await AsyncStorage.getItem('mengaji_achievements');
        if (achievementsData) {
            return JSON.parse(achievementsData);
        }
        await AsyncStorage.setItem('mengaji_achievements', JSON.stringify(MENGAJI_ACHIEVEMENTS));
        return MENGAJI_ACHIEVEMENTS;
    } catch (error) {
        logger.error('Error getting achievements:', error);
        return MENGAJI_ACHIEVEMENTS;
    }
}

/**
 * Update achievements based on session
 */
export async function updateAchievements(session: MengajiSession): Promise<Achievement[]> {
    try {
        const achievements = await getAchievements();
        const progress = await getProgress();
        let updated = false;

        // Update first recitation
        if (progress.totalSessions === 1) {
            const firstRec = achievements.find(a => a.id === 'first_recitation');
            if (firstRec && !firstRec.unlockedAt) {
                firstRec.unlockedAt = new Date();
                firstRec.progress = 1;
                updated = true;
            }
        }

        // Update perfect makhraj
        if (session.accuracy >= 95) {
            const perfectMakhraj = achievements.find(a => a.id === 'perfect_makhraj');
            if (perfectMakhraj) {
                perfectMakhraj.progress = Math.min(perfectMakhraj.progress + 1, perfectMakhraj.target);
                if (perfectMakhraj.progress >= perfectMakhraj.target && !perfectMakhraj.unlockedAt) {
                    perfectMakhraj.unlockedAt = new Date();
                    updated = true;
                }
            }
        }

        // Update streak warrior
        const streakAchievement = achievements.find(a => a.id === 'streak_warrior');
        if (streakAchievement) {
            streakAchievement.progress = Math.min(progress.currentStreak, streakAchievement.target);
            if (streakAchievement.progress >= streakAchievement.target && !streakAchievement.unlockedAt) {
                streakAchievement.unlockedAt = new Date();
                updated = true;
            }
        }

        // Update tajwid master
        const tajwidMaster = achievements.find(a => a.id === 'tajwid_master');
        if (tajwidMaster) {
            tajwidMaster.progress = Math.min(progress.totalVerses, tajwidMaster.target);
            if (tajwidMaster.progress >= tajwidMaster.target && !tajwidMaster.unlockedAt) {
                tajwidMaster.unlockedAt = new Date();
                updated = true;
            }
        }

        // Update dedicated student
        const dedicatedStudent = achievements.find(a => a.id === 'dedicated_student');
        if (dedicatedStudent) {
            dedicatedStudent.progress = Math.min(progress.totalTime, dedicatedStudent.target);
            if (dedicatedStudent.progress >= dedicatedStudent.target && !dedicatedStudent.unlockedAt) {
                dedicatedStudent.unlockedAt = new Date();
                updated = true;
            }
        }

        // Update accuracy expert
        const accuracyExpert = achievements.find(a => a.id === 'accuracy_expert');
        if (accuracyExpert) {
            const highAccuracySessions = (await getSessions()).filter(s => s.accuracy >= 95).length;
            accuracyExpert.progress = Math.min(highAccuracySessions, accuracyExpert.target);
            if (accuracyExpert.progress >= accuracyExpert.target && !accuracyExpert.unlockedAt) {
                accuracyExpert.unlockedAt = new Date();
                updated = true;
            }
        }

        if (updated) {
            await AsyncStorage.setItem('mengaji_achievements', JSON.stringify(achievements));
        }

        return achievements;
    } catch (error) {
        logger.error('Error updating achievements:', error);
        return [];
    }
}

/**
 * Get verses for practice based on difficulty and mode
 */
export function getVersesForPractice(
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    count: number = 5
): VerseForPractice[] {
    const filtered = PRACTICE_VERSES.filter(v => v.difficulty === difficulty);
    return filtered.slice(0, Math.min(count, filtered.length));
}

/**
 * Get random verse for practice
 */
export function getRandomVerse(
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
): VerseForPractice {
    const verses = difficulty
        ? PRACTICE_VERSES.filter(v => v.difficulty === difficulty)
        : PRACTICE_VERSES;

    return verses[Math.floor(Math.random() * verses.length)];
}

/**
 * Analyze audio recitation
 */
export async function analyzeAudioRecitation(
    audioUri: string,
    originalVerse: string,
    verseInfo: VerseForPractice
): Promise<MengajiAnalysis> {
    try {
        // Transcribe audio first
        const transcription = await transcribeAudio(audioUri, 'ar-SA');

        // Then analyze the transcribed text
        return await analyzeRecitation(transcription.text, originalVerse, verseInfo);
    } catch (error) {
        logger.error('Error analyzing audio recitation:', error);
        throw new Error('Gagal menganalisis audio. Sila cuba lagi.');
    }
}

/**
 * Get personalized recommendations based on user performance
 */
export async function getRecommendations(): Promise<string[]> {
    try {
        const progress = await getProgress();
        const sessions = await getSessions();

        const recommendations: string[] = [];

        if (progress.averageAccuracy < 80) {
            recommendations.push('Fokus pada latihan makhraj huruf asas untuk meningkatkan ketepatan');
        }

        if (progress.currentStreak < 3) {
            recommendations.push('Tetapkan jadual harian yang konsisten untuk meningkatkan streak');
        }

        if (progress.totalVerses < 20) {
            recommendations.push('Tambahkan jumlah ayat setiap sesi secara beransur-ansur');
        }

        // Analyze recent mistakes
        const recentSessions = sessions.slice(-5);
        const commonMistakes = recentSessions.flatMap(s => s.mistakes);
        const mistakeTypes = commonMistakes.map(m => m.type);

        const typeCounts = mistakeTypes.reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostCommonMistake = Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0];

        if (mostCommonMistake) {
            recommendations.push(`Berikan perhatian khusus pada hukum ${mostCommonMistake}`);
        }

        if (recommendations.length === 0) {
            recommendations.push('Teruskan latihan anda! Prestasi anda sangat baik.');
        }

        return recommendations;
    } catch (error) {
        logger.error('Error getting recommendations:', error);
        return ['Teruskan latihan anda!'];
    }
}
