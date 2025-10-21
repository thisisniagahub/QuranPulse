/**
 * Logger Utility
 * Replaces console.log with proper logging that can be disabled in production
 */

import Constants from 'expo-constants';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

class Logger {
  private component: string;
  private isDevelopment: boolean;

  constructor(component: string) {
    this.component = component;
    this.isDevelopment = __DEV__ || Constants.expoConfig?.extra?.appEnv === 'development';
  }

  /**
   * Debug level logging - only in development
   */
  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      this.log('debug', message, data);
    }
  }

  /**
   * Info level logging
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  /**
   * Error level logging - always logged
   */
  error(message: string, error?: any): void {
    this.log('error', message, error);
    
    // In production, send to error tracking service
    if (!this.isDevelopment) {
      this.sendToErrorTracking(message, error);
    }
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component: this.component,
      message,
      data,
    };

    // Format output based on level
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.component}]`;
    const fullMessage = `${prefix} ${message}`;

    switch (level) {
      case 'debug':
        console.log(fullMessage, data || '');
        break;
      case 'info':
        console.info(fullMessage, data || '');
        break;
      case 'warn':
        console.warn(fullMessage, data || '');
        break;
      case 'error':
        console.error(fullMessage, data || '');
        break;
    }
  }

  /**
   * Send errors to tracking service (Sentry, Firebase, etc.)
   */
  private sendToErrorTracking(message: string, error?: any): void {
    // TODO: Implement error tracking service integration
    // Example: Sentry.captureException(error);
  }
}

/**
 * Create a logger instance for a component
 */
export function createLogger(component: string): Logger {
  return new Logger(component);
}

/**
 * Default logger instance
 */
export default Logger;

