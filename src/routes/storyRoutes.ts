import { Router } from 'express';
import {
  getStory,
  getUserStories,
  createStory,
  updateStory,
  deleteStory,
  incrementStoryViews,
  saveDraft,
  getDraft,
  deleteDraft,
} from '../controllers/storyController';
import { authMiddleware, optionalAuth } from '../middleware/authMiddleware';
import { generalLimiter } from '../middleware/rateLimitMiddleware';

const router = Router();

// Public routes
router.get('/:idOrSlug', generalLimiter, optionalAuth, getStory);
router.post('/:id/increment-views', generalLimiter, incrementStoryViews);

// Protected routes
router.get('/', authMiddleware, getUserStories);
router.post('/', authMiddleware, createStory);
router.patch('/:id', authMiddleware, updateStory);
router.delete('/:id', authMiddleware, deleteStory);

// Draft routes
router.post('/:templateId/draft', authMiddleware, saveDraft);
router.get('/:templateId/draft', authMiddleware, getDraft);
router.delete('/:templateId/draft', authMiddleware, deleteDraft);

export default router;
