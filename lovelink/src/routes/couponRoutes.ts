import { Router } from 'express';
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public route
router.post('/validate', validateCoupon);

// Admin routes
router.get('/', authMiddleware, requireAdmin, getAllCoupons);
router.post('/', authMiddleware, requireAdmin, createCoupon);
router.patch('/:code', authMiddleware, requireAdmin, updateCoupon);
router.delete('/:code', authMiddleware, requireAdmin, deleteCoupon);

export default router;
