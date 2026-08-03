import { Router } from 'express';
import {
  getAllTemplates,
  getTemplate,
  getTemplatesByCategory,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getFeaturedTemplates,
  getTrendingTemplates,
  searchTemplates,
} from '../controllers/templateController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';
import { generalLimiter } from '../middleware/rateLimitMiddleware';

const router = Router();

// Public routes
router.get('/', generalLimiter, getAllTemplates);
router.get('/featured', generalLimiter, getFeaturedTemplates);
router.get('/trending', generalLimiter, getTrendingTemplates);
router.get('/search', generalLimiter, searchTemplates);
router.get('/category/:category', generalLimiter, getTemplatesByCategory);
router.get('/:slugOrId', generalLimiter, getTemplate);

// Admin routes
router.post('/', authMiddleware, requireAdmin, createTemplate);
router.patch('/:id', authMiddleware, requireAdmin, updateTemplate);
router.delete('/:id', authMiddleware, requireAdmin, deleteTemplate);

export default router;
