# 🎯 Getting Started - Quick Setup Guide

Welcome to **Al-Quran Digital Mobile**! Follow these steps to get your app running.

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
cd D:\Downloads\Al-Quran-Mobile-Merged
npm install
```

Wait for all packages to install (~2-3 minutes).

---

### Step 2: Setup Supabase Database

1. **Go to Supabase**: https://ikvufrrmbmipzxppdrpy.supabase.co
2. **Log in** to your Supabase account
3. **Navigate to**: SQL Editor (left sidebar)
4. **Copy and paste** the SQL from `README.md` section "Setup Supabase Database"
5. **Click "Run"** to create all tables

**What you're creating:**
- ✅ `profiles` - User information
- ✅ `bookmarks` - Saved verses
- ✅ `reading_progress` - Reading tracking
- ✅ `chat_history` - AI conversations
- ✅ `app_settings` - User preferences

---

### Step 3: Verify Environment Variables

Your `.env` file is already configured with:

```env
✅ Supabase URL: https://ikvufrrmbmipzxppdrpy.supabase.co
✅ Supabase Anon Key: (already set)
✅ GLM-4.6 API Key: (already set)
✅ API Endpoints: (already set)
```

**No changes needed!** Everything is ready to go.

---

### Step 4: Start the Development Server

```bash
npm start
```

You'll see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

### Step 5: Run on Your Device

#### Option A: Physical Device (Recommended)
1. **Install Expo Go**:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Scan QR Code**:
   - **iOS**: Open Camera app → Scan QR code
   - **Android**: Open Expo Go app → Scan QR code

3. **Wait for build** (~30 seconds first time)

#### Option B: Emulator
```bash
# Android
npm run android

# iOS (Mac only)
npm run ios
```

---

## ✅ Verification Checklist

After the app loads, verify:

- [ ] App opens without errors
- [ ] You see the Home screen with "Qara'a" header
- [ ] Bottom tabs visible: Home, Quran, Hadith, Prayer, More
- [ ] Can navigate between tabs
- [ ] Quran tab shows list of Surahs

**If all checks pass → You're ready! 🎉**

---

## 🔧 Troubleshooting

### Issue: "Module not found" errors

**Solution**:
```bash
# Clear cache
npm start -- --clear

# Or reinstall
rm -rf node_modules
npm install
```

---

### Issue: "Network request failed"

**Solution**:
1. Check your internet connection
2. Ensure Supabase URL is correct in `.env`
3. Try restarting Metro bundler: Press `r` in terminal

---

### Issue: ".env variables not loading"

**Solution**:
```bash
# Stop the server (Ctrl+C)
# Restart with cache clear
npm start -- --clear
```

---

### Issue: "Supabase auth errors"

**Solution**:
1. Check if you ran the SQL schema in Supabase
2. Verify RLS policies are enabled
3. Check Supabase dashboard → Authentication → Settings

---

### Issue: "GLM API errors"

**Solution**:
1. API key is already provided and should work
2. Check internet connection
3. Verify API URL in `.env`: `https://open.bigmodel.cn/api/paas/v4`

---

## 📱 What Works Right Now

After Phase 1 setup, these features are **ready to use**:

### ✅ Working Features:
- Home screen with dashboard layout
- Quran tab with Surah list
- Hadith tab with book collections
- Prayer times tab (location-based)
- Bottom navigation
- Theme switching
- Basic UI components

### 🔄 Partially Working:
- Surah list displays but reader needs enhancement
- Prayer times fetch but notifications not set up
- Hadith shows books but detail view pending

### ⏳ Not Yet Implemented:
- User authentication (login/signup)
- Bookmarks saving to database
- AI chat interface
- Audio playback controls
- Offline downloads
- Learning modules

---

## 🚀 Next Development Steps

### Immediate (You can work on these now):

1. **Test Current Features**:
   ```bash
   npm start
   # Navigate through all tabs
   # Check for any errors
   ```

2. **Customize Home Screen**:
   - Edit: `app/(tabs)/index.tsx`
   - Add your own widgets
   - Customize colors

3. **Add Your Logo**:
   - Replace: `assets/images/icon.png`
   - Replace: `assets/images/splash-icon.png`

4. **Update App Name**:
   - Edit: `app.json` → Change "name" and "slug"

### This Week:

**Implement Authentication**:
- Copy `AuthContext.tsx` from local project
- Create `hooks/useAuth.ts`
- Add login/signup screens

**Enhance Quran Reader**:
- Implement audio player
- Add bookmark buttons
- Show Tafsir

**Setup Notifications**:
- Request permissions
- Schedule prayer reminders

---

## 📖 Key Files to Know

### Configuration:
- `.env` - Environment variables (**IMPORTANT!**)
- `app.json` - Expo app configuration
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config

### Entry Points:
- `app/_layout.tsx` - Root layout & providers
- `app/(tabs)/_layout.tsx` - Tab navigation setup
- `app/(tabs)/index.tsx` - Home screen

### Services (API Layer):
- `services/supabaseClient.ts` - Database client
- `services/glmAiService.ts` - AI chat
- `services/quranApi.ts` - Quran data

### Types:
- `types/index.ts` - All TypeScript types

### Constants:
- `constants/surahs.ts` - 114 Surahs data
- `constants/reciters.ts` - Reciter information

---

## 🎓 Learning Resources

### React Native:
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)

### Expo Router:
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)

### Supabase:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

### GLM-4.6:
- [Z.AI Documentation](https://open.bigmodel.cn/dev/api)

---

## 💬 Need Help?

### Common Questions:

**Q: Can I use this in production?**  
A: Yes! But complete Phase 2 & 3 first, and thorough testing.

**Q: How do I deploy to app stores?**  
A: Use `eas build` (Expo Application Services). See: https://docs.expo.dev/build/introduction/

**Q: Can I customize the design?**  
A: Absolutely! All components are in `components/` directory.

**Q: Is the GLM API key safe to use?**  
A: For development, yes. For production, consider rate limiting and backend proxy.

**Q: Where do I report bugs?**  
A: Check `IMPLEMENTATION_STATUS.md` and add to "Known Issues" section.

---

## ✨ Tips for Success

1. **Start Small**: Get one feature working perfectly before moving to next
2. **Test Often**: Run the app frequently to catch errors early
3. **Read Logs**: Terminal shows helpful error messages
4. **Use TypeScript**: The types will guide you and prevent bugs
5. **Check Documentation**: `README.md` and `IMPLEMENTATION_STATUS.md` have all details

---

## 🎯 Your First Task

**Try this now** to verify everything works:

```bash
# 1. Start the app
npm start

# 2. Open on your device
# Scan QR code with Expo Go

# 3. Navigate to each tab
# Home → Quran → Hadith → Prayer → More

# 4. Try these actions:
# - Tap on any Surah in Quran tab
# - Check if it navigates to surah detail
# - Go back and try another tab
```

**If all works → Congratulations! You're ready to develop! 🎉**

---

## 📞 Support Channels

- **Documentation**: Read `README.md` and `IMPLEMENTATION_STATUS.md`
- **Code Examples**: Check existing components in `components/`
- **API Reference**: See service files in `services/`
- **Community**: React Native Discord, Expo Forums

---

<div align="center">

**Happy Coding! May your development be blessed. 🤲**

**"Read! In the name of your Lord who created." - Quran 96:1**

</div>
