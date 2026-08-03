import { Request, Response } from 'express';
import prisma from '../lib/db';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchRazorpayPayment,
  refundPayment,
} from '../lib/razorpay';
import { sendPaymentReceiptEmail } from '../lib/email';

// ============================================
// CREATE PAYMENT ORDER
// ============================================

export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId, couponCode } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!templateId) {
      res.status(400).json({ error: 'Template ID is required' });
      return;
    }

    // Get template
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let discount = 0;

    // Validate coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (!coupon || !coupon.isActive) {
        res.status(400).json({ error: 'Invalid coupon' });
        return;
      }

      if (coupon.expiryDate && new Date() > coupon.expiryDate) {
        res.status(400).json({ error: 'Coupon expired' });
        return;
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        res.status(400).json({ error: 'Coupon usage limit reached' });
        return;
      }

      if (coupon.minPurchaseAmount && template.price < coupon.minPurchaseAmount) {
        res.status(400).json({
          error: `Minimum purchase of ₹${coupon.minPurchaseAmount / 100} required`,
        });
        return;
      }

      if (coupon.discountType === 'PERCENTAGE') {
        discount = Math.floor((template.price * coupon.discountValue) / 100);
      } else {
        discount = coupon.discountValue;
      }

      discount = Math.min(discount, template.price);
    }

    const amount = Math.max(0, template.price - discount);
    const tax = Math.floor((amount * 18) / 100); // 18% GST
    const totalAmount = amount + tax;

    // Create Razorpay order
    const receipt = `order_${userId}_${Date.now()}`;

    const razorpayOrder = await createRazorpayOrder(totalAmount, receipt, {
      userId,
      templateId,
      couponCode: couponCode || undefined,
      userEmail: user.email,
    });

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderId: `ORD_${Date.now()}`,
        templateId,
        userId,
        userEmail: user.email,
        amount,
        discount,
        tax,
        totalAmount,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING',
        razorpayOrderId: razorpayOrder.id,
        couponCode: couponCode || undefined,
        notes: {
          templateName: template.name,
          userDisplayName: user.displayName,
        },
      },
    });

    res.json({
      order: {
        id: order.id,
        orderId: order.orderId,
        amount: order.amount,
        discount: order.discount,
        tax: order.tax,
        totalAmount: order.totalAmount,
        razorpayOrderId: razorpayOrder.id,
      },
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Create payment order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

// ============================================
// VERIFY PAYMENT
// ============================================

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, storyData } =
      req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({ error: 'Missing required payment details' });
      return;
    }

    // Verify signature
    const isValidSignature = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValidSignature) {
      res.status(400).json({ error: 'Invalid payment signature' });
      return;
    }

    // Fetch payment details from Razorpay
    const payment = await fetchRazorpayPayment(razorpayPaymentId);

    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      res.status(400).json({ error: 'Payment not successful' });
      return;
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { template: true, coupon: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Verify amount matches
    if (payment.amount !== order.totalAmount) {
      res.status(400).json({ error: 'Payment amount mismatch' });
      return;
    }

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        razorpayPaymentId,
        razorpaySignature,
        transactionId: razorpayPaymentId,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        amount: order.totalAmount,
        status: 'PAID',
        method: 'RAZORPAY',
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        transactionId: razorpayPaymentId,
      },
    });

    // Create story
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const story = await prisma.story.create({
      data: {
        slug: `love-${Math.random().toString(36).substr(2, 8)}`,
        templateId: order.templateId,
        userId,
        userEmail: user.email,
        senderName: storyData?.senderName || 'Anonymous',
        recipientName: storyData?.recipientName || 'Beloved',
        storyData: storyData || {},
        templateSnapshot: order.template as any,
        isPaid: true,
        isPublished: true,
        orderId: order.id,
      },
    });

    // Update order with story
    await prisma.order.update({
      where: { id: orderId },
      data: { storyId: story.id },
    });

    // Increment coupon usage if applicable
    if (order.couponCode) {
      await prisma.coupon.update({
        where: { code: order.couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Create payment success notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful!',
        message: `Your surprise has been published and is ready to share!`,
        actionUrl: `/story/${story.slug}`,
      },
    });

    // Send purchase confirmation email (NEVER fail payment on email error)
    try {
      const { emailService } = await import('../lib/email/EmailService');
      
      const templates = emailService.getTemplates();
      
      // Send purchase confirmation with story link
      await emailService.sendAsync(
        {
          to: user.email,
          subject: `🎉 Your ${order.template.name} is Ready!`,
          html: templates.purchaseConfirmation({
            customerName: user.name || user.email.split('@')[0],
            orderId: order.orderId,
            templateName: order.template.name,
            amount: order.totalAmount,
            orderDate: order.createdAt,
            storyLink: `${process.env.VITE_APP_URL}/story/${story.slug}`,
          }),
        },
        {
          userId: user.id,
          orderId: order.id,
          storyId: story.id,
          templateId: order.templateId,
          recipientEmail: user.email,
          subject: `Your ${order.template.name} is Ready!`,
          emailType: 'PURCHASE_CONFIRMATION',
        }
      );

      // Send payment receipt
      await emailService.sendAsync(
        {
          to: user.email,
          subject: `Payment Receipt - Order #${order.orderId}`,
          html: templates.paymentReceipt({
            customerName: user.name || user.email.split('@')[0],
            orderId: order.orderId,
            templateName: order.template.name,
            amount: order.totalAmount,
            transactionId: razorpayPaymentId,
            paymentDate: new Date(),
          }),
        },
        {
          userId: user.id,
          orderId: order.id,
          recipientEmail: user.email,
          subject: `Payment Receipt - Order #${order.orderId}`,
          emailType: 'PAYMENT_RECEIPT',
        }
      );
    } catch (emailError) {
      // Log email error but don't fail the payment
      console.error('Email send error (payment still successful):', emailError);
      await prisma.systemLog.create({
        data: {
          level: 'ERROR',
          category: 'EMAIL',
          message: 'Failed to send purchase confirmation email',
          metadata: {
            orderId: order.id,
            userId: user.id,
            error: String(emailError),
          },
        },
      });
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PAYMENT_SUCCESS',
        entity: 'ORDER',
        entityId: order.id,
        status: 'SUCCESS',
        ipAddress: req.ip,
      },
    });

    res.json({
      message: 'Payment verified successfully',
      story: {
        id: story.id,
        slug: story.slug,
      },
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

// ============================================
// WEBHOOK HANDLER (RAZORPAY)
// ============================================

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(payload, signature);

    if (!isValidSignature) {
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    const event = req.body.event;
    const data = req.body.payload;

    console.log(`📨 Razorpay webhook: ${event}`);

    switch (event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(data.payment);
        break;

      case 'payment.failed':
        await handlePaymentFailed(data.payment);
        break;

      case 'payment.captured':
        await handlePaymentCaptured(data.payment);
        break;

      case 'refund.created':
        await handleRefundCreated(data.refund);
        break;

      default:
        console.log(`⚠️ Unhandled webhook event: ${event}`);
    }

    res.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// ============================================
// WEBHOOK HANDLERS
// ============================================

const handlePaymentAuthorized = async (payment: any) => {
  console.log('✅ Payment authorized:', payment.id);
};

const handlePaymentFailed = async (payment: any) => {
  try {
    const order = await prisma.order.findUnique({
      where: { razorpayPaymentId: payment.id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      });

      const user = await prisma.user.findUnique({
        where: { id: order.userId },
      });

      if (user) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'PAYMENT_FAILED',
            title: 'Payment Failed',
            message: `Your payment could not be processed. Please try again.`,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error handling payment failed webhook:', error);
  }
};

const handlePaymentCaptured = async (payment: any) => {
  try {
    const order = await prisma.order.findUnique({
      where: { razorpayPaymentId: payment.id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'PAID' },
      });
    }
  } catch (error) {
    console.error('Error handling payment captured webhook:', error);
  }
};

const handleRefundCreated = async (refund: any) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { razorpayPaymentId: refund.payment_id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      });

      const order = await prisma.order.findUnique({
        where: { id: payment.orderId },
      });

      if (order) {
        const user = await prisma.user.findUnique({
          where: { id: order.userId },
        });

        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'REFUND_PROCESSED',
              title: 'Refund Processed',
              message: `A refund of ₹${(refund.amount / 100).toFixed(2)} has been processed.`,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error handling refund webhook:', error);
  }
};

// ============================================
// PROCESS REFUND
// ============================================

export const processRefund = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!orderId) {
      res.status(400).json({ error: 'Order ID is required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
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

    // Process refund
    const refund = await refundPayment(order.razorpayPaymentId, order.totalAmount, {
      orderId: order.id,
      reason: 'Customer requested',
    });

    // Create refund notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'REFUND_PROCESSED',
        title: 'Refund Initiated',
        message: `Refund of ₹${(order.totalAmount / 100).toFixed(2)} has been initiated.`,
      },
    });

    res.json({
      message: 'Refund initiated successfully',
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
      },
    });
  } catch (error: any) {
    console.error('Process refund error:', error);
    res.status(500).json({ error: 'Refund processing failed' });
  }
};
