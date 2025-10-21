# 💚💙 QuranPulse - Your Spiritual Companion

<div align="center">

```
   ∿∿∿   QuranPulse
  Follow the pulse of the Quran
```

![Version](https://img.shields.io/badge/version-2.1.0-0f5132.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-0dcaf0.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.79-0dcaf0.svg)
![Expo](https://img.shields.io/badge/Expo-54.0-0f5132.svg)
![Tests](https://img.shields.io/badge/tests-35%20passing-10B981.svg)
![Coverage](https://img.shields.io/badge/coverage-20%25-F59E0B.svg)

**Your modern spiritual companion featuring AI guidance, interactive learning, and advanced Quran recitation analysis**

🎨 **Design:** Dark mode gradient (Hijau #0f5132 → Biru #0dcaf0)  
✨ **Typography:** Poppins (Modern) + Amiri (Islamic)  
💫 **Features:** AI Assistant • Prayer Times • Karaoke Quran • Hadith Collections • MENGAJI Analysis

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📱 About QuranPulse

**QuranPulse** is your modern spiritual companion - a next-generation Quran app that brings Islamic learning to life with:

- 🎤 **Karaoke-Style Learning**: Word-by-word highlighting synchronized with audio
- 📖 **Transliteration Rumi**: Jawi-style pronunciation guide for beginners
- 🤖 **AI Islamic Assistant**: Powered by GLM-4.6 for instant answers
- 🎓 **MENGAJI Analysis**: Advanced Quran recitation analysis with AI feedback
- 🎨 **Spiritual Design**: Calming green-to-cyan gradient with pulse animations

Built with cutting-edge technologies:
- ✅ **React Native + Expo** for cross-platform mobile development
- ✅ **Supabase** for backend, authentication, and real-time sync
- ✅ **GLM-4.6 AI** (Z.AI) for Islamic Q&A and intelligent assistance
- ✅ **Clean Architecture** with TypeScript for maintainability

---

## ✨ Features

### 🎓 MENGAJI - Advanced Quran Recitation Analysis (NEW!)
- **AI-Powered Pronunciation Analysis**: Get instant feedback on your recitation accuracy
- **Tajwid Rule Checking**: Identifies mistakes in makhraj, ghunnah, mad, qalqalah, idgham, ikhfa, and izhar
- **Multiple Practice Modes**: Beginner, intermediate, and advanced difficulty levels
- **Audio Recording & Playback**: High-quality recording with analysis capabilities
- **Progress Tracking**: Track sessions, accuracy, streaks, and total practice time
- **Achievement System**: 6 unlockable achievements with rewards (First Recitation, Perfect Makhraj, Streak Warrior, etc.)
- **Personalized Recommendations**: AI-generated tips based on your performance
- **Reference Audio**: Listen to professional reciters for comparison
- **Offline Support**: Save sessions and achievements locally

### 🎤 Karaoke-Style Quran Reader
- **Word-by-word highlighting** synchronized with audio - macam karaoke!
- **Transliteration Rumi** dengan ejaan Jawi-style
- Complete 114 Surahs with Arabic text and translations
- **8+ Professional Reciters** (Mishary Al-Afasy, Abdul Basit, etc.)
- **Real-time progress tracking** with visual feedback
- **Tafsir Ibn Kathir** integrated
- Advanced bookmarks with personal notes
- Playback speed control (0.5x - 2x)
- Search functionality (Arabic & translation)
- Beautiful Arabic typography with Amiri font

### 🤖 AI Assistant (GLM-4.6)
- **Islamic knowledge Q&A** powered by GLM-4.6
- Context-aware responses with Quranic references
- Supports English & Malay languages
- Verse explanations and interpretations
- Chat history synced across devices
- Markdown-formatted responses

### 📚 Hadith Collections
- **2 Most Authentic Hadith Books**:
  - **Sahih Bukhari** (7,563 hadith) - The most authentic collection after the Quran
  - **Sahih Muslim** (7,563 hadith) - Second most authentic collection of hadith
- **Premium Features**:
  - Arabic text with Malay translations
  - Bookmark favorite Hadith with personal notes
  - Advanced search across both collections
  - Categorization by themes (faith, prayer, character, etc.)
  - Daily hadith notifications
  - Share hadith with family and friends
- **Scholarly Verification**:
  - All hadith verified by JAKIM (Jabatan Kemajuan Islam Malaysia)
  - Chain of narrators (isnad) information
  - Hadith authenticity grading

### 🕌 Prayer Features
- **Location-based prayer times** (Malaysia zones supported)
- **Smart notifications** with customizable offsets
- Qibla compass with GPS
- Prayer tracking and history
- Hijri calendar display
- Next prayer countdown

### 🎓 Learning Modules
- **Iqra' Lessons** - Learn to read Arabic
- **Mukaddam Practice** - Tajweed practice
- Text-to-Speech for pronunciation
- Progress tracking
- Interactive lessons

### 🎨 User Experience
- **Dark/Light themes** with auto-switching
- **Customizable font sizes**
- RTL support for Arabic
- Smooth animations
- Haptic feedback
- Gesture controls
- Beautiful mobile UI

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your mobile device (for testing)

### Step 1: Clone and Install

```bash
cd Al-Quran-Mobile-Merged
npm install
# or
yarn install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://ikvufrrmbmipzxppdrpy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GLM-4.6 AI Configuration
EXPO_PUBLIC_GLM_API_KEY=your_glm_api_key
EXPO_PUBLIC_GLM_API_URL=https://open.bigmodel.cn/api/paas/v4

# API Endpoints (defaults provided)
EXPO_PUBLIC_QURAN_API_BASE=https://api.alquran.cloud/v1
EXPO_PUBLIC_PRAYER_API_BASE=https://api.aladhan.com/v1
EXPO_PUBLIC_HADITH_API_BASE=https://api.hadith.gading.dev

# Feature Flags
EXPO_PUBLIC_ENABLE_AI_CHAT=true
EXPO_PUBLIC_ENABLE_OFFLINE_MODE=true
EXPO_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### Step 3: Setup Supabase Database

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL,
  surah_name TEXT NOT NULL,
  ayah_number INTEGER NOT NULL,
  verse_key TEXT NOT NULL,
  arabic_text TEXT NOT NULL,
  translation_text TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_key)
);

-- Reading progress table
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_id INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  progress_percentage FLOAT DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, surah_id)
);

-- Chat history table
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- App settings table
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  font_size TEXT DEFAULT 'medium',
  prayer_zone TEXT DEFAULT 'WLY01',
  notification_settings JSONB,
  default_translation TEXT DEFAULT 'en.asad',
  default_reciter INTEGER DEFAULT 7,
  auto_play_audio BOOLEAN DEFAULT false,
  show_transliteration BOOLEAN DEFAULT false,
  reading_mode TEXT DEFAULT 'continuous',
  language TEXT DEFAULT 'en',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Social features tables
CREATE TABLE reading_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  members JSONB DEFAULT '[]',
  target JSONB,
  progress JSONB,
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  max_members INTEGER,
  tags JSONB,
  rules JSONB,
  schedule JSONB
);

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  friend_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON reading_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON reading_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat history" ON chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat history" ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat history" ON chat_history FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON app_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON app_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON app_settings FOR UPDATE USING (auth.uid() = user_id);
```

### Step 4: Run the App

```bash
# Start Expo development server
npm start
# or
yarn start

# Run on specific platform
npm run android
npm run ios
npm run web
```

### Step 5: Test on Device

1. Install **Expo Go** app on your mobile device
2. Scan the QR code from the terminal
3. The app will load on your device

---

## 🏗 Architecture

### Project Structure

```
Al-Quran-Mobile-Merged/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home/Dashboard
│   │   ├── quran.tsx        # Quran reader
│   │   ├── hadith.tsx       # Hadith collections
│   │   ├── prayer.tsx       # Prayer times
│   │   ├── social.tsx       # Social features
│   │   ├── more.tsx         # More options
│   │   └── ustaz-ai.tsx     # AI Assistant
│   ├── mengaji.tsx          # MENGAJI recitation analysis
│   ├── iqra.tsx             # Iqra lessons
│   ├── surah/[id].tsx       # Surah detail screen
│   └── _layout.tsx          # Root layout
├── components/              # Reusable UI components
│   ├── quran/              # Quran-specific components
│   ├── hadith/             # Hadith components
│   ├── prayer/             # Prayer components
│   ├── mengaji/            # MENGAJI components
│   ├── social/             # Social components
│   └── ui/                 # Generic UI components
├── services/               # API and business logic
│   ├── supabaseClient.ts  # Supabase configuration
│   ├── glmAiService.ts    # GLM-4.6 AI integration
│   ├── mengajiService.ts  # MENGAJI analysis service
│   ├── mengajiAudioService.ts # Audio recording service
│   ├── quranApi.ts        # Quran API service
│   ├── prayerApi.ts       # Prayer times API
│   ├── hadithApi.ts       # Hadith API service
│   └── audioService.ts    # Audio playback service
├── contexts/              # React contexts
│   ├── AuthContext.tsx   # Authentication state
│   ├── AudioContext.tsx  # Audio player state
│   └── SettingsContext.tsx # App settings
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useBookmarks.ts
│   ├── useAudio.ts
│   ├── usePrayer.ts
│   └── useMengaji.ts
├── constants/            # Static data and configurations
│   ├── surahs.ts        # 114 Surahs data
│   ├── reciters.ts      # Reciter information
│   ├── prayerZones.ts   # Malaysia prayer zones
│   └── iqraData.ts      # Iqra lesson data
├── types/               # TypeScript type definitions
│   └── index.ts
└── assets/             # Images, fonts, etc.
```

### Technology Stack

| Technology | Purpose |
|------------|---------|
| **React Native** | Cross-platform mobile framework |
| **Expo** | Development platform and tooling |
| **TypeScript** | Type safety and better DX |
| **Supabase** | Backend, database, and auth |
| **GLM-4.6 (Z.AI)** | AI-powered Islamic Q&A |
| **Expo Router** | File-based routing |
| **Expo AV** | Audio recording and playback |
| **Axios** | HTTP client for API calls |
| **AsyncStorage** | Local data persistence |
| **Expo Location** | GPS and location services |
| **Expo Notifications** | Push notifications |

---

## 🔑 API Keys Setup

### Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get your URL and anon key from Project Settings → API
4. Run the SQL commands above to create tables

### GLM-4.6 (Z.AI)
1. Get your API Key from [Zhipu AI Open Platform](https://open.bigmodel.cn/)
3. Endpoint: `https://open.bigmodel.cn/api/paas/v4`
4. Model: GLM-4.6 (Flagship model for Agent Applications)

### External APIs (No auth required)
- **AlQuran Cloud API**: https://api.alquran.cloud/v1
- **Aladhan Prayer API**: https://api.aladhan.com/v1
- **Hadith API**: https://api.hadith.gading.dev

---

## 🎯 Roadmap

### Phase 1: Foundation ✅ (Complete)
- [x] Project structure setup
- [x] Supabase integration
- [x] GLM-4.6 AI integration
- [x] Core services layer
- [x] Type definitions
- [x] Environment configuration

### Phase 2: Core Features ✅ (Complete)
- [x] Complete authentication flow
- [x] Quran reader with audio
- [x] Bookmarks system
- [x] AI chat interface
- [x] Prayer times integration
- [x] Hadith collections

### Phase 3: Advanced Features ✅ (Complete)
- [x] MENGAJI recitation analysis with AI
- [x] Audio recording and playback
- [x] Achievement system
- [x] Learning modules (Iqra)
- [x] Advanced search
- [x] Social features
- [x] Offline mode support

### Phase 4: Polish & Release (In Progress)
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Testing (unit + integration)
- [ ] App store deployment

---

## 📖 User Guide

### For Users

**Getting Started:**
1. Download and install the app
2. Create an account or continue as guest
3. Browse Surahs or search for specific verses
4. Tap any verse to hear audio recitation
5. Long-press to bookmark or share

**MENGAJI Analysis:**
1. Navigate to "More" → "MENGAJI"
2. Select difficulty level (beginner, intermediate, advanced)
3. Practice reciting the displayed verse
4. Record your recitation
5. Get instant AI feedback on pronunciation and tajwid
6. Track your progress and unlock achievements

**AI Assistant:**
1. Navigate to "More" → "AI Assistant"
2. Ask questions about Islam, Quran, or Hadith
3. Get instant answers with references
4. View chat history

**Prayer Times:**
1. Allow location access
2. Select your prayer zone (Malaysia)
3. Enable notifications for prayer reminders
4. Track your prayers

### For Developers

**Adding a New Feature:**
1. Create types in `types/index.ts`
2. Implement service in `services/`
3. Create custom hook in `hooks/`
4. Build UI component in `components/`
5. Integrate into screen in `app/`

**API Integration:**
- All API calls go through services
- Use caching for repeated requests
- Handle errors gracefully
- Show loading states

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing code style
- Write descriptive commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **AlQuran Cloud** for comprehensive Quran API
- **Aladhan** for prayer times API
- **Z.AI** for GLM-4.6 AI model
- **Supabase** for excellent backend platform
- **Expo** for amazing mobile development tools
- **All Quranic reciters** for their beautiful recitations
- **Islamic scholars** for Tafsir and Hadith compilations

---

## 📞 Support

- **Documentation**: [Read the Docs](#)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@alqurandigital.com
- **Community**: [Discord Server](#)

---

## 🌟 Star History

If you find this project useful, please give it a star ⭐

---

<div align="center">

**Made with ❤️ for the Muslim community**

**Bismillah - In the name of Allah, the Most Gracious, the Most Merciful**

</div>
