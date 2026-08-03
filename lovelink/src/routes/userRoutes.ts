import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getPurchaseHistory,
  getPaymentHistory,
  getInvoices,
  getUserAnalytics,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// Profile
router.get('/profile', getUserProfile);
router.patch('/profile', updateUserProfile);

// Purchase & Payment History
router.get('/purchases', getPurchaseHistory);
router.get('/payments', getPaymentHistory);
router.get('/invoices', getInvoices);

// Analytics
router.get('/analytics', getUserAnalytics);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:notificationId/read', markNotificationAsRead);
router.post('/notifications/read-all', markAllNotificationsAsRead);

export default router;
