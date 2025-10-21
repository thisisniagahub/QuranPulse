/**
 * Error Handler Utility
 * Centralized error handling and logging
 */

import { Alert } from 'react-native';
import { ApiError } from '../types';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  userId?: string;
  action?: string;
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly details?: any;
  public readonly timestamp: string;
  public readonly userId?: string;
  public readonly action?: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    details?: any,
    userId?: string,
    action?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.userId = userId;
    this.action = action;
  }

  toErrorInfo(): ErrorInfo {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      userId: this.userId,
      action: this.action,
    };
  }
}

class ErrorHandler {
  private errorLog: ErrorInfo[] = [];
  private maxLogSize = 100;

  /**
   * Handle error and determine appropriate response
   */
  handleError(error: any, context?: string): ErrorInfo {
    const errorInfo = this.parseError(error, context);
    this.logError(errorInfo);
    return errorInfo;
  }

  /**
   * Parse error and determine type
   */
  private parseError(error: any, context?: string): ErrorInfo {
    const timestamp = new Date().toISOString();
    
    // Handle AppError instances
    if (error instanceof AppError) {
      return error.toErrorInfo();
    }

    // Handle API errors
    if (error?.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      let type: ErrorType;
      switch (status) {
        case 401:
          type = ErrorType.AUTHENTICATION;
          break;
        case 403:
          type = ErrorType.AUTHORIZATION;
          break;
        case 404:
          type = ErrorType.NOT_FOUND;
          break;
        case 422:
          type = ErrorType.VALIDATION;
          break;
        case 500:
        case 502:
        case 503:
          type = ErrorType.SERVER;
          break;
        default:
          type = ErrorType.NETWORK;
      }

      return {
        type,
        message: data?.message || error.message || 'An error occurred',
        code: data?.code || status.toString(),
        details: {
          status,
          data,
          context,
        },
        timestamp,
      };
    }

    // Handle network errors
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Network connection failed. Please check your internet connection.',
        code: error.code,
        details: { context, originalError: error.message },
        timestamp,
      };
    }

    // Handle Supabase errors
    if (error?.code) {
      let type: ErrorType;
      switch (error.code) {
        case 'PGRST116':
          type = ErrorType.NOT_FOUND;
          break;
        case '23505': // Unique constraint violation
          type = ErrorType.VALIDATION;
          break;
        case '23503': // Foreign key constraint violation
          type = ErrorType.VALIDATION;
          break;
        default:
          type = ErrorType.SERVER;
      }

      return {
        type,
        message: error.message || 'Database error occurred',
        code: error.code,
        details: { context, originalError: error },
        timestamp,
      };
    }

    // Handle generic errors
    return {
      type: ErrorType.UNKNOWN,
      message: error?.message || 'An unexpected error occurred',
      code: error?.name || 'UNKNOWN',
      details: { context, originalError: error },
      timestamp,
    };
  }

  /**
   * Log error to console and store in memory
   */
  private logError(errorInfo: ErrorInfo): void {
    // Log to console in development
    if (__DEV__) {
      console.error('Error:', errorInfo);
    }

    // Store in memory log
    this.errorLog.unshift(errorInfo);
    
    // Keep only recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
  }

  /**
   * Show user-friendly error message
   */
  showError(errorInfo: ErrorInfo, showAlert: boolean = true): void {
    const userMessage = this.getUserMessage(errorInfo);
    
    if (showAlert) {
      Alert.alert(
        'Error',
        userMessage,
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Get user-friendly error message
   */
  private getUserMessage(errorInfo: ErrorInfo): string {
    switch (errorInfo.type) {
      case ErrorType.NETWORK:
        return 'Please check your internet connection and try again.';
      
      case ErrorType.AUTHENTICATION:
        return 'Please log in again to continue.';
      
      case ErrorType.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      
      case ErrorType.VALIDATION:
        return errorInfo.message || 'Please check your input and try again.';
      
      case ErrorType.NOT_FOUND:
        return 'The requested item was not found.';
      
      case ErrorType.SERVER:
        return 'Server error occurred. Please try again later.';
      
      default:
        return errorInfo.message || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Create specific error types
   */
  createNetworkError(message: string = 'Network connection failed', details?: any): AppError {
    return new AppError(message, ErrorType.NETWORK, 'NETWORK_ERROR', details);
  }

  createAuthError(message: string = 'Authentication failed', details?: any): AppError {
    return new AppError(message, ErrorType.AUTHENTICATION, 'AUTH_ERROR', details);
  }

  createValidationError(message: string, details?: any): AppError {
    return new AppError(message, ErrorType.VALIDATION, 'VALIDATION_ERROR', details);
  }

  createNotFoundError(message: string = 'Resource not found', details?: any): AppError {
    return new AppError(message, ErrorType.NOT_FOUND, 'NOT_FOUND', details);
  }

  createServerError(message: string = 'Server error occurred', details?: any): AppError {
    return new AppError(message, ErrorType.SERVER, 'SERVER_ERROR', details);
  }

  /**
   * Get error log
   */
  getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    recent: ErrorInfo[];
  } {
    const byType = Object.values(ErrorType).reduce((acc, type) => {
      acc[type] = this.errorLog.filter(error => error.type === type).length;
      return acc;
    }, {} as Record<ErrorType, number>);

    return {
      total: this.errorLog.length,
      byType,
      recent: this.errorLog.slice(0, 10),
    };
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(errorInfo: ErrorInfo): boolean {
    return errorInfo.type === ErrorType.NETWORK || 
           errorInfo.type === ErrorType.SERVER ||
           (errorInfo.type === ErrorType.UNKNOWN && !errorInfo.code);
  }

  /**
   * Get retry delay based on error type
   */
  getRetryDelay(errorInfo: ErrorInfo, attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return delay + jitter;
  }

  /**
   * Wrap async function with error handling
   */
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: string,
    showAlert: boolean = false
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      const errorInfo = this.handleError(error, context);
      this.showError(errorInfo, showAlert);
      return null;
    }
  }

  /**
   * Wrap sync function with error handling
   */
  withErrorHandlingSync<T>(
    fn: () => T,
    context?: string,
    showAlert: boolean = false
  ): T | null {
    try {
      return fn();
    } catch (error) {
      const errorInfo = this.handleError(error, context);
      this.showError(errorInfo, showAlert);
      return null;
    }
  }
}

export default new ErrorHandler();