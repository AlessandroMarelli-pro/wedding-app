/**
 * Logger utility for Vercel deployment
 * Provides structured logging with different levels and context
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  messages?: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): LogEntry {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      messages: message,
    };

    if (context) {
      logEntry.context = context;
    }

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return logEntry;
  }

  private output(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): void {
    const logEntry = this.formatLogEntry(level, message, context, error);

    // In development, use console methods for better readability
    if (this.isDevelopment) {
      const contextStr = context
        ? ` | Context: ${JSON.stringify(context)}`
        : '';
      const errorStr = error ? ` | Error: ${error.message}` : '';

      switch (level) {
        case LogLevel.ERROR:
          console.error(
            `[${level.toUpperCase()}] ${message}${contextStr}${errorStr}`,
          );
          if (error && error.stack) {
            console.error(error.stack);
          }
          break;
        case LogLevel.WARN:
          console.warn(
            `[${level.toUpperCase()}] ${message}${contextStr}${errorStr}`,
          );
          break;
        case LogLevel.INFO:
          console.info(
            `[${level.toUpperCase()}] ${message}${contextStr}${errorStr}`,
          );
          break;
        case LogLevel.DEBUG:
          console.debug(
            `[${level.toUpperCase()}] ${message}${contextStr}${errorStr}`,
          );
          break;
      }
    } else {
      // In production (Vercel), use structured JSON logging
      // This will appear in Vercel's function logs
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext, error?: any): void {
    this.output(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.output(LogLevel.WARN, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    this.output(LogLevel.INFO, message, context);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    this.output(LogLevel.DEBUG, message, context);
  }

  /**
   * Create a logger with default context
   */
  withContext(context: LogContext): Logger {
    const logger = new Logger();
    const originalOutput = logger.output.bind(logger);

    logger.output = (
      level: LogLevel,
      message: string,
      additionalContext?: LogContext,
      error?: Error,
    ) => {
      const mergedContext = { ...context, ...additionalContext };
      originalOutput(level, message, mergedContext, error);
    };

    return logger;
  }

  /**
   * Log API request start
   */
  logRequest(method: string, endpoint: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${endpoint}`, {
      method,
      endpoint,
      ...context,
    });
  }

  /**
   * Log API request completion
   */
  logResponse(
    method: string,
    endpoint: string,
    statusCode: number,
    duration?: number,
    context?: LogContext,
  ): void {
    this.info(`API Response: ${method} ${endpoint} - ${statusCode}`, {
      method,
      endpoint,
      statusCode,
      duration,
      ...context,
    });
  }

  /**
   * Log database operation
   */
  logDatabase(operation: string, table?: string, context?: LogContext): void {
    this.debug(`Database ${operation}${table ? ` on ${table}` : ''}`, {
      operation,
      table,
      ...context,
    });
  }

  /**
   * Log authentication events
   */
  logAuth(event: string, userId?: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, {
      event,
      userId,
      ...context,
    });
  }

  /**
   * Log file operations
   */
  logFileOperation(
    operation: string,
    filename?: string,
    size?: number,
    context?: LogContext,
  ): void {
    this.info(`File ${operation}${filename ? `: ${filename}` : ''}`, {
      operation,
      filename,
      size,
      ...context,
    });
  }

  /**
   * Log cron job execution
   */
  logCron(
    jobName: string,
    status: 'started' | 'completed' | 'failed',
    context?: LogContext,
  ): void {
    const emoji =
      status === 'started' ? '🚀' : status === 'completed' ? '✅' : '❌';
    this.info(`${emoji} Cron Job: ${jobName} - ${status}`, {
      jobName,
      status,
      ...context,
    });
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience methods
export const logError = (
  message: string,
  context?: LogContext,
  error?: Error,
) => logger.error(message, context, error);
export const logWarn = (message: string, context?: LogContext) =>
  logger.warn(message, context);
export const logInfo = (message: string, context?: LogContext) =>
  logger.info(message, context);
export const logDebug = (message: string, context?: LogContext) =>
  logger.debug(message, context);

export default logger;
