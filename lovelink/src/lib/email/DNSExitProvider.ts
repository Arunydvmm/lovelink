/**
 * DNSExit SMTP Mail Relay Provider
 * 
 * Production-ready email provider using DNSExit SMTP relay
 * with automatic failover to backup server.
 */

import nodemailer from 'nodemailer';
import { EmailProvider, EmailOptions, EmailResult } from './EmailProvider';

export class DNSExitProvider extends EmailProvider {
  name = 'DNSExit';

  private primaryHost: string;
  private backupHost: string;
  private port: number;
  private secure: boolean;
  private user: string;
  private password: string;
  private fromEmail: string;
  private fromName: string;

  private transporter: nodemailer.Transporter | null = null;
  private isBackup = false;

  constructor() {
    super();

    // Load configuration from environment
    this.primaryHost = process.env.SMTP_HOST || 'relay.dnsexit.com';
    this.backupHost = process.env.SMTP_BACKUP_HOST || 'relaybackup.dnsexit.com';
    this.port = parseInt(process.env.SMTP_PORT || '587');
    this.secure = process.env.SMTP_SECURE === 'true';
    this.user = process.env.SMTP_USER || '';
    this.password = process.env.SMTP_PASSWORD || '';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@lovelink.app';
    this.fromName = process.env.EMAIL_FROM_NAME || 'LoveLink';

    // Validate configuration
    if (!this.user || !this.password) {
      console.warn('⚠️ DNSExit SMTP credentials not configured');
    }
  }

  /**
   * Get or create transporter for the specified host
   */
  private async getTransporter(host: string): Promise<nodemailer.Transporter> {
    const config: nodemailer.TransportOptions = {
      host,
      port: this.port,
      secure: this.secure, // false for STARTTLS
      requireTLS: true, // Force STARTTLS
      auth: {
        user: this.user,
        pass: this.password,
      },
      // Connection timeout
      connectionTimeout: 10000,
      // Socket timeout
      socketTimeout: 10000,
      // Enable debug logs in development
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    };

    return nodemailer.createTransport(config);
  }

  /**
   * Send email with automatic failover
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      // Try primary server first
      const result = await this.sendWithHost(this.primaryHost, options);
      
      if (result.success) {
        return result;
      }

      // If primary fails, try backup
      console.warn(`⚠️ Primary SMTP failed, trying backup server...`);
      return await this.sendWithHost(this.backupHost, options, true);

    } catch (error: any) {
      console.error('❌ DNSExit email send error:', error);
      return {
        success: false,
        error: error.message || 'Unknown email error',
        provider: this.name,
        smtpHost: this.isBackup ? this.backupHost : this.primaryHost,
        smtpPort: this.port,
      };
    }
  }

  /**
   * Send email using specific host
   */
  private async sendWithHost(
    host: string,
    options: EmailOptions,
    isBackup = false
  ): Promise<EmailResult> {
    try {
      const transporter = await this.getTransporter(host);
      this.isBackup = isBackup;

      // Sanitize recipient email
      const sanitizedTo = this.sanitizeEmail(options.to);
      if (!sanitizedTo) {
        throw new Error('Invalid recipient email address');
      }

      // Sanitize subject to prevent header injection
      const sanitizedSubject = this.sanitizeSubject(options.subject);

      const info = await transporter.sendMail({
        from: options.from || `${this.fromName} <${this.fromEmail}>`,
        to: sanitizedTo,
        subject: sanitizedSubject,
        html: options.html,
        replyTo: options.replyTo,
      });

      console.log(`✅ Email sent via ${host}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        provider: this.name,
        smtpHost: host,
        smtpPort: this.port,
      };

    } catch (error: any) {
      console.error(`❌ SMTP error with ${host}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        provider: this.name,
        smtpHost: host,
        smtpPort: this.port,
      };
    }
  }

  /**
   * Verify SMTP connection
   */
  async verify(): Promise<boolean> {
    try {
      // Try primary server
      const primaryTransporter = await this.getTransporter(this.primaryHost);
      await primaryTransporter.verify();
      console.log(`✅ DNSExit primary SMTP verified: ${this.primaryHost}`);
      return true;
    } catch (primaryError) {
      console.warn(`⚠️ Primary SMTP verification failed, trying backup...`);
      
      try {
        // Try backup server
        const backupTransporter = await this.getTransporter(this.backupHost);
        await backupTransporter.verify();
        console.log(`✅ DNSExit backup SMTP verified: ${this.backupHost}`);
        return true;
      } catch (backupError) {
        console.error('❌ Both DNSExit SMTP servers failed verification');
        return false;
      }
    }
  }

  /**
   * Get provider configuration
   */
  getConfig(): { host: string; port: number; secure: boolean } {
    return {
      host: this.isBackup ? this.backupHost : this.primaryHost,
      port: this.port,
      secure: this.secure,
    };
  }

  /**
   * Sanitize email address to prevent injection
   */
  private sanitizeEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmed = email.trim();
    
    if (!emailRegex.test(trimmed)) {
      return null;
    }

    // Remove any potential header injection attempts
    return trimmed.replace(/[\r\n]/g, '');
  }

  /**
   * Sanitize subject to prevent header injection
   */
  private sanitizeSubject(subject: string): string {
    return subject.replace(/[\r\n]/g, '').substring(0, 998);
  }
}
