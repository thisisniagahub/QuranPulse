// Combined Types from Both Projects
export type Theme = 'light' | 'dark' | 'auto';

export type View = 'home' | 'quran' | 'hadith' | 'prayer' | 'more' | 'ai' | 'learning' | 'downloads' | 'bookmarks' | 'settings';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Quran Types
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  arabicName?: string;
}

export interface Ayah {
  id: number;
  verseNumber: number;
  verse_key: string;
  arabicText: string;
  translationText: string;
  text?: string; // For API compatibility
  surahNumber?: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  surah_number: number;
  surah_name: string;
  ayah_number: number;
  verse_key: string;
  arabic_text: string;
  translation_text: string;
  notes?: string;
  created_at: string;
}

// Reciter Types
export interface Reciter {
  id: number;
  name: string;
  slug: string;
  arabicName?: string;
}

// Prayer Types
export interface PrayerTime {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise?: string;
  Imsak?: string;
  Midnight?: string;
}

export interface PrayerSetting {
  enabled: boolean;
  offset: number; // minutes before prayer
}

export interface PrayerNotificationSettings {
  enabled: boolean;
  prayers: {
    imsak: PrayerSetting;
    fajr: PrayerSetting;
    dhuhr: PrayerSetting;
    asr: PrayerSetting;
    maghrib: PrayerSetting;
    isha: PrayerSetting;
  };
}

// Hadith Types
export interface HadithBook {
  id: string;
  name: string;
  nameArabic: string;
  englishName?: string;
  total: number;
  author?: string;
}

export interface Hadith {
  number: string;
  arab: string;
  malay?: string;
  english?: string;
  bookId: string;
  bookName: string;
  chapter?: string;
}

// Settings Types
export interface AppSettings {
  theme: Theme;
  fontSize: 'small' | 'medium' | 'large';
  prayer_zone: string;
  notification_settings: PrayerNotificationSettings;
  default_translation: string;
  default_reciter: number;
  auto_play_audio: boolean;
  show_transliteration: boolean;
  reading_mode: 'continuous' | 'page';
  language: 'en' | 'ms' | 'ar';
}

// User Types
export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Reading Progress Types
export interface ReadingProgress {
  id: string;
  user_id: string;
  surah_id: number;
  verse_number: number;
  progress_percentage: number;
  last_read_at: string;
}

// Audio Types
export interface Track {
  type: 'surah' | 'ayah' | 'word';
  key: string;
  src: string;
  surahName?: string;
  reciterId?: number;
}

export interface AudioState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  currentTrack: Track | null;
  isLoading: boolean;
}

// Download Types
export interface ReciterDownloadInfo {
  reciterId: number;
  reciterName: string;
  status: 'idle' | 'downloading' | 'completed' | 'error' | 'paused';
  progress: number;
  currentSurah: string;
  totalSurahs: number;
  downloadedCount: number;
  totalSize?: number;
  downloadedSize?: number;
}

// Learning Types
export interface IqraItem {
  text: string;
  reading: string; // Phonetic reading for TTS
  audioUrl?: string;
}

export interface IqraLesson {
  id: number;
  title: string;
  description?: string;
  items: IqraItem[][];
  completed?: boolean;
}

// AI Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatHistory {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Location Types
export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timezone?: string;
}

// API Response Types
export interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

// Navigation Types
export interface TabRoute {
  name: string;
  label: string;
  icon: string;
  activeIcon?: string;
}

// Notification Types
export interface NotificationData {
  id: string;
  type: 'prayer' | 'reminder' | 'achievement' | 'general';
  title: string;
  body: string;
  data?: any;
  scheduledFor?: string;
}

// Social Feature Types
export interface ReadingGroup {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  createdBy: string;
  createdAt: string;
  members: GroupMember[];
  target: GroupTarget;
  progress: GroupProgress;
  isPublic: boolean;
  isActive: boolean;
  maxMembers?: number;
  tags?: string[];
  rules?: string[];
  schedule?: GroupSchedule;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  progress: MemberProgress;
  isActive: boolean;
}

export interface GroupTarget {
  type: 'surah' | 'juz' | 'pages' | 'verses';
  amount: number;
  deadline?: string;
}

export interface GroupProgress {
  total: number;
  completed: number;
  percentage: number;
}

export interface MemberProgress {
  completed: number;
  lastRead?: string;
  streak?: number;
}

export interface GroupSchedule {
  dailyTarget: number;
  reminderTime?: string;
}

export interface GroupActivity {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  type: 'joined' | 'completed' | 'milestone' | 'message' | 'progress';
  description: string;
  timestamp: string;
  metadata?: any;
}

// Friendship Types
export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  updatedAt: string;
  friendProfile?: UserProfile;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  senderProfile?: UserProfile;
  receiverProfile?: UserProfile;
}

// Progress Sharing Types
export interface SharedProgress {
  id: string;
  userId: string;
  surahId: number;
  verseNumber: number;
  progressType: 'verse_completed' | 'surah_completed' | 'milestone' | 'streak';
  message?: string;
  isPublic: boolean;
  createdAt: string;
  likes: Like[];
  comments: Comment[];
  userProfile?: UserProfile;
}

export interface Like {
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  replies?: Comment[];
}

// Reading Challenge Types
export interface ReadingChallenge {
  id: string;
  groupId?: string;
  creatorId: string;
  title: string;
  description: string;
  challengeType: 'daily' | 'weekly' | 'monthly' | 'khatam';
  targetAmount: number;
  startDate: string;
  endDate: string;
  participants: ChallengeParticipant[];
  isActive: boolean;
  createdAt: string;
  creatorProfile?: UserProfile;
}

export interface ChallengeParticipant {
  userId: string;
  userName: string;
  progress: number;
  joinedAt: string;
}

// Social Feed Types
export interface SocialFeedItem {
  id: string;
  type: 'shared_progress' | 'group_activity' | 'challenge_update' | 'friend_joined';
  data: SharedProgress | GroupActivity | ReadingChallenge | Friendship;
  timestamp: string;
  user?: UserProfile;
}

// Social Stats Types
export interface SocialStats {
  totalFriends: number;
  totalGroups: number;
  totalChallenges: number;
  sharedProgressCount: number;
  groupProgressPercentage: number;
  challengeWins: number;
}
