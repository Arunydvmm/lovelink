import { Request, Response } from 'express';
import prisma from '../lib/db';
import { refundPayment } from '../lib/razorpay';
import { sendPaymentReceiptEmail } from '../lib/email';

// ============================================
// GET DASHBOARD STATS
// ============================================

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalOrders, totalRevenue, paidOrders, failedOrders, activeTemplates] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.order.count(),
        prisma.payment.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true },
        }),
        prisma.order.count({ where: { paymentStatus: 'PAID' } }),
        prisma.order.count({ where: { paymentStatus: 'FAILED' } }),
        prisma.template.count({ where: { status: 'PUBLISHED' } }),
      ]);

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.amount || 0,
      paidOrders,
      failedOrders,
      activeTemplates,
      conversionRate: totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(2) : 0,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// ============================================
// GET ALL USERS
// ============================================

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);

    res.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ============================================
// GET USER DETAILS
// ============================================

export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const [orders, stories, totalSpent] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.story.count({ where: { userId } }),
      prisma.payment.aggregate({
        where: { userId, status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      ...user,
      stats: {
        totalOrders: orders,
        totalStories: stories,
        totalSpent: totalSpent._sum.amount || 0,
      },
    });
  } catch (error: any) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

// ============================================
// UPDATE USER ROLE
// ============================================

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'UPDATE_USER_ROLE',
        entity: 'USER',
        entityId: userId,
        changes: { role },
        status: 'SUCCESS',
      },
    });

    res.json(user);
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// ============================================
// DISABLE USER
// ============================================

export const disableUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'DISABLE_USER',
        entity: 'USER',
        entityId: userId,
        status: 'SUCCESS',
      },
    });

    res.json(user);
  } catch (error: any) {
    console.error('Disable user error:', error);
    res.status(500).json({ error: 'Failed to disable user' });
  }
};

// ============================================
// GET AUDIT LOGS
// ============================================

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);

    res.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// ============================================
// GET SYSTEM LOGS
// ============================================

export const getSystemLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const level = (req.query.level as string) || undefined;

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where: level ? { level: level as any } : {},
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.systemLog.count(),
    ]);

    res.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('Get system logs error:', error);
    res.status(500).json({ error: 'Failed to fetch system logs' });
  }
};

// ============================================
// GET ORDER STATS
// ============================================

export const getOrderStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, paymentStatus: true, totalAmount: true },
    });

    // Group by date
    const grouped: Record<string, any> = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { date, total: 0, count: 0, paid: 0 };
      }
      grouped[date].count++;
      grouped[date].total += order.totalAmount;
      if (order.paymentStatus === 'PAID') grouped[date].paid++;
    });

    res.json(Object.values(grouped));
  } catch (error: any) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Failed to fetch order stats' });
  }
};

// ============================================
// GET REVENUE STATS
// ============================================

export const getRevenueStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: 'PAID' },
      select: { amount: true, createdAt: true },
    });

    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todayRevenue = payments
      .filter((p) => p.createdAt.toISOString().startsWith(today))
      .reduce((acc, p) => acc + p.amount, 0);

    const monthRevenue = payments
      .filter((p) => p.createdAt.toISOString().startsWith(thisMonth))
      .reduce((acc, p) => acc + p.amount, 0);

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    res.json({
      today: todayRevenue,
      thisMonth: monthRevenue,
      total: totalRevenue,
      average: payments.length > 0 ? totalRevenue / payments.length : 0,
    });
  } catch (error: any) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue stats' });
  }
};

// ============================================
// CREATE INVOICE
// ============================================

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        invoiceNumber,
        amount: order.amount,
        tax: order.tax,
        total: order.totalAmount,
        status: 'PENDING',
      },
    });

    res.json(invoice);
  } catch (error: any) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// ============================================
// SEND INVOICE EMAIL
// ============================================

export const sendInvoiceEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { order: { include: { user: true } } },
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    // Send email (implement as needed)
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { sentAt: new Date(), status: 'SENT' },
    });

    res.json({ message: 'Invoice email sent' });
  } catch (error: any) {
    console.error('Send invoice email error:', error);
    res.status(500).json({ error: 'Failed to send invoice' });
  }
};

// ============================================
// PROCESS REFUND (ADMIN)
// ============================================

export const processRefundAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.paymentStatus !== 'PAID') {
      res.status(400).json({ error: 'Only paid orders can be refunded' });
      return;
    }

    if (!order.razorpayPaymentId) {
      res.status(400).json({ error: 'No payment to refund' });
      return;
    }

    try {
      const refund = await refundPayment(order.razorpayPaymentId, order.totalAmount, {
        reason: reason || 'Admin initiated refund',
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'REFUNDED' },
      });

      // Log audit event
      await prisma.auditLog.create({
        data: {
          userId: req.userId!,
          action: 'PROCESS_REFUND',
          entity: 'ORDER',
          entityId: orderId,
          status: 'SUCCESS',
        },
      });

      res.json({ message: 'Refund processed successfully', refund });
    } catch (refundError) {
      res.status(400).json({ error: 'Failed to process refund with payment gateway' });
    }
  } catch (error: any) {
    console.error('Process refund error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
};
