import { Request, Response } from 'express';
import prisma from '../lib/db';
import { retryFailedEmail } from '../lib/email';

// ============================================
// GET EMAIL LOGS (ADMIN)
// ============================================

export const getEmailLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      emailType,
      recipientEmail,
      userId,
      orderId,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (emailType) {
      where.emailType = emailType;
    }

    if (recipientEmail) {
      where.recipientEmail = { contains: recipientEmail as string, mode: 'insensitive' };
    }

    if (userId) {
      where.userId = userId;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    const [emailLogs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          order: {
            select: {
              id: true,
              orderId: true,
              templateName: true,
            },
          },
          story: {
            select: {
              id: true,
              slug: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.emailLog.count({ where }),
    ]);

    res.json({
      emailLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get email logs error:', error);
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
};

// ============================================
// GET EMAIL LOG BY ID (ADMIN)
// ============================================

export const getEmailLogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const emailLog = await prisma.emailLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImage: true,
          },
        },
        order: true,
        story: true,
        template: true,
      },
    });

    if (!emailLog) {
      res.status(404).json({ error: 'Email log not found' });
      return;
    }

    res.json({ emailLog });
  } catch (error: any) {
    console.error('Get email log error:', error);
    res.status(500).json({ error: 'Failed to fetch email log' });
  }
};

// ============================================
// RETRY FAILED EMAIL (ADMIN)
// ============================================

export const retryEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await retryFailedEmail(id);

    if (!result.success) {
      res.status(400).json({ error: result.error || 'Failed to retry email' });
      return;
    }

    res.json({ message: 'Email retry initiated successfully' });
  } catch (error: any) {
    console.error('Retry email error:', error);
    res.status(500).json({ error: 'Failed to retry email' });
  }
};

// ============================================
// EMAIL STATISTICS (ADMIN)
// ============================================

export const getEmailStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [
      totalEmails,
      sentEmails,
      failedEmails,
      pendingEmails,
      emailsByType,
    ] = await Promise.all([
      prisma.emailLog.count({ where }),
      prisma.emailLog.count({ where: { ...where, status: 'SENT' } }),
      prisma.emailLog.count({ where: { ...where, status: 'FAILED' } }),
      prisma.emailLog.count({ where: { ...where, status: 'PENDING' } }),
      prisma.emailLog.groupBy({
        by: ['emailType'],
        where,
        _count: true,
      }),
    ]);

    const successRate = totalEmails > 0 ? ((sentEmails / totalEmails) * 100).toFixed(2) : '0';

    res.json({
      stats: {
        totalEmails,
        sentEmails,
        failedEmails,
        pendingEmails,
        successRate: `${successRate}%`,
      },
      emailsByType: emailsByType.map((item) => ({
        type: item.emailType,
        count: item._count,
      })),
    });
  } catch (error: any) {
    console.error('Get email stats error:', error);
    res.status(500).json({ error: 'Failed to fetch email statistics' });
  }
};

// ============================================
// EXPORT EMAIL LOGS (ADMIN)
// ============================================

export const exportEmailLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, emailType, startDate, endDate } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (emailType) where.emailType = emailType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const emailLogs = await prisma.emailLog.findMany({
      where,
      include: {
        user: { select: { email: true, name: true } },
        order: { select: { orderId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Create CSV
    const headers = [
      'ID',
      'Email Type',
      'Recipient',
      'Subject',
      'Status',
      'Sent At',
      'Failed At',
      'Error Message',
      'Retry Count',
      'Order ID',
      'Created At',
    ];

    const rows = emailLogs.map((log) => [
      log.id,
      log.emailType,
      log.recipientEmail,
      log.subject,
      log.status,
      log.sentAt ? new Date(log.sentAt).toISOString() : '',
      log.failedAt ? new Date(log.failedAt).toISOString() : '',
      log.errorMessage || '',
      log.retryCount,
      log.order?.orderId || '',
      new Date(log.createdAt).toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=email-logs-${Date.now()}.csv`);
    res.send(csv);
  } catch (error: any) {
    console.error('Export email logs error:', error);
    res.status(500).json({ error: 'Failed to export email logs' });
  }
};

// ============================================
// GET USER COMMUNICATION HISTORY (USER)
// ============================================

export const getUserCommunicationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { page = '1', limit = '10' } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [emailLogs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where: { userId },
        select: {
          id: true,
          subject: true,
          emailType: true,
          status: true,
          sentAt: true,
          failedAt: true,
          createdAt: true,
          order: {
            select: {
              orderId: true,
              templateName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.emailLog.count({ where: { userId } }),
    ]);

    res.json({
      communications: emailLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get user communication history error:', error);
    res.status(500).json({ error: 'Failed to fetch communication history' });
  }
};
