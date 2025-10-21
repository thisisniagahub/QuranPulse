/**
 * Environment Validation Tests
 */

import { validateEnvironment, getEnvConfig, isEnvironmentConfigured } from '../../utils/env';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should pass validation with all required variables set', () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'a'.repeat(150); // Long enough key
      process.env.EXPO_PUBLIC_GLM_API_KEY = 'valid_glm_api_key_12345';

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.config.supabaseUrl).toBe('https://test.supabase.co');
    });

    it('should fail validation when required variables are missing', () => {
      delete process.env.EXPO_PUBLIC_SUPABASE_URL;
      delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      delete process.env.EXPO_PUBLIC_GLM_API_KEY;

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Missing required');
    });

    it('should fail validation for placeholder values', () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'your_supabase_url_here';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'your_key_here';
      process.env.EXPO_PUBLIC_GLM_API_KEY = 'your_glm_key_here';

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide default values for optional variables', () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'a'.repeat(150);
      process.env.EXPO_PUBLIC_GLM_API_KEY = 'valid_key';
      delete process.env.EXPO_PUBLIC_QURAN_API_BASE;

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.config.quranApiBase).toBe('https://api.alquran.cloud/v1');
    });

    it('should warn about short API keys', () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'short_key';
      process.env.EXPO_PUBLIC_GLM_API_KEY = 'valid_key_1234567890';

      const result = validateEnvironment();

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('seems too short');
    });

    it('should validate URL formats', () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'invalid-url';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'a'.repeat(150);
      process.env.EXPO_PUBLIC_GLM_API_KEY = 'valid_key';

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('not a valid URL'))).toBe(true);
    });
  });

  describe('getEnvConfig', () => {
    it('should throw error when validation fails', () => {
      delete process.env.EXPO_PUBLIC_SUPABASE_URL;

      expect(() => getEnvConfig()).toThrow('Environment Configuration Error');
    });

    it('should return config when validation passes', () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'a'.repeat(150);
      process.env.EXPO_PUBLIC_GLM_API_KEY = 'valid_key_1234567890';

      const config = getEnvConfig();

      expect(config).toHaveProperty('supabaseUrl');
      expect(config).toHaveProperty('supabaseAnonKey');
      expect(config).toHaveProperty('glmApiKey');
    });
  });

  describe('isEnvironmentConfigured', () => {
    it('should return true when environment is valid', () => {
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'a'.repeat(150);
      process.env.EXPO_PUBLIC_GLM_API_KEY = 'valid_key_1234567890';

      expect(isEnvironmentConfigured()).toBe(true);
    });

    it('should return false when environment is invalid', () => {
      delete process.env.EXPO_PUBLIC_SUPABASE_URL;

      expect(isEnvironmentConfigured()).toBe(false);
    });
  });
});
