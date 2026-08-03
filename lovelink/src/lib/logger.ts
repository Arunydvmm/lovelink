import prisma from './db';
import fs from 'fs';
import path from 'path';

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

class Logger {
  private logFile: string;

  constructor() {
    this.logFile = process.env.LOG_FILE || 'logs/app.log';
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  private async writeToFile(message: string): Promise<void> {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private async saveToDatabase(level: LogLevel, category: string, message: string, meta?: any, stackTrace?: string): Promise<void> {
    try {
      await prisma.systemLog.create({
        data: {
          level: level as any,
          category,
          message,
          metadata: meta || {},
          stackTrace,
        },
      });
    } catch (error) {
      console.error('Failed to save log to database:', error);
    }
  }

  async debug(message: string, meta?: any): Promise<void> {
    const formatted = this.formatMessage(LogLevel.DEBUG, message, meta);
    console.log(formatted);
    await this.writeToFile(formatted);
  }

  async info(message: string, meta?: any): Promise<void> {
    const formatted = this.formatMessage(LogLevel.INFO, message, meta);
    console.log(formatted);
    await this.writeToFile(formatted);
    await this.saveToDatabase(LogLevel.INFO, 'APP', message, meta);
  }

  async warn(message: string, meta?: any): Promise<void> {
    const formatted = this.formatMessage(LogLevel.WARN, message, meta);
    console.warn(formatted);
    await this.writeToFile(formatted);
    await this.saveToDatabase(LogLevel.WARN, 'APP', message, meta);
  }

  async error(message: string, error?: Error, meta?: any): Promise<void> {
    const formatted = this.formatMessage(LogLevel.ERROR, message, meta);
    console.error(formatted);
    await this.writeToFile(formatted);
    await this.saveToDatabase(LogLevel.ERROR, 'APP', message, meta, error?.stack);
  }

  async fatal(message: string, error?: Error, meta?: any): Promise<void> {
    const formatted = this.formatMessage(LogLevel.FATAL, message, meta);
    console.error(formatted);
    await this.writeToFile(formatted);
    await this.saveToDatabase(LogLevel.FATAL, 'APP', message, meta, error?.stack);
  }

  async apiCall(method: string, path: string, statusCode: number, duration: number, meta?: any): Promise<void> {
    const message = `${method} ${path} ${statusCode}`;
    await this.info(message, { duration, ...meta });
  }

  async apiError(method: string, path: string, statusCode: number, error: string, meta?: any): Promise<void> {
    const message = `${method} ${path} ${statusCode} - ${error}`;
    await this.warn(message, meta);
  }

  async databaseQuery(query: string, duration: number, meta?: any): Promise<void> {
    const message = `Database query executed in ${duration}ms`;
    await this.debug(message, { query, ...meta });
  }

  async authEvent(action: string, userId?: string, meta?: any): Promise<void> {
    const message = `Auth event: ${action}`;
    await this.info(message, { userId, ...meta });
  }

  async paymentEvent(action: string, orderId: string, amount: number, meta?: any): Promise<void> {
    const message = `Payment event: ${action}`;
    await this.info(message, { orderId, amount, ...meta });
  }

  async securityEvent(action: string, severity: 'LOW' | 'MEDIUM' | 'HIGH', meta?: any): Promise<void> {
    const level = severity === 'HIGH' ? LogLevel.ERROR : severity === 'MEDIUM' ? LogLevel.WARN : LogLevel.INFO;
    const message = `Security event: ${action}`;
    await this.saveToDatabase(level, 'SECURITY', message, { severity, ...meta });
  }
}

export const logger = new Logger();
