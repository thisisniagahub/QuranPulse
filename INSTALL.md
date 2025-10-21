# 📦 Installation Guide - Al-Quran Digital Mobile

Complete step-by-step installation instructions for the merged Al-Quran Digital mobile application.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn** package manager
- ✅ **Expo CLI** (will be installed automatically)
- ✅ **Expo Go app** on your mobile device:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Optional (for emulators):
- Android Studio (for Android Emulator)
- Xcode (for iOS Simulator - Mac only)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Navigate to Project

```bash
cd D:\Downloads\Al-Quran-Mobile-Merged
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected time**: 2-3 minutes

**What's being installed**:
- React Native & Expo framework
- Supabase client
- Audio playback (expo-av)
- Location services (expo-location)
- Navigation libraries
- 30+ other dependencies

### Step 3: Verify Environment Variables

Your `.env` file should already have:

```env
EXPO_PUBLIC_SUPABASE_URL=https://ikvufrrmbmipzxppdrpy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_GLM_API_KEY=e785716f55ce4b97b0e3705168cfe29d...
EXPO_PUBLIC_GLM_API_URL=https://open.bigmodel.cn/api/paas/v4
```

**✅ No changes needed!** Everything is pre-configured.

### Step 4: Setup Supabase Database

1. **Visit**: https://ikvufrrmbmipzxppdrpy.supabase.co
2. **Login** to your Supabase dashboard
3. **Navigate to**: SQL Editor (left sidebar)
4. **Copy & paste** the SQL below
5. **Click "Run"**

<details>
<summary>📝 Click to see Supabase SQL Schema</summary>

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
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
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_id INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  progress_percentage FLOAT DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, surah_id)
);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- App settings table
CREATE TABLE IF NOT EXISTS app_settings (
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookmarks" ON bookmarks FOR UPDATE USING (auth.uid() = user_id);
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

</details>

**What this creates**:
- 5 database tables
- Row-Level Security policies
- Proper foreign key relationships

### Step 5: Start the Development Server

```bash
npm start
```

**You should see**:
```
Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press o │ open project code in your editor
```

### Step 6: Run on Your Device

#### Option A: Physical Device (Recommended)

**For iOS:**
1. Open **Camera** app
2. Point at the QR code
3. Tap the notification
4. App will open in Expo Go

**For Android:**
1. Open **Expo Go** app
2. Tap **"Scan QR Code"**
3. Point at the QR code
4. App will load

**First load takes 30-60 seconds. Be patient!**

#### Option B: Emulator/Simulator

**Android:**
```bash
npm run android
```

**iOS (Mac only):**
```bash
npm run ios
```

---

## ✅ Verification

After the app loads, verify:

### 1. App Opens Successfully
- [ ] Home screen displays
- [ ] "Qara'a" header visible
- [ ] Bottom navigation bar shows

### 2. Navigation Works
- [ ] Can tap each tab (Home, Quran, Hadith, Prayer, More)
- [ ] Tabs switch properly
- [ ] No errors in console

### 3. Basic Features Load
- [ ] Quran tab shows list of Surahs
- [ ] Hadith tab shows book collections
- [ ] Prayer tab loads (may ask for location permission)
- [ ] Home screen shows cards

**If all checks pass**: ✅ Installation successful!

---

## 🧪 Testing Core Features

### Test Authentication

```javascript
// In any screen, try:
import { useAuth } from '../contexts/AuthContext';

const { signUp } = useAuth();
await signUp('test@example.com', 'password123', 'Test User');

// Check Supabase dashboard → Authentication → Users
// Should see new user
```

### Test Audio Playback

```javascript
// In any screen:
import { useAudio } from '../contexts/AudioContext';

const { playTrack } = useAudio();
await playTrack({
  type: 'ayah',
  key: 'test',
  src: 'https://verses.quran.com/AbdulBaset/Murattal/001001.mp3'
});

// Should hear audio playing
```

### Test Bookmarks

```javascript
// In any screen:
import { useBookmarks } from '../hooks/useBookmarks';

const { addBookmark } = useBookmarks();
await addBookmark({
  id: 1,
  verseNumber: 1,
  verse_key: '1:1',
  arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  translationText: 'In the name of Allah',
  surahNumber: 1,
});

// Check Supabase → bookmarks table
```

### Test Prayer Times

```javascript
// In any screen:
import { getPrayerTimes } from '../services/prayerService';

const times = await getPrayerTimes();
console.log('Prayer times:', times);

// Should see today's prayer times
```

---

## 🔧 Troubleshooting

### Issue: "Cannot find module" errors

**Solution 1**: Clear cache and reinstall
```bash
rm -rf node_modules
npm install
npm start -- --clear
```

**Solution 2**: Clear Metro bundler cache
```bash
npm start -- --reset-cache
```

### Issue: "Network request failed"

**Possible causes**:
1. No internet connection
2. Supabase URL incorrect
3. Firewall blocking requests

**Solution**:
1. Check your internet connection
2. Verify `.env` file has correct Supabase URL
3. Try restarting Metro: Press `r` in terminal

### Issue: ".env variables not loading"

**Solution**:
```bash
# Stop the server (Ctrl+C)
# Delete cache
rm -rf .expo
# Restart
npm start
```

### Issue: "Supabase auth errors"

**Solution**:
1. Verify you ran the SQL schema in Supabase
2. Check Supabase dashboard → Authentication → Settings
3. Ensure Row-Level Security is enabled

### Issue: "Location permission denied"

**Solution**:
1. Go to device Settings → Apps → Expo Go
2. Enable Location permissions
3. Restart the app

### Issue: "Audio not playing"

**Possible causes**:
1. Device volume is muted
2. Silent mode is on
3. Audio URL is invalid

**Solution**:
1. Turn up device volume
2. Disable silent mode
3. Try a different audio URL

### Issue: App crashes on launch

**Solution**:
```bash
# Clear everything
rm -rf node_modules .expo
npm install
npm start -- --clear
```

---

## 📱 Platform-Specific Notes

### iOS

- **Minimum iOS**: 13.0+
- **Permissions**: Location, Notifications (will be requested when needed)
- **Audio**: Plays in background and silent mode
- **Testing**: Use Expo Go or iOS Simulator

### Android

- **Minimum Android**: 21+ (Android 5.0 Lollipop)
- **Permissions**: Location, Storage, Notifications
- **Audio**: Background playback supported
- **Testing**: Use Expo Go or Android Emulator

---

## 🎯 What's Next?

After successful installation:

1. **Read Documentation**:
   - `README.md` - Project overview
   - `PHASE2_COMPLETE.md` - Feature guide
   - `GETTING_STARTED.md` - Quick setup

2. **Explore the Code**:
   - `contexts/` - Authentication & Audio
   - `hooks/` - Bookmarks & custom hooks
   - `services/` - API integrations
   - `app/` - Screens

3. **Start Building**:
   - Create login/signup screens
   - Enhance Quran reader
   - Build bookmarks view
   - Implement AI chat

4. **Test on Real Device**:
   - Some features work better on physical devices
   - Test location services
   - Test audio playback
   - Test notifications

---

## 💡 Tips

### Development Tips:
- Press `r` in terminal to reload app
- Shake device to open developer menu
- Use `console.log()` to debug
- Check terminal for errors

### Performance Tips:
- Close other apps while testing
- Use real device for better performance
- Clear cache if app becomes slow
- Restart Metro if hot reload stops working

### Testing Tips:
- Test on both iOS and Android
- Test with/without internet
- Test with location services off
- Test in guest mode (not logged in)

---

## 📞 Getting Help

If you encounter issues:

1. **Check Documentation**:
   - All MD files in project root
   - Code comments
   - Type definitions

2. **Check Logs**:
   - Terminal output
   - Expo DevTools (press `m`)
   - Console errors

3. **Common Solutions**:
   - Restart Metro bundler
   - Clear cache
   - Reinstall dependencies
   - Check `.env` file

4. **Resources**:
   - [Expo Documentation](https://docs.expo.dev/)
   - [React Native Docs](https://reactnative.dev/)
   - [Supabase Docs](https://supabase.com/docs)

---

## ✨ Installation Complete!

You're now ready to develop your Islamic learning mobile app!

**Next Steps**:
1. ✅ Installation complete
2. → Read `PHASE2_COMPLETE.md` for feature guide
3. → Start building UI components
4. → Test features thoroughly
5. → Deploy to app stores

---

<div align="center">

**Happy Coding! 🚀**

**May this app bring benefit to the Ummah. Ameen! 🤲**

</div>
