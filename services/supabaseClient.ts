import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { getValidatedEnv } from '../utils/env';

// Get validated environment configuration
const config = getValidatedEnv();
const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;

// Use AsyncStorage only on native platforms, not on web during SSR
const getStorage = () => {
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    // Server-side rendering on web - return a dummy storage
    return undefined;
  }
  return AsyncStorage;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          surah_number: number;
          surah_name: string;
          ayah_number: number;
          verse_key: string;
          arabic_text: string;
          translation_text: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          surah_number: number;
          surah_name: string;
          ayah_number: number;
          verse_key: string;
          arabic_text: string;
          translation_text: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          surah_number?: number;
          surah_name?: string;
          ayah_number?: number;
          verse_key?: string;
          arabic_text?: string;
          translation_text?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          surah_id: number;
          verse_number: number;
          progress_percentage: number;
          last_read_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          surah_id: number;
          verse_number: number;
          progress_percentage?: number;
          last_read_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          surah_id?: number;
          verse_number?: number;
          progress_percentage?: number;
          last_read_at?: string;
        };
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          messages: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          messages: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          messages?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          fontSize: string;
          prayer_zone: string;
          notification_settings: any;
          default_translation: string;
          default_reciter: number;
          auto_play_audio: boolean;
          show_transliteration: boolean;
          reading_mode: string;
          language: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: string;
          fontSize?: string;
          prayer_zone?: string;
          notification_settings?: any;
          default_translation?: string;
          default_reciter?: number;
          auto_play_audio?: boolean;
          show_transliteration?: boolean;
          reading_mode?: string;
          language?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: string;
          fontSize?: string;
          prayer_zone?: string;
          notification_settings?: any;
          default_translation?: string;
          default_reciter?: number;
          auto_play_audio?: boolean;
          show_transliteration?: boolean;
          reading_mode?: string;
          language?: string;
          updated_at?: string;
        };
      };
      reading_groups: {
        Row: {
          id: string;
          name: string;
          name_ar?: string;
          description: string;
          created_by: string;
          created_at: string;
          members: any;
          target: any;
          progress: any;
          is_public: boolean;
          is_active: boolean;
          max_members?: number;
          tags?: any;
          rules?: any;
          schedule?: any;
        };
        Insert: {
          id?: string;
          name: string;
          name_ar?: string;
          description: string;
          created_by: string;
          created_at?: string;
          members?: any;
          target?: any;
          progress?: any;
          is_public?: boolean;
          is_active?: boolean;
          max_members?: number;
          tags?: any;
          rules?: any;
          schedule?: any;
        };
        Update: {
          id?: string;
          name?: string;
          name_ar?: string;
          description?: string;
          created_by?: string;
          created_at?: string;
          members?: any;
          target?: any;
          progress?: any;
          is_public?: boolean;
          is_active?: boolean;
          max_members?: number;
          tags?: any;
          rules?: any;
          schedule?: any;
        };
      };
      group_activities: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          user_name: string;
          type: string;
          description: string;
          timestamp: string;
          metadata?: any;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          user_name: string;
          type: string;
          description: string;
          timestamp?: string;
          metadata?: any;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          user_name?: string;
          type?: string;
          description?: string;
          timestamp?: string;
          metadata?: any;
        };
      };
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      friend_requests: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          message?: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          message?: string;
          status?: string;
          created_at?: string;
        };
      };
      shared_progress: {
        Row: {
          id: string;
          user_id: string;
          surah_id: number;
          verse_number: number;
          progress_type: string;
          message?: string;
          is_public: boolean;
          created_at: string;
          likes?: any;
          comments?: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          surah_id: number;
          verse_number: number;
          progress_type: string;
          message?: string;
          is_public?: boolean;
          created_at?: string;
          likes?: any;
          comments?: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          surah_id?: number;
          verse_number?: number;
          progress_type?: string;
          message?: string;
          is_public?: boolean;
          created_at?: string;
          likes?: any;
          comments?: any;
        };
      };
      reading_challenges: {
        Row: {
          id: string;
          group_id?: string;
          creator_id: string;
          title: string;
          description: string;
          challenge_type: string;
          target_amount: number;
          start_date: string;
          end_date: string;
          participants: any;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id?: string;
          creator_id: string;
          title: string;
          description: string;
          challenge_type: string;
          target_amount: number;
          start_date: string;
          end_date: string;
          participants?: any;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          creator_id?: string;
          title?: string;
          description?: string;
          challenge_type?: string;
          target_amount?: number;
          start_date?: string;
          end_date?: string;
          participants?: any;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
