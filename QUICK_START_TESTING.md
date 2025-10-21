# 🚀 Quick Start & Testing Guide

## Installation

```bash
# Navigate to project
cd D:\Downloads\Al-Quran-Mobile-Merged

# Install dependencies
npm install

# Start development server
npm start
```

## Test Flows

### 1. Authentication Flow (3 minutes)

#### Sign Up:
1. Open app → Tap "Sign Up"
2. Enter:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "test123"
   - Confirm Password: "test123"
3. Tap "Create Account"
4. ✅ **Expected**: Account created in Supabase, profile created, logged in automatically

#### Login:
1. If logged out → Tap "Sign In"
2. Enter:
   - Email: "test@example.com"
   - Password: "test123"
3. Tap "Sign In"
4. ✅ **Expected**: Logged in, redirected to home

#### Reset Password:
1. Login screen → Tap "Forgot Password?"
2. Enter email
3. Tap "Send Reset Link"
4. ✅ **Expected**: Success message, check email for reset link

#### Guest Mode:
1. Login screen → Tap "Continue as Guest"
2. ✅ **Expected**: Can use app without account, data saved locally

---

### 2. Quran Reading Flow (5 minutes)

#### Browse Surahs:
1. Bottom tab → Tap "Quran"
2. ✅ **Expected**: See list of all 114 Surahs
3. Each card shows:
   - Arabic name
   - English name
   - Translation
   - Verse count
   - Revelation type (Meccan/Medinan)

#### Read Surah:
1. Tap any Surah (e.g., "Al-Fatiha")
2. ✅ **Expected**: Opens Surah detail page
3. Shows:
   - Surah info card
   - Bismillah (if not Surah 1 or 9)
   - All verses with Arabic + translation

#### Play Audio:
1. In Surah detail → Tap play button on any verse
2. ✅ **Expected**: 
   - Fetches audio URL from API
   - Starts playing immediately
   - Play button changes to pause
   - Verse card highlighted

#### Bookmark Verse:
1. Tap bookmark icon on verse card
2. ✅ **Expected**:
   - Icon changes to solid bookmark
   - Border changes to gold
   - Saved to database (if logged in) or AsyncStorage (if guest)

#### Read Tafsir:
1. Tap "Tafsir" button on verse
2. ✅ **Expected**:
   - Fetches Tafsir Ibn Kathir from API
   - Shows in modal/bottom sheet
   - Displays full exegesis in English

#### Share Verse:
1. Tap share button
2. ✅ **Expected**:
   - Opens native share sheet
   - Contains Arabic text + translation + reference

---

### 3. Bookmarks Flow (2 minutes)

#### View Bookmarks:
1. Bottom tab → Tap "Bookmarks" (or navigate via profile)
2. ✅ **Expected**:
   - Shows all saved bookmarks
   - Each card displays:
     - Verse reference (e.g., "2:255")
     - Arabic text
     - Translation
     - Notes (if added)

#### Add Notes:
1. Tap "Edit Notes" on any bookmark
2. Type: "This is my favorite verse"
3. Tap "Save"
4. ✅ **Expected**:
   - Modal closes
   - Notes saved to database
   - Displays under bookmark

#### Delete Bookmark:
1. Tap "Remove" on bookmark
2. Confirm deletion
3. ✅ **Expected**:
   - Confirmation alert
   - Bookmark removed from list
   - Deleted from database

#### Empty State:
1. Delete all bookmarks
2. ✅ **Expected**:
   - Shows empty state with icon
   - "No Bookmarks Yet" message
   - "Browse Quran" button

---

### 4. AI Chat Flow (3 minutes)

#### Navigate to AI Chat:
1. Bottom tab → Tap "AI" or similar
2. Or from menu → "Islamic AI Assistant"
3. ✅ **Expected**:
   - Opens chat interface
   - Shows welcome message
   - Displays 4 suggested questions

#### Ask Question (Suggested):
1. Tap any suggested question (e.g., "What are the 5 pillars of Islam?")
2. ✅ **Expected**:
   - Question appears as user message (green, right)
   - Loading indicator shows
   - AI response appears (gray, left)
   - Answer from REAL GLM-4.6 API
   - Islamic-focused, accurate answer

#### Ask Custom Question:
1. Type in input: "Explain the importance of Salah"
2. Tap send button
3. ✅ **Expected**:
   - Message sent
   - Loading indicator
   - Receives AI response
   - Can scroll through history

#### Clear History:
1. Tap trash icon in header
2. ✅ **Expected**:
   - All messages cleared except welcome
   - Suggested questions reappear

---

### 5. Prayer Times Flow (2 minutes)

#### View Prayer Times:
1. Bottom tab → Tap "Prayer" or "Times"
2. ✅ **Expected**:
   - Shows current date (Gregorian)
   - Shows Hijri date
   - Lists all 5 prayers + Sunrise
   - Highlights next prayer
   - Shows countdown to next prayer

#### Auto-Location:
1. Prayer times screen → Tap "Use My Location" (if available)
2. Allow location permission
3. ✅ **Expected**:
   - Detects GPS coordinates
   - Fetches prayer times from Aladhan API
   - Displays accurate times for location

#### Manual Zone Selection:
1. Settings → Prayer Times → Prayer Zone
2. Tap to open picker
3. Choose "Johor Bahru (SGR01)"
4. ✅ **Expected**:
   - Zone saved to AsyncStorage
   - Prayer times updated for selected zone

---

### 6. Settings Flow (3 minutes)

#### Navigate to Settings:
1. Profile tab → Tap "Settings"
2. Or menu → "Settings"
3. ✅ **Expected**: Opens settings screen with 4 sections

#### Adjust Arabic Font Size:
1. Quran Reading section
2. Tap "-" or "+" next to "Arabic Font Size"
3. ✅ **Expected**:
   - Size increases/decreases (18-36px)
   - Saved to AsyncStorage
   - Applied when reading Quran

#### Change Default Reciter:
1. Audio section → Tap "Default Reciter"
2. Picker expands with 8 reciters
3. Select "Abdul Basit Abdul Samad"
4. ✅ **Expected**:
   - Reciter saved
   - All audio playback uses this reciter
   - Selection highlighted with checkmark

#### Set Playback Speed:
1. Audio section → Tap speed button (e.g., "1.5x")
2. ✅ **Expected**:
   - Speed saved
   - Button highlighted
   - Audio plays at selected speed

#### Select Prayer Zone:
1. Prayer Times section → Tap "Prayer Zone"
2. Scroll through 59 zones
3. Select "Kuala Lumpur (WLY01)"
4. ✅ **Expected**:
   - Zone saved
   - Prayer times updated

#### Toggle Settings:
1. Try all toggles:
   - Show Translation
   - Auto Scroll
   - Prayer Notifications
2. ✅ **Expected**:
   - Each toggle saves immediately
   - Applied throughout app

---

### 7. Profile Flow (2 minutes)

#### View Profile:
1. Bottom tab → Tap "Profile"
2. ✅ **Expected**:
   - Shows avatar with initial
   - Displays full name
   - Shows email
   - Shows "Member Since" date
   - Statistics dashboard:
     - Bookmarks count
     - Verses read
     - Listening time

#### Edit Profile:
1. Tap pencil icon
2. Change full name to "John Doe"
3. Tap "Save"
4. ✅ **Expected**:
   - Loading indicator
   - Profile updated in Supabase
   - Success alert
   - Edit mode exits

#### Quick Actions:
1. Try each action:
   - My Bookmarks → Opens bookmarks
   - Settings → Opens settings
   - Change Password → Opens reset password
2. ✅ **Expected**: Each navigates correctly

#### Sign Out:
1. Scroll down → Tap "Sign Out"
2. Confirm
3. ✅ **Expected**:
   - Signed out
   - Redirected to login
   - Session cleared

---

### 8. Guest Mode Flow (3 minutes)

#### Continue as Guest:
1. Login screen → "Continue as Guest"
2. ✅ **Expected**: Full access to app

#### Test Guest Features:
1. Read Quran → ✅ Works
2. Play audio → ✅ Works
3. Bookmark verse → ✅ Saves to AsyncStorage
4. Add notes → ✅ Saves locally
5. Use AI chat → ✅ Works
6. View prayer times → ✅ Works
7. Change settings → ✅ Saves locally

#### Guest Limitations:
1. Open profile → ✅ Shows "Not Logged In" state
2. ✅ **Expected**:
   - Cannot view profile
   - No statistics
   - No sync across devices
   - "Sign In" call-to-action

#### Upgrade Guest to Account:
1. As guest → Tap "Sign In"
2. Create account
3. ✅ **Expected**:
   - Local bookmarks migrated to database
   - Settings synced
   - Full profile access

---

## Expected API Responses

### Supabase (Authentication):
```json
// Sign Up Success
{
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "created_at": "2025-01-18T..."
  },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

### AlQuran Cloud (Verse):
```json
{
  "code": 200,
  "data": {
    "number": 1,
    "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "numberInSurah": 1,
    "audio": "https://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/1"
  }
}
```

### Aladhan (Prayer Times):
```json
{
  "code": 200,
  "data": {
    "timings": {
      "Fajr": "05:45",
      "Dhuhr": "13:15",
      "Asr": "16:30",
      "Maghrib": "19:15",
      "Isha": "20:30"
    }
  }
}
```

### GLM-4.6 (AI Response):
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "The 5 pillars of Islam are: 1. Shahada..."
    }
  }]
}
```

---

## Common Issues & Solutions

### Issue: "Failed to load Surah"
**Solution**: Check internet connection, AlQuran Cloud API may be rate-limited

### Issue: "Audio won't play"
**Solution**: 
- Check device volume
- Ensure audio URL is valid
- Try different reciter

### Issue: "Bookmarks not showing"
**Solution**:
- If logged in: Check Supabase connection
- If guest: Check AsyncStorage
- Try logging out and back in

### Issue: "AI not responding"
**Solution**:
- Check GLM-4.6 API key in .env
- Verify API endpoint
- Check internet connection

### Issue: "Prayer times incorrect"
**Solution**:
- Verify prayer zone selection
- Check location permissions
- Try manual zone selection

---

## Performance Benchmarks

### Expected Load Times:
- App Launch: < 2 seconds
- Surah List: < 1 second (cached)
- Surah Detail: < 2 seconds (first load)
- Audio Start: < 3 seconds (network dependent)
- Bookmark Action: < 0.5 seconds
- AI Response: 2-5 seconds (API dependent)
- Settings Save: < 0.3 seconds

### Caching:
- Quran data: 1 hour
- Prayer times: 12 hours
- User settings: Persistent
- Audio: Streams (no cache)

---

## Success Criteria

### ✅ All Tests Pass If:
1. User can sign up and login
2. All 114 Surahs display correctly
3. Audio plays from real API
4. Bookmarks save to database
5. AI chat responds with relevant answers
6. Prayer times are accurate
7. Settings persist across restarts
8. Profile displays user info
9. Guest mode works fully
10. No crashes or errors

---

## Next Steps After Testing

1. **Report Issues**: Note any bugs or unexpected behavior
2. **Performance**: Check for slow loads or lag
3. **UI Polish**: Suggest visual improvements
4. **Features**: Request additional functionality
5. **Deploy**: Prepare for production release

---

**Happy Testing! 🚀**

