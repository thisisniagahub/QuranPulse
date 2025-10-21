/**
 * Environment Variable Validation
 * Ensures all required environment variables are present before app initialization
 */

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  glmApiKey: string;
  glmApiUrl: string;
  quranApiBase: string;
  prayerApiBase: string;
  hadithApiBase: string;
  enableAiChat: boolean;
  enableOfflineMode: boolean;
  enableNotifications: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Partial<EnvConfig>;
}

const REQUIRED_VARS = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_GLM_API_KEY',
] as const;

const OPTIONAL_VARS = [
  'EXPO_PUBLIC_GLM_API_URL',
  'EXPO_PUBLIC_QURAN_API_BASE',
  'EXPO_PUBLIC_PRAYER_API_BASE',
  'EXPO_PUBLIC_HADITH_API_BASE',
  'EXPO_PUBLIC_ENABLE_AI_CHAT',
  'EXPO_PUBLIC_ENABLE_OFFLINE_MODE',
  'EXPO_PUBLIC_ENABLE_NOTIFICATIONS',
] as const;

/**
 * Validate environment variables and return configuration
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config: Partial<EnvConfig> = {};

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    } else if (value.includes('your_') || value.includes('_here')) {
      errors.push(`${varName} contains placeholder value. Please set a real value.`);
    } else {
      // Store validated values
      switch (varName) {
        case 'EXPO_PUBLIC_SUPABASE_URL':
          config.supabaseUrl = value;
          break;
        case 'EXPO_PUBLIC_SUPABASE_ANON_KEY':
          config.supabaseAnonKey = value;
          break;
        case 'EXPO_PUBLIC_GLM_API_KEY':
          config.glmApiKey = value;
          break;
      }
    }
  }

  // Check optional variables with defaults
  config.glmApiUrl = process.env.EXPO_PUBLIC_GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4';
  config.quranApiBase = process.env.EXPO_PUBLIC_QURAN_API_BASE || 'https://api.alquran.cloud/v1';
  config.prayerApiBase = process.env.EXPO_PUBLIC_PRAYER_API_BASE || 'https://api.aladhan.com/v1';
  config.hadithApiBase = process.env.EXPO_PUBLIC_HADITH_API_BASE || 'https://api.hadith.gading.dev';
  
  config.enableAiChat = process.env.EXPO_PUBLIC_ENABLE_AI_CHAT === 'true';
  config.enableOfflineMode = process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true';
  config.enableNotifications = process.env.EXPO_PUBLIC_ENABLE_NOTIFICATIONS === 'true';

  // Validate URL formats
  if (config.supabaseUrl && !isValidUrl(config.supabaseUrl)) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is not a valid URL');
  }

  if (config.glmApiUrl && !isValidUrl(config.glmApiUrl)) {
    errors.push('EXPO_PUBLIC_GLM_API_URL is not a valid URL');
  }

  // Check for common mistakes
  if (config.supabaseAnonKey && config.supabaseAnonKey.length < 100) {
    warnings.push('EXPO_PUBLIC_SUPABASE_ANON_KEY seems too short. Supabase keys are typically JWT tokens with 200+ characters.');
  }

  if (config.glmApiKey && config.glmApiKey.length < 20) {
    warnings.push('EXPO_PUBLIC_GLM_API_KEY seems too short. Please verify it is correct.');
  }

  // Warn about production credential exposure
  if (process.env.NODE_ENV === 'production') {
    warnings.push('SECURITY WARNING: EXPO_PUBLIC_ variables are embedded in your app bundle and can be extracted. Consider using a backend proxy for sensitive operations.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

/**
 * Validate URL format
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get environment configuration or throw error if invalid
 */
export function getEnvConfig(): EnvConfig {
  const validation = validateEnvironment();

  if (!validation.isValid) {
    const errorMessage = [
      '❌ Environment Configuration Error',
      '',
      'The following environment variables are missing or invalid:',
      ...validation.errors.map(err => `  • ${err}`),
      '',
      'Please check your .env file and ensure all required variables are set.',
      'See .env.example for the correct format.',
    ].join('\n');

    throw new Error(errorMessage);
  }

  // Log warnings in development
  if (process.env.NODE_ENV !== 'production' && validation.warnings.length > 0) {
    console.warn('⚠️  Environment Configuration Warnings:');
    validation.warnings.forEach(warning => console.warn(`  • ${warning}`));
  }

  return validation.config as EnvConfig;
}

/**
 * Check if environment is properly configured (non-throwing version)
 */
export function isEnvironmentConfigured(): boolean {
  const validation = validateEnvironment();
  return validation.isValid;
}

/**
 * Get user-friendly error message for missing environment
 */
export function getEnvironmentErrorMessage(): string {
  const validation = validateEnvironment();
  
  if (validation.isValid) {
    return '';
  }

  return [
    'Configuration Required',
    '',
    'This app requires environment configuration to work properly.',
    '',
    'Missing or invalid settings:',
    ...validation.errors.map(err => `• ${err.replace('EXPO_PUBLIC_', '')}`),
    '',
    'Please contact the app administrator or check the documentation.',
  ].join('\n');
}

// Export singleton validated config
let cachedConfig: EnvConfig | null = null;

export function getValidatedEnv(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = getEnvConfig();
  }
  return cachedConfig;
}
