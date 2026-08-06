import express from 'express';
import {
  getEmailLogs,
  getEmailLogById,
  retryEmail,
  getEmailStats,
  exportEmailLogs,
  getUserCommunicationHistory,
} from '../controllers/emailLogController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';
import { adminLimiter } from '../middleware/rateLimitMiddleware';

const router = express.Router();

// ============================================
// USER ROUTES
// ============================================

// Get user's communication history
router.get('/my-communications', authMiddleware, getUserCommunicationHistory);

// ============================================
// ADMIN ROUTES
// ============================================

// Get all email logs (admin only)
router.get('/', authMiddleware, requireAdmin, adminLimiter, getEmailLogs);

// Get email statistics (admin only)
router.get('/stats', authMiddleware, requireAdmin, getEmailStats);

// Export email logs to CSV (admin only)
router.get('/export', authMiddleware, requireAdmin, exportEmailLogs);

// Get email log by ID (admin only)
router.get('/:id', authMiddleware, requireAdmin, getEmailLogById);

// Retry failed email (admin only)
router.post('/:id/retry', authMiddleware, requireAdmin, retryEmail);

export default router;
