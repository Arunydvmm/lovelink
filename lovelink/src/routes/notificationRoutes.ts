import { Router } from 'express';
import {
  sendWelcomeNotification,
  resendVerificationEmail,
  sendOfferNotification,
  sendAnnouncement,
  getNotificationStats,
} from '../controllers/notificationController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// User routes
router.post('/resend-verification', authMiddleware, resendVerificationEmail);

// Admin routes
router.post('/welcome/:userId', authMiddleware, requireAdmin, sendWelcomeNotification);
router.post('/offer', authMiddleware, requireAdmin, sendOfferNotification);
router.post('/announcement', authMiddleware, requireAdmin, sendAnnouncement);
router.get('/stats', authMiddleware, requireAdmin, getNotificationStats);

export default router;
