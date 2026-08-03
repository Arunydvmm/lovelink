import { Request, Response } from 'express';
import prisma from '../lib/db';
import {
  sendPasswordResetEmail,
  sendPaymentReceiptEmail,
  sendWelcomeEmail,
} from '../lib/email';

// ============================================
// SEND WELCOME EMAIL (ADMIN)
// ============================================

export const sendWelcomeNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await sendWelcomeEmail(user.email, user.displayName || 'User');

    await prisma.notification.create({
      data: {
        userId,
        type: 'WELCOME',
        title: 'Welcome to LoveLink!',
        message: 'Welcome email has been sent to your inbox.',
      },
    });

    res.json({ message: 'Welcome email sent' });
  } catch (error: any) {
    console.error('Send welcome notification error:', error);
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
};

// ============================================
// RESEND VERIFICATION EMAIL (DEPRECATED)
// ============================================
// NOTE: This function is deprecated. sendVerificationEmail does not exist in email service.
// Email verification is typically handled during the auth flow.
/*
export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: 'Email already verified' });
      return;
    }

    // Generate new token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken: token },
    });

    await sendVerificationEmail(user.email, user.displayName || 'User', token);

    res.json({ message: 'Verification email sent' });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
};
*/

// ============================================
// SEND OFFER NOTIFICATION
// ============================================

export const sendOfferNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, actionUrl } = req.body;

    // Get all active users
    const users = await prisma.user.findMany({
      where: { isActive: true, emailVerified: { not: null } },
      select: { id: true },
    });

    // Create notifications for all users
    const notifications = users.map((user) => ({
      userId: user.id,
      type: 'OFFER' as const,
      title,
      message,
      actionUrl,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    res.json({
      message: `Offer notification sent to ${users.length} users`,
      count: users.length,
    });
  } catch (error: any) {
    console.error('Send offer notification error:', error);
    res.status(500).json({ error: 'Failed to send offer notification' });
  }
};

// ============================================
// SEND ANNOUNCEMENT
// ============================================

export const sendAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, linkText, linkUrl, badge, bgColor } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        text,
        linkText,
        linkUrl,
        badge,
        bgColor,
        isActive: true,
        scheduledFor: new Date(),
      },
    });

    // Create notifications
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const notifications = users.map((user) => ({
      userId: user.id,
      type: 'ANNOUNCEMENT' as const,
      title: 'New Announcement',
      message: text,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    res.json({
      announcement,
      notificationsSent: users.length,
    });
  } catch (error: any) {
    console.error('Send announcement error:', error);
    res.status(500).json({ error: 'Failed to send announcement' });
  }
};

// ============================================
// GET NOTIFICATION STATS
// ============================================

export const getNotificationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [total, unread, byType] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: true,
      }),
    ]);

    res.json({
      total,
      unread,
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
    });
  } catch (error: any) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
};
