import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  source?: string;
  userId?: number;
  seasonId?: number;
  sessionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private readonly logLevel: LogLevel;
  private readonly maxLogEntries = 1000;
  private logEntries: LogEntry[] = [];
  private sessionId = Math.random().toString(36).substr(2, 9);

  constructor() {
    this.logLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;
  }

  debug(message: string, data?: any, source?: string): void {
    this.log(LogLevel.DEBUG, message, data, source);
  }

  info(message: string, data?: any, source?: string): void {
    this.log(LogLevel.INFO, message, data, source);
  }

  warn(message: string, data?: any, source?: string): void {
    this.log(LogLevel.WARN, message, data, source);
  }

  error(message: string, data?: any, source?: string): void {
    this.log(LogLevel.ERROR, message, data, source);
  }

  fatal(message: string, data?: any, source?: string): void {
    this.log(LogLevel.FATAL, message, data, source);
  }

  private log(level: LogLevel, message: string, data?: any, source?: string): void {
    if (level < this.logLevel) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      source,
      sessionId: this.sessionId,
      userId: this.getCurrentUserId(),
      seasonId: this.getCurrentSeasonId()
    };

    // Add to in-memory log
    this.logEntries.unshift(logEntry);
    
    // Keep only the most recent entries
    if (this.logEntries.length > this.maxLogEntries) {
      this.logEntries = this.logEntries.slice(0, this.maxLogEntries);
    }

    // Console output
    this.outputToConsole(logEntry);

    // Send to external logging service if in production
    if (environment.production && level >= LogLevel.ERROR) {
      this.sendToExternalService(logEntry);
    }

    // Store critical logs in localStorage for offline analysis
    if (level >= LogLevel.ERROR) {
      this.storeLocally(logEntry);
    }
  }

  private outputToConsole(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const levelName = LogLevel[logEntry.level];
    const source = logEntry.source ? `[${logEntry.source}]` : '';
    const userId = logEntry.userId ? `[User:${logEntry.userId}]` : '';
    const seasonId = logEntry.seasonId ? `[Season:${logEntry.seasonId}]` : '';
    
    const prefix = `${timestamp} ${levelName} ${source}${userId}${seasonId}`;
    const message = `${prefix} ${logEntry.message}`;

    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(message, logEntry.data);
        break;
      case LogLevel.INFO:
        console.info(message, logEntry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, logEntry.data);
        break;
      case LogLevel.ERROR:
        console.error(message, logEntry.data);
        break;
      case LogLevel.FATAL:
        console.error(`🚨 FATAL: ${message}`, logEntry.data);
        break;
    }
  }

  private sendToExternalService(logEntry: LogEntry): void {
    // Implement external logging service integration
    // Example: Sentry, LogRocket, etc.
    if (environment.production) {
      // Send to your logging service
      console.log('Sending log to external service:', logEntry);
    }
  }

  private storeLocally(logEntry: LogEntry): void {
    try {
      const storedLogs = localStorage.getItem('boukii_error_logs');
      const logs = storedLogs ? JSON.parse(storedLogs) : [];
      
      logs.unshift({
        ...logEntry,
        timestamp: logEntry.timestamp.toISOString()
      });

      // Keep only last 50 error logs locally
      const trimmedLogs = logs.slice(0, 50);
      
      localStorage.setItem('boukii_error_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Failed to store log locally:', error);
    }
  }

  private getCurrentUserId(): number | undefined {
    // Get current user ID from auth service or local storage
    try {
      const userString = localStorage.getItem('boukii_user');
      if (userString) {
        const user = JSON.parse(userString);
        return user.id;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return undefined;
  }

  private getCurrentSeasonId(): number | undefined {
    // Get current season ID from season context service or local storage
    try {
      const seasonString = localStorage.getItem('boukii_current_season');
      if (seasonString) {
        const season = JSON.parse(seasonString);
        return season.id;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return undefined;
  }

  // Public methods for log management
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = this.logEntries;
    
    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }
    
    if (limit) {
      filteredLogs = filteredLogs.slice(0, limit);
    }
    
    return filteredLogs;
  }

  getErrorLogs(): LogEntry[] {
    return this.getLogs(LogLevel.ERROR);
  }

  clearLogs(): void {
    this.logEntries = [];
    localStorage.removeItem('boukii_error_logs');
  }

  exportLogs(): string {
    return JSON.stringify(this.logEntries, null, 2);
  }

  downloadLogs(): void {
    const logs = this.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `boukii-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  setLogLevel(level: LogLevel): void {
    // Allow runtime log level changes in development
    if (!environment.production) {
      (this as any).logLevel = level;
    }
  }

  // Performance logging
  startTimer(label: string): void {
    console.time(label);
    this.debug(`Timer started: ${label}`);
  }

  endTimer(label: string): void {
    console.timeEnd(label);
    this.debug(`Timer ended: ${label}`);
  }

  // Structured logging methods
  logUserAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, {
      action,
      data,
      timestamp: Date.now()
    }, 'UserAction');
  }

  logApiCall(method: string, url: string, duration: number, status?: number): void {
    const level = status && status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API ${method} ${url} (${duration}ms)`, {
      method,
      url,
      duration,
      status
    }, 'ApiCall');
  }

  logSeasonChange(fromSeasonId: number | null, toSeasonId: number): void {
    this.info('Season Changed', {
      from: fromSeasonId,
      to: toSeasonId,
      timestamp: Date.now()
    }, 'SeasonContext');
  }
}