import nodemailer from 'nodemailer';
import prisma from './db';

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'gmail';
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@lovelink.app';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'LoveLink';
const APP_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

let transporter: nodemailer.Transporter | null = null;

// ============================================
// EMAIL TRANSPORTER (GMAIL)
// ============================================

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  if (EMAIL_PROVIDER !== 'gmail') {
    console.warn('⚠️ Only Gmail provider is supported');
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD, // App Password
    },
  });

  // Verify connection
  try {
    await transporter.verify();
    console.log('📧 Gmail email service connected');
  } catch (error) {
    console.error('❌ Gmail email service connection failed:', error);
    throw new Error('Email service not configured');
  }

  return transporter;
};

// ============================================
// EMAIL LOGGING
// ============================================

interface EmailLogData {
  userId?: string;
  orderId?: string;
  storyId?: string;
  templateId?: string;
  recipientEmail: string;
  senderEmail: string;
  subject: string;
  emailType: 'PURCHASE_CONFIRMATION' | 'PAYMENT_RECEIPT' | 'SYSTEM_NOTIFICATION' | 'CUSTOM';
}

const createEmailLog = async (data: EmailLogData) => {
  try {
    return await prisma.emailLog.create({
      data: {
        ...data,
        status: 'PENDING',
        provider: EMAIL_PROVIDER,
      },
    });
  } catch (error) {
    console.error('Failed to create email log:', error);
    return null;
  }
};

const updateEmailLog = async (
  emailLogId: string,
  status: 'SENT' | 'FAILED',
  messageId?: string,
  errorMessage?: string
) => {
  try {
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        status,
        providerMessageId: messageId,
        errorMessage,
        ...(status === 'SENT' ? { sentAt: new Date() } : { failedAt: new Date() }),
      },
    });
  } catch (error) {
    console.error('Failed to update email log:', error);
  }
};

// ============================================
// SEND EMAIL (WITH LOGGING)
// ============================================

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  logData: EmailLogData
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  let emailLog: any = null;

  try {
    // Create email log
    emailLog = await createEmailLog(logData);

    // Get transporter
    const transport = await getTransporter();

    // Send email
    const info = await transport.sendMail({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent: ${info.messageId}`);

    // Update log as sent
    if (emailLog) {
      await updateEmailLog(emailLog.id, 'SENT', info.messageId);
    }

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Email send error:', error);

    // Update log as failed
    if (emailLog) {
      await updateEmailLog(emailLog.id, 'FAILED', undefined, error.message);
    }

    return { success: false, error: error.message };
  }
};

// ============================================
// PURCHASE CONFIRMATION EMAIL
// ============================================

export const sendPurchaseConfirmationEmail = async (data: {
  userId: string;
  orderId: string;
  storyId: string;
  templateId: string;
  customerName: string;
  customerEmail: string;
  templateName: string;
  amount: number;
  orderDate: Date;
  storyLink: string;
}): Promise<{ success: boolean; error?: string }> => {
  const subject = `🎉 Your ${data.templateName} is Ready!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px 20px; }
    .content h2 { color: #667eea; margin-top: 0; }
    .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .order-details p { margin: 10px 0; }
    .order-details strong { color: #333; }
    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
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
        <a href="${APP_URL}/dashboard" class="button">Go to Dashboard</a>
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

  return sendEmail(data.customerEmail, subject, html, {
    userId: data.userId,
    orderId: data.orderId,
    storyId: data.storyId,
    templateId: data.templateId,
    recipientEmail: data.customerEmail,
    senderEmail: EMAIL_FROM,
    subject,
    emailType: 'PURCHASE_CONFIRMATION',
  });
};

// ============================================
// PAYMENT RECEIPT EMAIL
// ============================================

export const sendPaymentReceiptEmail = async (data: {
  userId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  templateName: string;
  amount: number;
  transactionId: string;
  paymentDate: Date;
}): Promise<{ success: boolean; error?: string }> => {
  const subject = `Payment Receipt - Order #${data.orderId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #667eea; padding: 30px 20px; text-align: center; color: white; }
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

  return sendEmail(data.customerEmail, subject, html, {
    userId: data.userId,
    orderId: data.orderId,
    recipientEmail: data.customerEmail,
    senderEmail: EMAIL_FROM,
    subject,
    emailType: 'PAYMENT_RECEIPT',
  });
};

// ============================================
// WELCOME EMAIL (for new users)
// ============================================

export const sendWelcomeEmail = async (data: {
  userId: string;
  userName: string;
  userEmail: string;
}): Promise<{ success: boolean; error?: string }> => {
  const subject = `Welcome to LoveLink! 💝`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to LoveLink</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
    .content { padding: 30px 20px; }
    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
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
        <a href="${APP_URL}/templates" class="button">Explore Templates</a>
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

  return sendEmail(data.userEmail, subject, html, {
    userId: data.userId,
    recipientEmail: data.userEmail,
    senderEmail: EMAIL_FROM,
    subject,
    emailType: 'SYSTEM_NOTIFICATION',
  });
};

// ============================================
// SYSTEM NOTIFICATION EMAIL
// ============================================

export const sendSystemNotificationEmail = async (data: {
  userId?: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
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

  return sendEmail(data.recipientEmail, data.subject, html, {
    userId: data.userId,
    recipientEmail: data.recipientEmail,
    senderEmail: EMAIL_FROM,
    subject: data.subject,
    emailType: 'SYSTEM_NOTIFICATION',
  });
};

// ============================================
// RETRY FAILED EMAIL
// ============================================

export const retryFailedEmail = async (emailLogId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailLogId },
      include: {
        user: true,
        order: true,
        story: true,
        template: true,
      },
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

    // Retry based on email type
    if (emailLog.emailType === 'PURCHASE_CONFIRMATION' && emailLog.order && emailLog.story) {
      return await sendPurchaseConfirmationEmail({
        userId: emailLog.userId!,
        orderId: emailLog.orderId!,
        storyId: emailLog.storyId!,
        templateId: emailLog.templateId!,
        customerName: emailLog.user?.name || 'Customer',
        customerEmail: emailLog.recipientEmail,
        templateName: emailLog.template?.name || 'Story',
        amount: emailLog.order.totalAmount,
        orderDate: emailLog.order.createdAt,
        storyLink: `${APP_URL}/story/${emailLog.story.slug}`,
      });
    }

    return { success: false, error: 'Email type not supported for retry' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
