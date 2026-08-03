import { Request, Response } from 'express';
import prisma from '../lib/db';

// ============================================
// GET USER PROFILE
// ============================================

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        profileImage: true,
        role: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// ============================================
// UPDATE USER PROFILE
// ============================================

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { displayName, profileImage } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName && { displayName }),
        ...(profileImage && { profileImage }),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        profileImage: true,
      },
    });

    res.json(user);
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ============================================
// GET PURCHASE HISTORY
// ============================================

export const getPurchaseHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          template: { select: { name: true, slug: true, coverImage: true } },
          story: { select: { slug: true, senderName: true, recipientName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get purchase history error:', error);
    res.status(500).json({ error: 'Failed to fetch purchase history' });
  }
};

// ============================================
// GET PAYMENT HISTORY
// ============================================

export const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        include: {
          order: {
            select: {
              orderId: true,
              templateName: true,
              totalAmount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where: { userId } }),
    ]);

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};

// ============================================
// GET INVOICES
// ============================================

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          order: { userId },
        },
        include: {
          order: {
            select: {
              orderId: true,
              templateName: true,
              totalAmount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({
        where: {
          order: { userId },
        },
      }),
    ]);

    res.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// ============================================
// GET USER ANALYTICS
// ============================================

export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const [stories, orders, totalSpent] = await Promise.all([
      prisma.story.findMany({
        where: { userId },
        select: {
          id: true,
          views: true,
          uniqueVisits: true,
          isPublished: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        where: { userId, paymentStatus: 'PAID' },
      }),
      prisma.payment.aggregate({
        where: { userId, status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

    const totalViews = stories.reduce((acc, s) => acc + s.views, 0);
    const totalUniqueVisits = stories.reduce((acc, s) => acc + s.uniqueVisits, 0);
    const publishedStories = stories.filter((s) => s.isPublished).length;

    res.json({
      totalStories: stories.length,
      publishedStories,
      totalOrders: orders.length,
      totalSpent: totalSpent._sum.amount || 0,
      totalViews,
      totalUniqueVisits,
      averageViewsPerStory: stories.length > 0 ? totalViews / stories.length : 0,
      stories: stories.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// ============================================
// GET NOTIFICATIONS
// ============================================

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const unreadOnly = req.query.unread === 'true';

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(notifications);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// ============================================
// MARK NOTIFICATION AS READ
// ============================================

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { notificationId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });

    res.json(notification);
  } catch (error: any) {
    console.error('Mark notification error:', error);
    res.status(500).json({ error: 'Failed to mark notification' });
  }
};

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================

export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Mark all notifications error:', error);
    res.status(500).json({ error: 'Failed to mark notifications' });
  }
};
