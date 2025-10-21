# GEMINI Project Context: QuranPulse Mobile App

## Project Overview

This project, **QuranPulse**, is a comprehensive, cross-platform mobile spiritual companion application built using React Native and the Expo framework. It is written in TypeScript and utilizes a modern development stack.

The application's primary purpose is to provide users with a rich and interactive way to engage with the Quran and other Islamic resources. It features a dark-mode-first design with a distinct green-to-cyan gradient.

**Core Technologies:**
*   **Frontend:** React Native 0.79 / React 19
*   **Framework:** Expo SDK 54
*   **Language:** TypeScript
*   **Routing:** Expo Router (file-based)
*   **Backend & Database:** Supabase (for user authentication, profiles, bookmarks, etc.)
*   **AI Integration:** GLM-4.6 for an "AI Islamic Assistant" feature.
*   **HTTP Client:** Axios
*   **Testing:** Jest

**Key Features:**
*   **Karaoke-Style Quran Reader:** Word-by-word audio synchronization and highlighting.
*   **AI Assistant:** An in-app chatbot for Islamic Q&A, powered by a GLM-4.6 model.
*   **Hadith Collections:** Access to six major Hadith books.
*   **Prayer Times:** Location-based prayer schedules with notifications.
*   **Interactive Learning:** "Iqra'" lessons for learning to read Arabic.
*   **Offline Functionality:** Caching for Quran text and downloading audio for offline use.
*   **User Customization:** Light/dark themes, font size adjustments, and multiple reciter options.

## Building and Running

### 1. Installation

First, install the project dependencies using npm or yarn:

```bash
npm install
# or
yarn install
```

### 2. Configuration

The project requires environment variables for connecting to backend services.

1.  Copy the example environment file: `cp .env.example .env`
2.  Fill in the required API keys and URLs in the newly created `.env` file. This includes credentials for **Supabase** and the **GLM AI service**.
3.  Set up the database schema by running the SQL commands found in the `README.md` file in your Supabase project's SQL Editor. This will create the necessary tables (`profiles`, `bookmarks`, `chat_history`, etc.) and enable Row Level Security.

### 3. Running the Application

The application is managed via npm scripts defined in `package.json`.

*   **Start the development server:**
    ```bash
    npm start
    ```
    This will open the Expo developer menu, which provides a QR code to run the app on a physical device using the Expo Go app.

*   **Run on a specific platform:**
    ```bash
    npm run android  # Run on an Android emulator or connected device
    npm run ios      # Run on an iOS simulator or connected device
    npm run web      # Run the web version in a browser
    ```

### 4. Testing and Linting

*   **Run tests:**
    ```bash
    npm test
    ```
    This command executes the test suite using Jest. Test files are located in the `__tests__` directory.

*   **Check for code style issues:**
    ```bash
    npm run lint
    ```
    This command uses the `eslint-config-expo` configuration to enforce code quality and consistency.

## Development Conventions

*   **Project Structure:** The codebase is organized logically:
    *   `app/`: Contains all screens and routes, managed by Expo Router.
    *   `components/`: Holds reusable React components.
    *   `services/`: Centralizes all external API interactions (Supabase, Quran APIs, AI service).
    *   `contexts/`: Manages global state using React Context (e.g., `AuthContext`, `SettingsContext`).
    *   `hooks/`: Stores custom React hooks for encapsulating component logic.
    *   `constants/`: Defines static data like Surah lists, reciters, and theme colors.
    *   `types/`: Contains shared TypeScript type definitions.

*   **State Management:** Global state is handled via React Contexts, providing a clean way to manage authentication, user settings, and audio playback state across the app.

*   **API Interaction:** All communication with external services is abstracted into the `services` directory. This keeps API logic separate from the UI and makes it easier to manage. `axios` is the standard HTTP client.

*   **Coding Style:** The project uses TypeScript for static typing and enforces a consistent style through ESLint (`eslint.config.js`). The convention is to use functional components with React Hooks.
