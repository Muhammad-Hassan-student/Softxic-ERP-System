// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: Error;
  context?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private context: Record<string, any> = {};

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set global context
   */
  setContext(context: Record<string, any>) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext() {
    this.context = {};
  }

  /**
   * Format log message
   */
  private formatMessage(
    level: LogLevel, 
    message: string, 
    data?: any, 
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
      ...(error && { error: { message: error.message, stack: error.stack } }),
      ...(Object.keys(this.context).length > 0 && { context: this.context })
    };
  }

  /**
   * Write log
   */
  private writeLog(entry: LogEntry) {
    const logFn = entry.level === 'error' ? console.error :
                  entry.level === 'warn' ? console.warn :
                  entry.level === 'info' ? console.info : console.log;

    if (this.isDevelopment) {
      // Pretty print in development
      logFn(
        `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`,
        entry.data ? '\nData:' : '',
        entry.data || '',
        entry.error ? '\nError:' : '',
        entry.error || '',
        entry.context ? '\nContext:' : '',
        entry.context || ''
      );
    } else {
      // JSON format in production (for log aggregation)
      logFn(JSON.stringify(entry));
    }

    // In production, you might also send to external service
    if (!this.isDevelopment && entry.level === 'error') {
      this.sendToErrorTracking(entry);
    }
  }

  /**
   * Send error to tracking service (Sentry, etc.)
   */
  private async sendToErrorTracking(entry: LogEntry) {
    // Implement your error tracking here
    // e.g., Sentry.captureException(entry.error);
  }

  // ==================== PUBLIC METHODS ====================

  debug(message: string, data?: any) {
    this.writeLog(this.formatMessage('debug', message, data));
  }

  info(message: string, data?: any) {
    this.writeLog(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any) {
    this.writeLog(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: any, data?: any) {
    const errorObj = error instanceof Error ? error : new Error(error);
    this.writeLog(this.formatMessage('error', message, data, errorObj));
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Time execution of a function
   */
  async time<T>(
    label: string,
    fn: () => Promise<T>,
    level: LogLevel = 'debug'
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.writeLog(this.formatMessage(level, `${label} completed`, { duration }));
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${label} failed`, error, { duration });
      throw error;
    }
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, any>): Logger {
    const child = new Logger();
    child.setContext({ ...this.context, ...context });
    return child;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export default for convenience
export default logger;