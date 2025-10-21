/**
 * Verse Notes Service
 * Manage personal notes on verses
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const NOTES_KEY = 'verse_notes';

export interface VerseNote {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName?: string;
  arabicText?: string;
  translation?: string;
  note: string;
  tags?: string[];
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
  isPrivate?: boolean;
}

export class VerseNotesService {
  private static notes: VerseNote[] = [];
  private static userId: string | null = null;

  /**
   * Initialize service
   */
  static async initialize(userId?: string) {
    this.userId = userId || null;
    await this.loadNotes();
    
    if (userId) {
      await this.syncWithSupabase();
    }
  }

  /**
   * Load notes from storage
   */
  static async loadNotes(): Promise<VerseNote[]> {
    try {
      const stored = await AsyncStorage.getItem(NOTES_KEY);
      if (stored) {
        this.notes = JSON.parse(stored);
        return this.notes;
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
    return [];
  }

  /**
   * Save notes to storage
   */
  static async saveNotes(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(this.notes));
      
      if (this.userId) {
        await this.syncWithSupabase();
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }

  /**
   * Add or update a note
   */
  static async saveNote(note: Omit<VerseNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<VerseNote> {
    // Check if note exists
    const existingIndex = this.notes.findIndex(
      n => n.surahNumber === note.surahNumber && n.ayahNumber === note.ayahNumber
    );

    let savedNote: VerseNote;
    
    if (existingIndex >= 0) {
      // Update existing note
      savedNote = {
        ...this.notes[existingIndex],
        ...note,
        updatedAt: new Date(),
      };
      this.notes[existingIndex] = savedNote;
    } else {
      // Create new note
      savedNote = {
        ...note,
        id: `note_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.notes.push(savedNote);
    }

    await this.saveNotes();
    return savedNote;
  }

  /**
   * Delete a note
   */
  static async deleteNote(noteId: string): Promise<boolean> {
    const index = this.notes.findIndex(n => n.id === noteId);
    if (index >= 0) {
      this.notes.splice(index, 1);
      await this.saveNotes();
      return true;
    }
    return false;
  }

  /**
   * Get note for a verse
   */
  static getNoteForVerse(surahNumber: number, ayahNumber: number): VerseNote | null {
    return this.notes.find(
      n => n.surahNumber === surahNumber && n.ayahNumber === ayahNumber
    ) || null;
  }

  /**
   * Get all notes
   */
  static getAllNotes(): VerseNote[] {
    return this.notes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Search notes
   */
  static searchNotes(query: string): VerseNote[] {
    const lowerQuery = query.toLowerCase();
    return this.notes.filter(note =>
      note.note.toLowerCase().includes(lowerQuery) ||
      note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      note.surahName?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get notes by tag
   */
  static getNotesByTag(tag: string): VerseNote[] {
    return this.notes.filter(note => note.tags?.includes(tag));
  }

  /**
   * Get all tags
   */
  static getAllTags(): string[] {
    const tags = new Set<string>();
    this.notes.forEach(note => {
      note.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  /**
   * Sync with Supabase
   */
  static async syncWithSupabase(): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .from('verse_notes')
        .upsert({
          user_id: this.userId,
          notes: this.notes,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error syncing notes:', error);
    }
  }
}

export default VerseNotesService;
