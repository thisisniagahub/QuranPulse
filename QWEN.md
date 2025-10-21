# QuranPulse - Your Spiritual Companion

## Project Overview

QuranPulse is a modern mobile application built with React Native and Expo, designed to be a comprehensive spiritual companion for Muslims. The app features AI guidance, interactive Quran learning with karaoke-style word highlighting, prayer times, Hadith collections, and beautiful design with dark mode support.

### Key Features
- **Karaoke-Style Quran Reader**: Word-by-word highlighting synchronized with audio
- **Transliteration Rumi**: Jawi-style pronunciation guide for beginners
- **AI Islamic Assistant**: Powered by GLM-4.6 for instant answers
- **Hadith Collections**: Complete 6 major Hadith books with Arabic text and translations
- **Prayer Features**: Location-based prayer times for Malaysia zones, Qibla compass, prayer tracking
- **Learning Modules**: Iqra' lessons and Tajweed practice
- **Offline Mode**: Audio downloads and cached content
- **User Experience**: Dark/light themes, customizable font sizes, RTL support

### Technology Stack
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: GLM-4.6 (Z.AI) AI model for Islamic Q&A
- **Routing**: Expo Router
- **State Management**: React Context API
- **Audio**: Expo AV
- **Design**: Custom UI with green-to-cyan gradient theme

## Building and Running

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your mobile device (for testing)

### Installation Steps
1. Clone and install:
```bash
cd Al-Quran-Mobile-Merged
npm install
# or
yarn install
```

2. Configure environment variables by copying `.env.example` to `.env` and filling in the credentials:
- Supabase URL and anon key
- GLM-4.6 API key and URL
- API endpoints for Quran, prayer times, and Hadith

3. Setup Supabase database by running the SQL commands provided in the README to create tables and enable RLS policies.

4. Run the app:
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

### Testing on Device
1. Install **Expo Go** app on your mobile device
2. Scan the QR code from the terminal
3. The app will load on your device

## Development Conventions

### Architecture
The project follows Clean Architecture with TypeScript and includes several key directories:
- `app/` - Expo Router screens (using file-based routing)
- `components/` - Reusable UI components (organized by features)
- `services/` - API services and business logic
- `contexts/` - React contexts for state management
- `hooks/` - Custom React hooks
- `constants/` - Static data and configurations
- `types/` - TypeScript type definitions
- `assets/` - Images, fonts, and other static assets
- `utils/` - Utility functions

### API Integration
- All API calls go through dedicated service files in the `services/` directory
- Use caching for repeated requests
- Handle errors gracefully
- Show loading states
- The app uses AlQuran Cloud API, Aladhan Prayer API, and Hadith API

### State Management
The app uses React Context for state management with dedicated contexts for:
- Authentication (`AuthContext`)
- Audio playback (`AudioContext`)
- Language preferences (`LanguageContext`)
- Theme settings (`ThemeContext`)
- App settings (`SettingsContext`)

### Design System
- Dark mode with green (#0f5132) to cyan (#0dcaf0) gradient theme
- Poppins font for modern UI and Amiri font for Arabic text
- Consistent spacing and component structure
- Responsive design for different screen sizes
- Haptic feedback for interactive elements

## Project Structure
```
Al-Quran-Mobile-Merged/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home/Dashboard
│   │   ├── quran.tsx        # Quran reader
│   │   ├── hadith.tsx       # Hadith collections
│   │   ├── prayer.tsx       # Prayer times
│   │   └── more.tsx         # More options
│   ├── surah/[id].tsx       # Surah detail screen
│   └── _layout.tsx          # Root layout
├── components/              # Reusable UI components
│   ├── quran/              # Quran-specific components
│   ├── hadith/             # Hadith components
│   ├── prayer/             # Prayer components
│   └── ui/                 # Generic UI components
├── services/               # API and business logic
│   ├── supabaseClient.ts  # Supabase configuration
│   ├── glmAiService.ts    # GLM-4.6 AI integration
│   ├── quranApi.ts        # Quran API service
│   ├── prayerApi.ts       # Prayer times API
│   └── audioService.ts    # Audio playback service
├── contexts/              # React contexts
│   ├── AuthContext.tsx   # Authentication state
│   ├── AudioContext.tsx  # Audio player state
│   └── SettingsContext.tsx # App settings
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useBookmarks.ts
│   ├── useAudio.ts
│   └── usePrayer.ts
├── constants/            # Static data and configurations
│   ├── surahs.ts        # 114 Surahs data
│   ├── reciters.ts      # Reciter information
│   └── prayerZones.ts   # Malaysia prayer zones
├── types/               # TypeScript type definitions
│   └── index.ts
└── assets/             # Images, fonts, etc.
```

## AI Integration

The app integrates GLM-4.6 AI model from Z.AI to provide Islamic Q&A capabilities. The AI service includes:
- Detailed system instructions to ensure responses include Quran verses and Hadith
- Proper formatting for religious content
- Streaming response capabilities
- Error handling for API calls
- Context-aware responses with Quranic references

## Database Schema

The app uses Supabase with PostgreSQL database and includes the following tables:
- `profiles` - User profiles with authentication
- `bookmarks` - Quran verse bookmarks with optional notes
- `reading_progress` - Progress tracking for Quran reading
- `chat_history` - AI conversation history
- `app_settings` - User preferences and settings

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Contributing Guidelines

### Adding New Features
1. Create types in `types/index.ts`
2. Implement service in `services/`
3. Create custom hook in `hooks/`
4. Build UI component in `components/`
5. Integrate into screen in `app/`

### Development Best Practices
- Use TypeScript for all new code
- Follow existing code style and component structure
- Write descriptive commit messages
- Test on multiple device sizes
- Ensure accessibility standards are met
- Update documentation when necessary

## Key Components

### Karaoke Quran Reader
The `HighlightedVerse.tsx` component implements the karaoke-style functionality with:
- Word-by-word highlighting synchronized with audio playback
- Transliteration display (Rumi/Jawi style)
- Progress tracking during audio playback
- Bookmark capability

### API Services
The `quranApi.ts` service handles:
- Fetching Quran verses with Arabic text and translations
- Audio playback for verses
- Tafsir (interpretation) retrieval
- Search functionality
- Caching for performance optimization

### GLM AI Service
The `glmAiService.ts` provides:
- Integration with GLM-4.6 AI model
- Multi-language support (English, Malay, Arabic)
- System instructions for Islamic Q&A
- Streaming response capabilities
- Verse and hadith explanation features