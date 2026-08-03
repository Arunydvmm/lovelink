import { Request, Response } from 'express';
import prisma from '../lib/db';
import { requireAdmin } from '../middleware/authMiddleware';

// ============================================
// VALIDATE COUPON
// ============================================

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      res.status(400).json({ valid: false, error: 'Coupon code is required' });
      return;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      res.status(400).json({ valid: false, error: 'Invalid or inactive coupon code' });
      return;
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      res.status(400).json({ valid: false, error: 'Coupon has expired' });
      return;
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      res.status(400).json({ valid: false, error: 'Coupon usage limit reached' });
      return;
    }

    if (coupon.minPurchaseAmount && amount < coupon.minPurchaseAmount) {
      res.status(400).json({
        valid: false,
        error: `Minimum purchase of ₹${coupon.minPurchaseAmount / 100} required`,
      });
      return;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.floor((amount * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, amount);

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount,
    });
  } catch (error: any) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ valid: false, error: 'Failed to validate coupon' });
  }
};

// ============================================
// GET ALL COUPONS (ADMIN)
// ============================================

export const getAllCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(coupons);
  } catch (error: any) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

// ============================================
// CREATE COUPON (ADMIN)
// ============================================

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      code,
      discountType,
      discountValue,
      expiryDate,
      maxUses,
      minPurchaseAmount,
      applicableTemplates,
    } = req.body;

    if (!code || !discountType || !discountValue) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType: discountType.toUpperCase(),
        discountValue,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        maxUses,
        minPurchaseAmount,
        applicableTemplates: applicableTemplates || ['ALL'],
        isActive: true,
      },
    });

    res.json(coupon);
  } catch (error: any) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
};

// ============================================
// UPDATE COUPON (ADMIN)
// ============================================

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const { discountValue, expiryDate, maxUses, isActive } = req.body;

    const coupon = await prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: {
        ...(discountValue !== undefined && { discountValue }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(maxUses !== undefined && { maxUses }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(coupon);
  } catch (error: any) {
    console.error('Update coupon error:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
};

// ============================================
// DELETE COUPON (ADMIN)
// ============================================

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;

    await prisma.coupon.delete({
      where: { code: code.toUpperCase() },
    });

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error: any) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};
