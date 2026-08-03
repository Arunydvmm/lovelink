import { Request, Response } from 'express';
import prisma from '../lib/db';
import { store } from '../lib/store';

// ============================================
// GET STORY BY ID OR SLUG
// ============================================

export const getStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    const story = await prisma.story.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        deletedAt: null,
      },
      include: {
        user: {
          select: { displayName: true, email: true },
        },
      },
    });

    if (!story) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }

    if (!story.isPublished) {
      res.status(403).json({ error: 'This story is not published' });
      return;
    }

    res.json(story);
  } catch (error: any) {
    console.error('Get story error:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
};

// ============================================
// GET USER STORIES
// ============================================

export const getUserStories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const stories = await prisma.story.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        template: {
          select: { name: true, slug: true },
        },
        order: {
          select: { paymentStatus: true, totalAmount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(stories);
  } catch (error: any) {
    console.error('Get user stories error:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
};

// ============================================
// CREATE STORY
// ============================================

export const createStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { templateId, senderName, recipientName, storyData } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Get template
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const story = await prisma.story.create({
      data: {
        slug: `love-${Math.random().toString(36).substr(2, 8)}`,
        templateId,
        userId,
        userEmail: user.email,
        senderName,
        recipientName,
        storyData,
        templateSnapshot: template as any,
        isPaid: false,
        isPublished: false,
      },
    });

    res.status(201).json(story);
  } catch (error: any) {
    console.error('Create story error:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
};

// ============================================
// UPDATE STORY
// ============================================

export const updateStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { senderName, recipientName, storyData, customMusicUrl, customMusicTitle } =
      req.body;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check ownership
    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story || story.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const updated = await prisma.story.update({
      where: { id },
      data: {
        senderName: senderName || story.senderName,
        recipientName: recipientName || story.recipientName,
        storyData: storyData || story.storyData,
        customMusicUrl: customMusicUrl || story.customMusicUrl,
        customMusicTitle: customMusicTitle || story.customMusicTitle,
        updatedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Update story error:', error);
    res.status(500).json({ error: 'Failed to update story' });
  }
};

// ============================================
// DELETE STORY
// ============================================

export const deleteStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check ownership
    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story || story.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    await prisma.story.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete story error:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
};

// ============================================
// INCREMENT STORY VIEWS
// ============================================

export const incrementStoryViews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const story = await prisma.story.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json({ views: story.views });
  } catch (error: any) {
    console.error('Increment views error:', error);
    res.json({ views: 1 });
  }
};

// ============================================
// SAVE DRAFT
// ============================================

export const saveDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { templateId, storyData, step } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const draft = await prisma.draftStory.upsert({
      where: { templateId_userId: { templateId, userId } },
      update: { storyData, step, updatedAt: new Date() },
      create: { templateId, userId, storyData, step },
    });

    res.json(draft);
  } catch (error: any) {
    console.error('Save draft error:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
};

// ============================================
// GET DRAFT
// ============================================

export const getDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { templateId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const draft = await prisma.draftStory.findUnique({
      where: { templateId_userId: { templateId, userId } },
    });

    res.json(draft || null);
  } catch (error: any) {
    console.error('Get draft error:', error);
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
};

// ============================================
// DELETE DRAFT
// ============================================

export const deleteDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { templateId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    await prisma.draftStory.delete({
      where: { templateId_userId: { templateId, userId } },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete draft error:', error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
};
