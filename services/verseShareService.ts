/**
 * Verse Share Service
 * Generate beautiful verse images for sharing
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { Platform } from 'react-native';

export interface ShareOptions {
  format: 'png' | 'jpg';
  quality: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  includeLogo?: boolean;
  includeTranslation?: boolean;
  includeReference?: boolean;
  template: 'classic' | 'modern' | 'gradient' | 'minimal';
}

const DEFAULT_OPTIONS: ShareOptions = {
  format: 'png',
  quality: 1,
  backgroundColor: '#111827',
  textColor: '#FFFFFF',
  accentColor: '#10B981',
  includeLogo: true,
  includeTranslation: true,
  includeReference: true,
  template: 'modern',
};

export class VerseShareService {
  /**
   * Capture verse view as image
   */
  static async captureVerse(
    viewRef: any,
    options: Partial<ShareOptions> = {}
  ): Promise<string> {
    const config = { ...DEFAULT_OPTIONS, ...options };
    
    try {
      const uri = await captureRef(viewRef, {
        format: config.format,
        quality: config.quality,
        result: 'tmpfile',
      });
      
      return uri;
    } catch (error) {
      console.error('Error capturing verse:', error);
      throw error;
    }
  }

  /**
   * Share verse image
   */
  static async shareVerse(
    viewRef: any,
    verse: {
      arabicText: string;
      translation?: string;
      surahName: string;
      ayahNumber: number;
    },
    options: Partial<ShareOptions> = {}
  ): Promise<void> {
    try {
      const imageUri = await this.captureVerse(viewRef, options);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUri, {
          mimeType: `image/${options.format || 'png'}`,
          dialogTitle: `Share ${verse.surahName}:${verse.ayahNumber}`,
        });
      } else {
        throw new Error('Sharing is not available on this platform');
      }
    } catch (error) {
      console.error('Error sharing verse:', error);
      throw error;
    }
  }

  /**
   * Save verse image to gallery
   */
  static async saveToGallery(
    viewRef: any,
    options: Partial<ShareOptions> = {}
  ): Promise<string> {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Gallery permission not granted');
      }

      const imageUri = await this.captureVerse(viewRef, options);
      
      // Save to gallery
      const asset = await MediaLibrary.createAssetAsync(imageUri);
      
      // Create album if needed
      const album = await MediaLibrary.getAlbumAsync('QuranPulse');
      if (!album) {
        await MediaLibrary.createAlbumAsync('QuranPulse', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      
      return asset.uri;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      throw error;
    }
  }

  /**
   * Generate verse card HTML for web sharing
   */
  static generateVerseHTML(
    verse: {
      arabicText: string;
      translation?: string;
      surahName: string;
      ayahNumber: number;
    },
    options: Partial<ShareOptions> = {}
  ): string {
    const config = { ...DEFAULT_OPTIONS, ...options };
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 40px;
              background: ${config.backgroundColor};
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .verse-card {
              max-width: 600px;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            .arabic-text {
              font-size: 32px;
              line-height: 2;
              text-align: right;
              color: ${config.textColor};
              margin-bottom: 30px;
              font-weight: 500;
            }
            .translation {
              font-size: 18px;
              line-height: 1.8;
              color: ${config.textColor}CC;
              margin-bottom: 30px;
            }
            .reference {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 20px;
              border-top: 1px solid ${config.accentColor}33;
            }
            .surah-info {
              color: ${config.accentColor};
              font-weight: 600;
              font-size: 16px;
            }
            .app-name {
              color: ${config.textColor}99;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="verse-card">
            <div class="arabic-text">${verse.arabicText}</div>
            ${config.includeTranslation && verse.translation ? 
              `<div class="translation">${verse.translation}</div>` : ''}
            ${config.includeReference ? 
              `<div class="reference">
                <span class="surah-info">${verse.surahName} • Ayah ${verse.ayahNumber}</span>
                <span class="app-name">QuranPulse</span>
              </div>` : ''}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get template styles
   */
  static getTemplateStyles(template: string) {
    const templates = {
      classic: {
        backgroundColor: '#F5F5DC',
        textColor: '#2C1810',
        accentColor: '#8B4513',
        borderRadius: 8,
      },
      modern: {
        backgroundColor: '#111827',
        textColor: '#FFFFFF',
        accentColor: '#10B981',
        borderRadius: 16,
      },
      gradient: {
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textColor: '#FFFFFF',
        accentColor: '#FFD700',
        borderRadius: 20,
      },
      minimal: {
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        accentColor: '#000000',
        borderRadius: 0,
      },
    };
    
    return templates[template] || templates.modern;
  }
}

export default VerseShareService;
