import express from 'express';
import { googleLogin, logout, refreshToken, getCurrentUser, validateSession } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { googleAuthLimiter } from '../middleware/rateLimitMiddleware';

const router = express.Router();

// ============================================
// GOOGLE OAUTH ROUTES
// ============================================

// Google authentication
router.post('/google', googleAuthLimiter, googleLogin);

// Logout
router.post('/logout', authMiddleware, logout);

// Refresh token
router.post('/refresh-token', refreshToken);

// Get current user
router.get('/me', authMiddleware, getCurrentUser);

// Validate session
router.get('/validate', validateSession);

export default router;
