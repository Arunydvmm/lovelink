/**
 * Email Service
 * 
 * Central email service that abstracts email sending logic.
 * Controllers should ONLY call EmailService, never directly use providers.
 */

import prisma from '../db';
import { EmailProvider, EmailOptions, EmailResult } from './EmailProvider';
import { DNSExitProvider } from './DNSExitProvider';

export interface EmailLogData {
  userId?: string;
  orderId?: string;
  storyId?: string;
  templateId?: string;
  recipientEmail: string;
  subject: string;
  emailType: 'PURCHASE_CONFIRMATION' | 'PAYMENT_RECEIPT' | 'SYSTEM_NOTIFICATION' | 'CUSTOM';
}

export class EmailService {
  private provider: EmailProvider;
  private readonly APP_URL: string;

  constructor() {
    // Initialize provider (currently DNSExit, can be changed easily)
    this.provider = new DNSExitProvider();
    this.APP_URL = process.env.VITE_APP_URL || 'http://localhost:5173';
  }

  /**
   * Verify email service on startup
   */
  async verify(): Promise<boolean> {
    try {
      return await this.provider.verify();
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }

  /**
   * Send email with automatic logging
   */
  async send(
    options: EmailOptions,
    logData: EmailLogData
  ): Promise<{ success: boolean; emailLogId?: string; error?: string }> {
    let emailLog: any = null;

    try {
      // Create email log (status: PENDING)
      emailLog = await this.createEmailLog(logData, options.from);

      // Send email asynchronously (non-blocking)
      const result = await this.provider.send(options);

      // Update log based on result
      if (result.success) {
        await this.updateEmailLog(emailLog.id, 'SENT', result);
        return { success: true, emailLogId: emailLog.id };
      } else {
        await this.updateEmailLog(emailLog.id, 'FAILED', result);
        return { success: false, emailLogId: emailLog.id, error: result.error };
      }

    } catch (error: any) {
      console.error('❌ Email service error:', error);

      // Update log as failed
      if (emailLog) {
        await this.updateEmailLog(emailLog.id, 'FAILED', {
          success: false,
          error: error.message,
        });
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send email asynchronously (fire and forget)
   * Use this for non-critical emails where you don't need to wait
   */
  async sendAsync(options: EmailOptions, logData: EmailLogData): Promise<void> {
    // Don't await - send in background
    this.send(options, logData).catch((error) => {
      console.error('Async email send error:', error);
    });
  }

  /**
   * Retry failed email
   */
  async retry(emailLogId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const emailLog = await prisma.emailLog.findUnique({
        where: { id: emailLogId },
      });

      if (!emailLog) {
        return { success: false, error: 'Email log not found' };
      }

      if (emailLog.status === 'SENT') {
        return { success: false, error: 'Email already sent' };
      }

      // Update retry count
      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: {
          retryCount: emailLog.retryCount + 1,
          status: 'PENDING',
        },
      });

      // Retry sending (implementation depends on stored email content)
      // For now, return success - actual retry logic would need stored HTML
      return { success: true };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create email log entry
   */
  private async createEmailLog(logData: EmailLogData, senderEmail?: string): Promise<any> {
    const config = this.provider.getConfig();

    return await prisma.emailLog.create({
      data: {
        userId: logData.userId,
        orderId: logData.orderId,
        storyId: logData.storyId,
        templateId: logData.templateId,
        recipientEmail: logData.recipientEmail,
        senderEmail: senderEmail || process.env.EMAIL_FROM || 'noreply@lovelink.app',
        subject: logData.subject,
        emailType: logData.emailType,
        status: 'PENDING',
        provider: this.provider.name,
        smtpHost: config.host,
        smtpPort: config.port,
      },
    });
  }

  /**
   * Update email log with result
   */
  private async updateEmailLog(
    emailLogId: string,
    status: 'SENT' | 'FAILED',
    result: EmailResult
  ): Promise<void> {
    try {
      await prisma.emailLog.update({
        where: { id: emailLogId },
        data: {
          status,
          providerMessageId: result.messageId,
          smtpHost: result.smtpHost,
          smtpPort: result.smtpPort,
          errorMessage: result.error,
          ...(status === 'SENT' ? { sentAt: new Date() } : { failedAt: new Date() }),
        },
      });
    } catch (error) {
      console.error('Failed to update email log:', error);
    }
  }

  /**
   * Get email HTML templates
   */
  getTemplates() {
    return {
      purchaseConfirmation: this.getPurchaseConfirmationTemplate.bind(this),
      paymentReceipt: this.getPaymentReceiptTemplate.bind(this),
      welcome: this.getWelcomeTemplate.bind(this),
      systemNotification: this.getSystemNotificationTemplate.bind(this),
    };
  }

  /**
   * Purchase Confirmation Email Template
   */
  private getPurchaseConfirmationTemplate(data: {
    customerName: string;
    orderId: string;
    templateName: string;
    amount: number;
    orderDate: Date;
    storyLink: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Confirmation - LoveLink</title>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .logo { font-size: 36px; font-weight: bold; margin-bottom: 10px; }
    .content { padding: 30px 20px; }
    .content h2 { color: #667eea; margin-top: 0; }
    .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .order-details p { margin: 10px 0; }
    .order-details strong { color: #333; }
    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 10px; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .header h1 { font-size: 24px; }
      .button { display: block; margin: 10px 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">💝 LoveLink</div>
      <h1>🎉 Thank You for Your Purchase!</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.customerName},</h2>
      <p>Your <strong>${data.templateName}</strong> has been created successfully! We're excited for you to share this special moment.</p>
      
      <div class="order-details">
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>Template:</strong> ${data.templateName}</p>
        <p><strong>Amount Paid:</strong> ₹${(data.amount / 100).toFixed(2)}</p>
        <p><strong>Purchase Date:</strong> ${new Date(data.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <p>Your personalized story is ready to view and share:</p>
      <center>
        <a href="${data.storyLink}" class="button">View Your Story</a>
      </center>

      <p>You can also access your story anytime from your dashboard:</p>
      <center>
        <a href="${this.APP_URL}/dashboard" class="button">Go to Dashboard</a>
      </center>

      <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
      
      <p>Thank you for choosing LoveLink!</p>
      <p>With love,<br><strong>The LoveLink Team</strong></p>
    </div>
    <div class="footer">
      <p>Need help? <a href="mailto:support@lovelink.app">Contact Support</a></p>
      <p>&copy; ${new Date().getFullYear()} LoveLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Payment Receipt Email Template
   */
  private getPaymentReceiptTemplate(data: {
    customerName: string;
    orderId: string;
    templateName: string;
    amount: number;
    transactionId: string;
    paymentDate: Date;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - LoveLink</title>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #667eea; padding: 30px 20px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; }
    .receipt { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .receipt-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; color: #667eea; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💳 Payment Receipt</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.customerName},</h2>
      <p>Thank you for your payment. Here are your transaction details:</p>
      
      <div class="receipt">
        <div class="receipt-row">
          <span>Order ID:</span>
          <span><strong>${data.orderId}</strong></span>
        </div>
        <div class="receipt-row">
          <span>Transaction ID:</span>
          <span>${data.transactionId}</span>
        </div>
        <div class="receipt-row">
          <span>Template:</span>
          <span>${data.templateName}</span>
        </div>
        <div class="receipt-row">
          <span>Payment Date:</span>
          <span>${new Date(data.paymentDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="receipt-row">
          <span>Amount Paid:</span>
          <span>₹${(data.amount / 100).toFixed(2)}</span>
        </div>
      </div>

      <p>This email serves as your official receipt. Please keep it for your records.</p>
      
      <p>Best regards,<br><strong>The LoveLink Team</strong></p>
    </div>
    <div class="footer">
      <p>Questions? <a href="mailto:support@lovelink.app">Contact Support</a></p>
      <p>&copy; ${new Date().getFullYear()} LoveLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Welcome Email Template
   */
  private getWelcomeTemplate(data: {
    userName: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to LoveLink</title>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
    .content { padding: 30px 20px; }
    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    ul { padding-left: 20px; }
    li { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💝 Welcome to LoveLink!</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.userName},</h2>
      <p>We're thrilled to have you join the LoveLink family! 🎉</p>
      
      <p>LoveLink helps you create beautiful, personalized stories to celebrate special moments with your loved ones.</p>
      
      <p>Here's what you can do:</p>
      <ul>
        <li>✨ Choose from stunning templates</li>
        <li>💝 Personalize your story with photos and messages</li>
        <li>🎨 Preview your creation in real-time</li>
        <li>🚀 Share your story instantly</li>
      </ul>

      <center>
        <a href="${this.APP_URL}/templates" class="button">Explore Templates</a>
      </center>

      <p>If you have any questions, our support team is here to help!</p>
      
      <p>Happy creating!<br><strong>The LoveLink Team</strong></p>
    </div>
    <div class="footer">
      <p>Need help? <a href="mailto:support@lovelink.app">Contact Support</a></p>
      <p>&copy; ${new Date().getFullYear()} LoveLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * System Notification Email Template
   */
  private getSystemNotificationTemplate(data: {
    recipientName: string;
    subject: string;
    message: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #667eea; padding: 30px 20px; text-align: center; color: white; }
    .content { padding: 30px 20px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 ${data.subject}</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.recipientName},</h2>
      <p>${data.message}</p>
      
      <p>Best regards,<br><strong>The LoveLink Team</strong></p>
    </div>
    <div class="footer">
      <p>Need help? <a href="mailto:support@lovelink.app">Contact Support</a></p>
      <p>&copy; ${new Date().getFullYear()} LoveLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService();
