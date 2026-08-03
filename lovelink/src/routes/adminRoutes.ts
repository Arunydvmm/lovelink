import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  disableUser,
  getAuditLogs,
  getSystemLogs,
  getOrderStats,
  getRevenueStats,
  createInvoice,
  sendInvoiceEmail,
  processRefundAdmin,
} from '../controllers/adminController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/orders/stats', getOrderStats);
router.get('/revenue/stats', getRevenueStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.patch('/users/:userId/role', updateUserRole);
router.patch('/users/:userId/disable', disableUser);

// Audit & Logging
router.get('/audit-logs', getAuditLogs);
router.get('/system-logs', getSystemLogs);

// Invoice Management
router.post('/orders/:orderId/invoice', createInvoice);
router.post('/invoices/:invoiceId/send', sendInvoiceEmail);

// Refunds
router.post('/orders/refund', processRefundAdmin);

export default router;
