# 🚀 QuranPulse - Production Deployment Guide

**Version:** 2.0.0  
**Last Updated:** January 2025

---

## 📋 Pre-Deployment Checklist

### ✅ Critical Requirements

Before deploying to production, ensure ALL these are completed:

- [ ] **API Keys Regenerated**
  - [ ] New Supabase anon key generated
  - [ ] New GLM-4 API key generated
  - [ ] Old keys revoked
  - [ ] .env file NOT in git

- [ ] **Environment Configuration**
  - [ ] Production .env file created
  - [ ] All EXPO_PUBLIC_ variables set
  - [ ] API endpoints verified
  - [ ] Feature flags configured

- [ ] **Testing Complete**
  - [ ] All 31 tests passing (`npm test`)
  - [ ] Manual testing on real devices
  - [ ] iOS simulator tested
  - [ ] Android emulator tested
  - [ ] Network error handling tested
  - [ ] Offline mode tested

- [ ] **Security Audit**
  - [ ] No credentials in code
  - [ ] No console.logs in production code
  - [ ] RLS policies verified on Supabase
  - [ ] API rate limiting configured
  - [ ] User data encryption verified

- [ ] **Performance Optimization**
  - [ ] Bundle size analyzed (`npx expo export`)
  - [ ] Images optimized
  - [ ] Fonts loaded properly
  - [ ] Memory leaks checked
  - [ ] Battery usage acceptable

- [ ] **Legal & Compliance**
  - [ ] Privacy policy created
  - [ ] Terms of service created
  - [ ] App store guidelines reviewed
  - [ ] Religious content verified for accuracy
  - [ ] Copyright/attribution for Quran translations

---

## 🔐 Environment Setup

### Production Environment Variables

Create `.env.production`:

```env
# Supabase Production (DO NOT commit this file!)
EXPO_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key_here

# GLM-4 AI Production
EXPO_PUBLIC_GLM_API_KEY=your_production_glm_key_here
EXPO_PUBLIC_GLM_API_URL=https://open.bigmodel.cn/api/paas/v4

# App Configuration
EXPO_PUBLIC_APP_NAME=QuranPulse
EXPO_PUBLIC_APP_VERSION=2.0.0
EXPO_PUBLIC_APP_TAGLINE=Your Spiritual Companion

# API Endpoints
EXPO_PUBLIC_QURAN_API_BASE=https://api.alquran.cloud/v1
EXPO_PUBLIC_PRAYER_API_BASE=https://api.aladhan.com/v1
EXPO_PUBLIC_HADITH_API_BASE=https://api.hadith.gading.dev

# Feature Flags
EXPO_PUBLIC_ENABLE_AI_CHAT=true
EXPO_PUBLIC_ENABLE_OFFLINE_MODE=true
EXPO_PUBLIC_ENABLE_NOTIFICATIONS=true

# Analytics (Optional - add when ready)
# EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
# EXPO_PUBLIC_GA_TRACKING_ID=your_ga_id
```

### Environment Management

```bash
# Copy appropriate env file before build
cp .env.production .env

# Or use per-environment builds
npx expo build --profile production
```

---

## 🏗️ Build Configuration

### 1. Update `app.json`

```json
{
  "expo": {
    "name": "QuranPulse",
    "slug": "quranpulse",
    "version": "2.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "quranpulse",
    "userInterfaceStyle": "dark",
    "primaryColor": "#0f5132",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f5132"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.quranpulse.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "QuranPulse needs your location to show accurate prayer times for your area.",
        "NSLocationAlwaysUsageDescription": "QuranPulse needs your location to send prayer time notifications.",
        "NSMicrophoneUsageDescription": "QuranPulse needs microphone access for pronunciation practice."
      }
    },
    "android": {
      "package": "com.quranpulse.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0f5132"
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### 2. Create `eas.json`

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-asc-app-id",
        "appleTeamId": "your-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./playstore-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 📱 Building for iOS

### Prerequisites

1. **Apple Developer Account**
   - Individual or Organization ($99/year)
   - Enrolled in Apple Developer Program

2. **App Store Connect Setup**
   - App created with bundle ID: `com.quranpulse.app`
   - App Store listing prepared
   - Screenshots ready (all required sizes)

### Build Process

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS (App Store)
eas build --platform ios --profile production

# Or for TestFlight
eas build --platform ios --profile preview
```

### Submit to App Store

```bash
# Submit build
eas submit --platform ios --latest

# Or manually upload via Xcode/Transporter
```

### App Store Requirements

**Screenshots Needed:**
- 6.7" (iPhone 14 Pro Max): 1290x2796
- 6.5" (iPhone 11 Pro Max): 1242x2688
- 5.5" (iPhone 8 Plus): 1242x2208

**App Preview Video (Optional):**
- 15-30 seconds
- Show karaoke feature, AI assistant, prayer times

**App Store Listing:**
- Title: "QuranPulse - Quran & Prayer"
- Subtitle: "Your Spiritual Companion"
- Description: (see QURANPULSE_BRANDING.md)
- Keywords: quran,islam,prayer,muslim,hadith,islamic
- Category: Reference / Lifestyle
- Age Rating: 4+

---

## 🤖 Building for Android

### Prerequisites

1. **Google Play Console Account**
   - One-time $25 fee
   - Developer account verified

2. **Play Store Listing Setup**
   - App created with package: `com.quranpulse.app`
   - Store listing completed

### Keystore Setup

```bash
# Generate keystore (first time only)
keytool -genkeypair -v -keystore quranpulse.keystore \
  -alias quranpulse -keyalg RSA -keysize 2048 -validity 10000

# Store credentials securely
# DO NOT commit keystore to git!
```

### Build Process

```bash
# Build for Android (Play Store)
eas build --platform android --profile production

# Or build APK for testing
eas build --platform android --profile preview
```

### Submit to Play Store

```bash
# Submit build
eas submit --platform android --latest

# Or manually upload via Play Console
```

### Play Store Requirements

**Screenshots Needed:**
- Phone: 1080x1920 (minimum 2 screenshots)
- 7" Tablet: 1200x1920 (optional but recommended)
- 10" Tablet: 1600x2560 (optional but recommended)

**Feature Graphic:**
- 1024x500 pixels
- Show app logo and key features

**App Icon:**
- 512x512 pixels
- 32-bit PNG with alpha

**Store Listing:**
- Title: "QuranPulse - Quran & Prayer Times"
- Short Description: (80 chars) "Modern Quran with AI assistant, prayer times, and interactive learning"
- Full Description: (see QURANPULSE_BRANDING.md)
- Category: Books & Reference
- Content Rating: Everyone

---

## 🗄️ Supabase Production Setup

### 1. Create Production Project

```bash
# In Supabase Dashboard:
1. Create new project (production)
2. Choose region closest to users (Singapore for Malaysia)
3. Set strong database password
4. Enable Database backups
```

### 2. Run Migrations

```sql
-- Run all SQL from README.md setup section
-- Including:
-- - Tables creation
-- - RLS policies
-- - Indexes
-- - Functions/triggers
```

### 3. Configure Security

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Add database backups policy
-- Supabase Dashboard → Database → Backups
-- Enable daily backups, retention 7 days
```

### 4. Performance Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_verse_key ON bookmarks(verse_key);
CREATE INDEX idx_reading_progress_user_surah ON reading_progress(user_id, surah_id);
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_app_settings_user_id ON app_settings(user_id);

-- Add updated_at trigger for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repeat for other tables...
```

---

## 📊 Analytics & Monitoring

### 1. Error Tracking (Sentry)

```bash
# Install Sentry
npx expo install @sentry/react-native

# Configure in app/_layout.tsx
```

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: false,
  environment: process.env.NODE_ENV,
});
```

### 2. Analytics (Optional)

**Google Analytics 4:**
```bash
npm install @react-native-firebase/analytics
```

**Mixpanel:**
```bash
npm install mixpanel-react-native
```

### 3. Performance Monitoring

```typescript
// Track key metrics
- App launch time
- API response times
- Screen render times
- Memory usage
- Battery impact
```

---

## 🔔 Push Notifications Setup

### Configure Expo Notifications

```bash
# Already installed
npm list expo-notifications
```

### Get Push Credentials

```bash
# iOS
eas credentials

# Android
# FCM configured automatically
```

### Implement Notification Service

```typescript
// services/notificationService.ts
import * as Notifications from 'expo-notifications';

export async function setupNotifications() {
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status === 'granted') {
    // Get push token
    const token = await Notifications.getExpoPushTokenAsync();
    
    // Save to backend
    await savePushToken(token.data);
  }
}

// Schedule prayer notifications
export async function schedulePrayerNotification(
  prayerName: string,
  time: Date
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time for ${prayerName}`,
      body: 'It\'s time for prayer. May Allah accept your worship.',
      sound: 'default',
    },
    trigger: time,
  });
}
```

---

## 🧪 Pre-Launch Testing

### Testing Checklist

**Functional Testing:**
- [ ] User registration/login works
- [ ] Quran reading with karaoke highlighting
- [ ] Transliteration displays correctly
- [ ] Audio playback smooth
- [ ] Bookmarks save/load
- [ ] AI Assistant responds accurately
- [ ] Prayer times show correctly
- [ ] Hadith collections load
- [ ] Settings persist
- [ ] Profile updates work

**UI/UX Testing:**
- [ ] All screens load properly
- [ ] Navigation smooth
- [ ] Buttons responsive
- [ ] Forms validate correctly
- [ ] Error messages user-friendly
- [ ] Loading states show
- [ ] Empty states display
- [ ] RTL support for Arabic

**Performance Testing:**
- [ ] App launches in < 3 seconds
- [ ] Scrolling smooth (60fps)
- [ ] Memory usage stable
- [ ] Battery drain acceptable
- [ ] Network usage reasonable
- [ ] Works on slow 3G

**Device Testing:**
- [ ] iPhone 12/13/14/15
- [ ] Samsung Galaxy S21/S22/S23
- [ ] Budget Android (< $200)
- [ ] Tablets (iPad, Android)
- [ ] Various screen sizes

**Localization Testing:**
- [ ] English text correct
- [ ] Malay translation correct
- [ ] Arabic displays properly (RTL)
- [ ] Date/time formats correct
- [ ] Prayer zones for Malaysia work

---

## 🚀 Launch Strategy

### Phase 1: Soft Launch (Week 1-2)

**Target:** 100-500 beta testers

**Goals:**
- Identify critical bugs
- Gather user feedback
- Test server load
- Verify analytics

**Channels:**
- TestFlight (iOS)
- Google Play Internal Testing (Android)
- Local Islamic community
- Friends & family

### Phase 2: Regional Launch (Week 3-4)

**Target:** Malaysia only

**Goals:**
- Validate market fit
- Test JAKIM prayer times
- Gather reviews
- Optimize performance

**Channels:**
- App Store (Malaysia)
- Google Play (Malaysia)
- Local marketing

### Phase 3: Global Launch (Month 2)

**Target:** Worldwide

**Goals:**
- Scale internationally
- Support multiple regions
- Handle increased load
- Build community

**Channels:**
- All countries on App Store
- All countries on Google Play
- Social media marketing
- PR & press releases

---

## 📈 Post-Launch Monitoring

### Week 1 Metrics

Monitor these daily:
- Crash-free rate (target: > 99%)
- App store rating (target: > 4.5 stars)
- Active users (track growth)
- API error rate (target: < 1%)
- Average session duration
- Feature adoption rates

### Critical Alerts

Set up alerts for:
- Crash rate spike (> 5%)
- API failure rate (> 10%)
- Database connection issues
- Payment failures (if applicable)
- User reports of data loss

### User Feedback

Monitor:
- App Store reviews
- Google Play reviews
- Support emails
- Social media mentions
- Community feedback

---

## 🔧 Maintenance Plan

### Daily Tasks
- Monitor error logs (Sentry)
- Check analytics dashboard
- Review app store ratings
- Respond to critical bugs

### Weekly Tasks
- Review user feedback
- Update Quran/Hadith data if needed
- Check API rate limits
- Database backup verification
- Performance metrics review

### Monthly Tasks
- Security audit
- Dependency updates
- Feature usage analysis
- User retention analysis
- Plan next features

---

## 🆘 Incident Response

### Critical Issues

**App Crashes:**
1. Check Sentry for crash reports
2. Identify affected devices/OS
3. Deploy hotfix if needed
4. Notify users via in-app message

**API Downtime:**
1. Check API status dashboards
2. Enable offline mode if available
3. Show user-friendly error messages
4. Contact API provider if needed

**Data Loss:**
1. Check Supabase logs
2. Restore from backup
3. Notify affected users
4. Implement additional safeguards

**Security Breach:**
1. Immediately revoke compromised keys
2. Force password reset if needed
3. Notify users per GDPR requirements
4. Conduct security audit
5. Implement fixes

---

## 📞 Support Channels

### User Support

**Email:** support@quranpulse.app
**Response Time:** < 24 hours
**Languages:** English, Malay

**Support Categories:**
- Technical issues
- Feature requests
- Content corrections
- Prayer time accuracy
- Account problems

### Developer Support

**GitHub Issues:** For bug reports
**Documentation:** README.md and guides
**Community:** Discord (if created)

---

## ✅ Final Pre-Deployment Checklist

**24 Hours Before Launch:**
- [ ] Final build tested on real devices
- [ ] All environment variables verified
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] Support email ready
- [ ] App store listings complete
- [ ] Screenshots uploaded
- [ ] Privacy policy live
- [ ] Terms of service live

**Launch Day:**
- [ ] Submit builds to stores
- [ ] Monitor analytics dashboard
- [ ] Check error rates
- [ ] Test on fresh devices
- [ ] Prepare social media posts
- [ ] Support team ready

**Post-Launch (First Week):**
- [ ] Daily monitoring of metrics
- [ ] Respond to reviews
- [ ] Fix critical bugs immediately
- [ ] Gather feedback
- [ ] Plan first update

---

## 🎉 Success Criteria

### Launch Success Metrics

**Week 1:**
- Crash-free rate: > 99%
- App Store rating: > 4.0 stars
- Downloads: 1,000+
- Active users: 500+

**Month 1:**
- App Store rating: > 4.5 stars
- Downloads: 10,000+
- Daily active users: 3,000+
- User retention (Day 7): > 40%

**Month 3:**
- Downloads: 50,000+
- Daily active users: 15,000+
- User retention (Day 30): > 30%
- Revenue (if applicable): Sustainable costs

---

## 🎯 Growth Strategy

### Marketing Channels

**Organic:**
- App Store Optimization (ASO)
- Google Play Store listing
- Word of mouth
- Community sharing

**Social Media:**
- Instagram: Visual features showcase
- TikTok: Short feature demos
- YouTube: Tutorial videos
- Facebook: Community building

**Partnerships:**
- Islamic centers
- Mosques
- Islamic schools
- Muslim influencers

**Content Marketing:**
- Blog posts on Quran learning
- YouTube tutorials
- Islamic education content
- User success stories

---

## 💰 Monetization (Optional)

QuranPulse is **FREE FOREVER** for core features. Optional premium features:

**Premium Features (Future):**
- Offline full Quran audio download
- Advanced AI features (unlimited questions)
- Custom themes & fonts
- Ad-free experience
- Cloud backup (unlimited)
- Family sharing

**Pricing:**
- Monthly: $2.99
- Yearly: $19.99 (save 44%)
- Lifetime: $49.99

**Donation Model:**
- Sadaqah/voluntary donations
- One-time or recurring
- Transparent usage reporting

---

## 📝 Compliance & Legal

### GDPR Compliance

**Data Collection:**
- User account info (email)
- Usage analytics
- Crash reports
- Location (for prayer times)

**User Rights:**
- Data access
- Data deletion
- Data portability
- Consent withdrawal

**Implementation:**
```typescript
// In settings screen
async function deleteUserData() {
  // Delete from Supabase
  await supabase.from('profiles').delete().eq('id', user.id);
  // Clear local storage
  await AsyncStorage.clear();
  // Sign out
  await signOut();
}
```

### Privacy Policy Requirements

Must include:
- What data is collected
- How data is used
- Third-party services used
- User rights
- Contact information

### Terms of Service

Must include:
- Acceptable use policy
- Disclaimer on Islamic content accuracy
- Intellectual property rights
- Limitation of liability

---

## 🔒 Security Best Practices

### Production Security

**API Keys:**
- Never commit to git
- Use environment variables
- Rotate regularly
- Monitor usage

**Database:**
- Enable RLS on all tables
- Use prepared statements
- Regular backups
- Encrypt sensitive data

**Client App:**
- No sensitive data in logs
- Secure storage for tokens
- Certificate pinning (optional)
- Code obfuscation (optional)

### Security Checklist

- [ ] All API keys in environment variables
- [ ] RLS enabled on Supabase
- [ ] Regular database backups
- [ ] Error logs don't expose secrets
- [ ] User passwords hashed (by Supabase Auth)
- [ ] HTTPS only for all API calls
- [ ] Input validation on all forms
- [ ] XSS protection implemented

---

## 📞 Emergency Contacts

### Critical Services

**Hosting:**
- Expo: support@expo.dev
- Supabase: support@supabase.com

**APIs:**
- AlQuran Cloud: (check website)
- GLM-4: https://open.bigmodel.cn/support

**Stores:**
- App Store: Apple Developer Support
- Google Play: Google Play Console Help

### Internal Team

**Project Lead:** [Your Name]
**Email:** [Your Email]
**Phone:** [Your Phone]

**Developer:** [Dev Name/Company]
**Support:** support@quranpulse.app

---

## 🚀 Deployment Commands Quick Reference

```bash
# Environment Setup
cp .env.production .env

# Testing
npm test
npm run type-check

# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Submit iOS
eas submit --platform ios --latest

# Submit Android
eas submit --platform android --latest

# Check build status
eas build:list --platform all --status finished

# View logs
eas build:view --id <build-id>
```

---

## 📚 Additional Resources

**Documentation:**
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

**Community:**
- [Expo Forums](https://forums.expo.dev/)
- [React Native Community](https://www.reactnative.dev/community/overview)
- [Supabase Discord](https://discord.supabase.com/)

---

## 🎓 Lessons Learned

Document your deployment experience:

**What Went Well:**
- [Add your successes]

**What Could Be Improved:**
- [Add your learnings]

**Unexpected Issues:**
- [Add any surprises]

**Time Taken:**
- Planning: [X hours]
- Building: [X hours]
- Testing: [X hours]
- Deployment: [X hours]
- Total: [X hours]

---

## 📅 Version History

**Version 2.0.0 - January 2025**
- Initial production release
- Karaoke-style highlighting
- Transliteration Rumi
- AI Assistant (Ustaz AI)
- Prayer times with JAKIM
- 30,000+ Hadiths
- Learning modules

**Future Versions:**
- 2.1.0: Offline audio download
- 2.2.0: Social features
- 2.3.0: Advanced analytics
- 3.0.0: Major UI refresh

---

**Deployment Guide Complete! May Allah bless this project. 🤲**

**Bismillah, ready for production! 🚀**

---

*Last Updated: January 2025*  
*Document Version: 1.0*  
*QuranPulse Team*
