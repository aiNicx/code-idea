/**
 * Sistema di logging strutturato per servizi critici
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxLocalEntries: number;
  enableMetrics: boolean;
}

class StructuredLogger {
  private config: LoggerConfig;
  private localEntries: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      maxLocalEntries: 1000,
      enableMetrics: true,
      ...config
    };

    this.sessionId = this.generateSessionId();
  }

  debug(message: string, data?: any, context?: string) {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, data?: any, context?: string) {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, data?: any, context?: string) {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, error?: Error, data?: any, context?: string) {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  fatal(message: string, error?: Error, data?: any, context?: string) {
    this.log(LogLevel.FATAL, message, context, data, error);
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: Error) {
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
      sessionId: this.sessionId
    };

    // Store locally
    this.localEntries.push(entry);
    if (this.localEntries.length > this.config.maxLocalEntries) {
      this.localEntries = this.localEntries.slice(-this.config.maxLocalEntries);
    }

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.logToRemote(entry);
    }

    // Metrics integration
    if (this.config.enableMetrics && level >= LogLevel.ERROR) {
      // Integration with metrics system would go here
    }
  }

  private logToConsole(entry: LogEntry) {
    const levelName = LogLevel[entry.level];
    const prefix = `[${entry.timestamp}] ${levelName}`;

    let formattedMessage = `${prefix}: ${entry.message}`;
    if (entry.context) {
      formattedMessage += ` [${entry.context}]`;
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, entry.data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage, entry.error || entry.data);
        break;
    }
  }

  private async logToRemote(entry: LogEntry) {
    try {
      if (!this.config.remoteEndpoint) return;

      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getLocalEntries(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.localEntries.filter(entry => entry.level >= level);
    }
    return [...this.localEntries];
  }

  clearLocalEntries() {
    this.localEntries = [];
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'context', 'data', 'error'];
      const rows = [
        headers.join(','),
        ...this.localEntries.map(entry => [
          entry.timestamp,
          LogLevel[entry.level],
          `"${entry.message}"`,
          entry.context || '',
          entry.data ? `"${JSON.stringify(entry.data)}"` : '',
          entry.error ? `"${entry.error.message}"` : ''
        ].join(','))
      ];
      return rows.join('\n');
    }

    return JSON.stringify(this.localEntries, null, 2);
  }

  // Performance monitoring integration
  startTimer(operation: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.info(`Operation completed: ${operation}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  // Context-aware logging
  withContext(context: string) {
    return {
      debug: (message: string, data?: any) => this.debug(message, data, context),
      info: (message: string, data?: any) => this.info(message, data, context),
      warn: (message: string, data?: any) => this.warn(message, data, context),
      error: (message: string, error?: Error, data?: any) => this.error(message, error, data, context),
      fatal: (message: string, error?: Error, data?: any) => this.fatal(message, error, data, context)
    };
  }
}

// Service-specific loggers
export const aiLogger = new StructuredLogger().withContext('AI');
export const configLogger = new StructuredLogger().withContext('Config');
export const docLogger = new StructuredLogger().withContext('Documentation');
export const uiLogger = new StructuredLogger().withContext('UI');

// Global logger instance
export const logger = new StructuredLogger({
  minLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.REACT_APP_LOG_ENDPOINT
});

// Utility for creating custom loggers
export const createLogger = (context: string, config?: Partial<LoggerConfig>) => {
  return new StructuredLogger(config).withContext(context);
};

// React hook for logging
export const useLogger = (context: string) => {
  return {
    debug: (message: string, data?: any) => logger.debug(message, data, context),
    info: (message: string, data?: any) => logger.info(message, data, context),
    warn: (message: string, data?: any) => logger.warn(message, data, context),
    error: (message: string, error?: Error, data?: any) => logger.error(message, error, data, context),
    fatal: (message: string, error?: Error, data?: any) => logger.fatal(message, error, data, context)
  };
};