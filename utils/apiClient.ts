/**
 * Unified API Client with Error Handling and Retry Logic
 * Provides consistent interface for all external API calls
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export interface ApiError {
  code: string;
  message: string;
  userMessage: string;
  originalError?: any;
  isRetryable: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Transform API errors into user-friendly messages
 */
export function transformApiError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // Network errors
    if (!axiosError.response) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        userMessage: 'Cannot connect to the server. Please check your internet connection and try again.',
        originalError: error,
        isRetryable: true,
      };
    }

    // HTTP errors
    const status = axiosError.response.status;
    
    if (status === 400) {
      return {
        code: 'BAD_REQUEST',
        message: 'Invalid request',
        userMessage: 'The request was invalid. Please try again.',
        originalError: error,
        isRetryable: false,
      };
    }

    if (status === 401 || status === 403) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Authentication failed',
        userMessage: 'You do not have permission to access this resource. Please sign in and try again.',
        originalError: error,
        isRetryable: false,
      };
    }

    if (status === 404) {
      return {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        userMessage: 'The requested content could not be found.',
        originalError: error,
        isRetryable: false,
      };
    }

    if (status === 429) {
      return {
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        originalError: error,
        isRetryable: true,
      };
    }

    if (status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: 'Server error',
        userMessage: 'The server is experiencing issues. Please try again in a few moments.',
        originalError: error,
        isRetryable: true,
      };
    }

    return {
      code: 'API_ERROR',
      message: `API error: ${status}`,
      userMessage: 'Something went wrong. Please try again.',
      originalError: error,
      isRetryable: DEFAULT_RETRY_CONFIG.retryableStatuses.includes(status),
    };
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    return {
      code: 'TIMEOUT',
      message: 'Request timeout',
      userMessage: 'The request took too long. Please check your connection and try again.',
      originalError: error,
      isRetryable: true,
    };
  }

  // Generic errors
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'Unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again.',
    originalError: error,
    isRetryable: false,
  };
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create API client with retry logic
 */
export function createApiClient(baseURL: string, config?: AxiosRequestConfig): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 10000, // 10 seconds default
    ...config,
  });

  // Add request interceptor for logging (development only)
  client.interceptors.request.use(
    (config) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor for error transformation
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const apiError = transformApiError(error);
      
      if (process.env.NODE_ENV !== 'production') {
        console.error('[API Error]', apiError);
      }
      
      return Promise.reject(apiError);
    }
  );

  return client;
}

/**
 * Execute request with retry logic
 */
export async function executeWithRetry<T>(
  requestFn: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (lastError && !lastError.isRetryable) {
        break;
      }

      // Exponential backoff
      const delay = config.retryDelay * Math.pow(2, attempt);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[API] Retrying in ${delay}ms... (Attempt ${attempt + 1}/${config.maxRetries})`);
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Circuit breaker for failing services
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private isOpen = false;

  constructor(
    private readonly threshold: number = 3,
    private readonly resetTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should be closed
    if (this.isOpen && this.lastFailureTime) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.resetTimeout) {
        this.reset();
      } else {
        throw {
          code: 'CIRCUIT_OPEN',
          message: 'Service temporarily unavailable',
          userMessage: 'This service is temporarily unavailable. Please try again in a few moments.',
          isRetryable: false,
        } as ApiError;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.isOpen = false;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.isOpen = true;
      
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Circuit Breaker] Circuit opened after ${this.failureCount} failures`);
      }
    }
  }

  private reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.isOpen = false;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Circuit Breaker] Circuit closed');
    }
  }

  getStatus(): { isOpen: boolean; failureCount: number } {
    return {
      isOpen: this.isOpen,
      failureCount: this.failureCount,
    };
  }
}

/**
 * Create circuit breaker instance
 */
export function createCircuitBreaker(
  threshold = 3,
  resetTimeout = 60000
): CircuitBreaker {
  return new CircuitBreaker(threshold, resetTimeout);
}
