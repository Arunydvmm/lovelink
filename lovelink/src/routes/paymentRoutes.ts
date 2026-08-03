import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  processRefund,
} from '../controllers/paymentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkoutLimiter } from '../middleware/rateLimitMiddleware';

const router = Router();

// Public webhook route (no auth required)
router.post('/webhook', handleWebhook);

// Protected routes
router.post('/create-order', authMiddleware, checkoutLimiter, createPaymentOrder);
router.post('/verify', authMiddleware, verifyPayment);
router.post('/refund', authMiddleware, processRefund);

export default router;
