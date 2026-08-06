import { Router } from 'express';
import {
  sendWelcomeNotification,
  sendOfferNotification,
  sendAnnouncement,
  getNotificationStats,
} from '../controllers/notificationController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Admin routes
router.post('/welcome/:userId', authMiddleware, requireAdmin, sendWelcomeNotification);
router.post('/offer', authMiddleware, requireAdmin, sendOfferNotification);
router.post('/announcement', authMiddleware, requireAdmin, sendAnnouncement);
router.get('/stats', authMiddleware, requireAdmin, getNotificationStats);

export default router;
