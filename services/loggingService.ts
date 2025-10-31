// A simple logging service to standardize logging across the application.
// In a real-world application, this could be integrated with a third-party logging service like Sentry or Bugsnag.

enum LogLevel {
  INFO,
  WARN,
  ERROR,
}

class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${LogLevel[level]}] ${message}`;

    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  public info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  public warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  public error(message: string, error?: any) {
    this.log(LogLevel.ERROR, message, error);

    // In a production environment, you would report the error to a third-party service.
    // For example:
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error);
    // }
  }
}

export const logger = Logger.getInstance();
