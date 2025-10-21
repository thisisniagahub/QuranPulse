/**
 * QuranPulse Theme Configuration
 * 🎨 Modern Islamic Design dengan Spiritual Pulse
 * 
 * Design System:
 * - Gradient: Hijau Tua #0f5132 → Biru Cyan #0dcaf0
 * - Typography: Poppins (Modern) + Amiri (Islamic)
 * - Philosophy: "Follow the pulse of the Quran"
 */

export const COLORS = {
  // Primary Brand Colors - Gradient (Hijau → Biru)
  primary: '#0f5132',        // Dark Green - Main brand color
  primaryLight: '#198754',   // Green accent
  secondary: '#0dcaf0',      // Cyan Blue - Secondary brand
  secondaryDark: '#0891b2',  // Dark Cyan
  
  // Gradient Colors
  gradientStart: '#0f5132',  // Hijau
  gradientEnd: '#0dcaf0',    // Biru
  
  // Background Colors (Dark Mode)
  background: {
    primary: '#111827',      // Deep dark gray
    secondary: '#1F2937',    // Card background
    tertiary: '#374151',     // Elevated surfaces
  },
  
  // Text Colors
  text: {
    primary: '#FFFFFF',      // Main text
    secondary: '#D1D5DB',    // Secondary text
    tertiary: '#9CA3AF',     // Muted text
    accent: '#0dcaf0',       // Cyan highlights
  },
  
  // Spiritual Pulse Colors (Aura)
  pulse: {
    glow: 'rgba(15, 81, 50, 0.3)',      // Green glow
    glowBright: 'rgba(13, 202, 240, 0.2)', // Cyan glow
    shadow: 'rgba(15, 81, 50, 0.6)',    // Shadow effect
  },
  
  // Feature Colors
  success: '#10B981',        // Green - Success states
  warning: '#F59E0B',        // Amber - Warnings
  error: '#EF4444',          // Red - Errors
  info: '#3B82F6',          // Blue - Info
  
  // Semantic Colors
  bookmark: '#F59E0B',       // Orange for bookmarks
  playing: '#10B981',        // Green for audio playing
  highlight: '#10B981',      // Green for word highlighting
  transliteration: '#8B5CF6', // Purple for transliteration
  
  // Islamic Colors
  islamic: {
    gold: '#FFD700',         // Gold accents
    emerald: '#10B981',      // Emerald green
    navy: '#1e3a8a',         // Deep blue
  },
};

export const GRADIENTS = {
  // Main Brand Gradient
  primary: {
    colors: [COLORS.gradientStart, COLORS.gradientEnd],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Subtle Background Gradient
  background: {
    colors: ['#111827', '#1F2937'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  // Pulse Aura Gradient
  pulse: {
    colors: [
      'rgba(15, 81, 50, 0.4)',
      'rgba(13, 202, 240, 0.2)',
      'rgba(15, 81, 50, 0.1)',
    ],
    start: { x: 0.5, y: 0.5 },
    end: { x: 1, y: 1 },
  },
  
  // Card Gradient
  card: {
    colors: ['#1F2937', '#111827'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
};

export const FONTS = {
  // Modern Typography (Poppins)
  modern: {
    thin: 'Poppins-Thin',
    light: 'Poppins-Light',
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    extraBold: 'Poppins-ExtraBold',
  },
  
  // Islamic Typography (Amiri)
  islamic: {
    regular: 'Amiri-Regular',
    bold: 'Amiri-Bold',
    italic: 'Amiri-Italic',
    boldItalic: 'Amiri-BoldItalic',
  },
  
  // Arabic Quran Font
  arabic: {
    regular: 'Amiri-Regular',
    // Could add more Arabic fonts like:
    // - 'ScheherazadeNew-Regular'
    // - 'KFGQPC Uthmanic Script HAFS'
  },
};

export const TYPOGRAPHY = {
  // Headers (Using Poppins)
  h1: {
    fontFamily: FONTS.modern.bold,
    fontSize: 32,
    lineHeight: 40,
    color: COLORS.text.primary,
  },
  h2: {
    fontFamily: FONTS.modern.bold,
    fontSize: 28,
    lineHeight: 36,
    color: COLORS.text.primary,
  },
  h3: {
    fontFamily: FONTS.modern.semiBold,
    fontSize: 24,
    lineHeight: 32,
    color: COLORS.text.primary,
  },
  h4: {
    fontFamily: FONTS.modern.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: COLORS.text.primary,
  },
  
  // Body Text
  body: {
    fontFamily: FONTS.modern.regular,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.primary,
  },
  bodySmall: {
    fontFamily: FONTS.modern.regular,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text.secondary,
  },
  
  // Arabic Text (Using Amiri)
  arabic: {
    fontFamily: FONTS.islamic.regular,
    fontSize: 24,
    lineHeight: 40,
    color: COLORS.text.primary,
    textAlign: 'right' as const,
  },
  
  // Transliteration
  transliteration: {
    fontFamily: FONTS.modern.italic,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.secondary,
    fontStyle: 'italic' as const,
  },
  
  // Caption
  caption: {
    fontFamily: FONTS.modern.regular,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.text.tertiary,
  },
  
  // Button Text
  button: {
    fontFamily: FONTS.modern.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.primary,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  // Subtle shadow
  sm: {
    shadowColor: COLORS.pulse.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Medium shadow
  md: {
    shadowColor: COLORS.pulse.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Large shadow
  lg: {
    shadowColor: COLORS.pulse.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // Pulse Glow Effect
  pulse: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
};

export const ANIMATIONS = {
  // Pulse animation timing
  pulse: {
    duration: 2000,
    easing: 'ease-in-out',
  },
  
  // Quick interactions
  quick: {
    duration: 200,
    easing: 'ease-out',
  },
  
  // Normal transitions
  normal: {
    duration: 300,
    easing: 'ease-in-out',
  },
  
  // Slow animations
  slow: {
    duration: 500,
    easing: 'ease-in-out',
  },
};

// Logo Configuration
export const LOGO = {
  text: 'QuranPulse',
  tagline: 'Your Spiritual Companion',
  motto: 'Follow the pulse of the Quran',
  colors: {
    primary: COLORS.primary,
    accent: COLORS.secondary,
    gradient: [COLORS.gradientStart, COLORS.gradientEnd],
  },
  glow: {
    color: COLORS.pulse.glow,
    radius: 20,
    opacity: 0.6,
  },
  pulseWave: {
    // Q-shaped pulse wave icon
    strokeWidth: 2,
    animationDuration: 2000,
    color: COLORS.secondary,
  },
};

// Export default theme object
export const theme = {
  colors: COLORS,
  gradients: GRADIENTS,
  fonts: FONTS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  animations: ANIMATIONS,
  logo: LOGO,
} as const;

export default theme;
