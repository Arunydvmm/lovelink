/**
 * Email Provider Interface
 * 
 * Abstract interface for all email providers.
 * Ensures consistent email sending regardless of underlying SMTP service.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
  smtpHost?: string;
  smtpPort?: number;
}

export abstract class EmailProvider {
  abstract name: string;

  /**
   * Send an email
   * @param options Email options
   * @returns Email result with success status and message ID
   */
  abstract send(options: EmailOptions): Promise<EmailResult>;

  /**
   * Verify connection to email server
   * @returns true if connection successful
   */
  abstract verify(): Promise<boolean>;

  /**
   * Get provider configuration details
   */
  abstract getConfig(): {
    host: string;
    port: number;
    secure: boolean;
  };
}
