import { Request, Response } from 'express';
import prisma from '../lib/db';
import { Template } from '../types';

// ============================================
// GET ALL TEMPLATES
// ============================================

export const getAllTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const templates = await prisma.template.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(templates);
  } catch (error: any) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// ============================================
// GET TEMPLATE BY SLUG OR ID
// ============================================

export const getTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slugOrId } = req.params;

    const template = await prisma.template.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
        deletedAt: null,
      },
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json(template);
  } catch (error: any) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

// ============================================
// GET TEMPLATES BY CATEGORY
// ============================================

export const getTemplatesByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    const templates = await prisma.template.findMany({
      where: {
        category,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(templates);
  } catch (error: any) {
    console.error('Get templates by category error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// ============================================
// CREATE TEMPLATE (ADMIN)
// ============================================

export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const templateData = req.body;

    const template = await prisma.template.create({
      data: {
        ...templateData,
        sections: templateData.sections || [],
        fields: templateData.fields || [],
      } as any,
    });

    res.status(201).json(template);
  } catch (error: any) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

// ============================================
// UPDATE TEMPLATE (ADMIN)
// ============================================

export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const templateData = req.body;

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...templateData,
        updatedAt: new Date(),
      },
    });

    res.json(template);
  } catch (error: any) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

// ============================================
// DELETE TEMPLATE (ADMIN)
// ============================================

export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.template.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

// ============================================
// GET FEATURED TEMPLATES
// ============================================

export const getFeaturedTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;

    const templates = await prisma.template.findMany({
      where: {
        isFeatured: true,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json(templates);
  } catch (error: any) {
    console.error('Get featured templates error:', error);
    res.status(500).json({ error: 'Failed to fetch featured templates' });
  }
};

// ============================================
// GET TRENDING TEMPLATES
// ============================================

export const getTrendingTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;

    const templates = await prisma.template.findMany({
      where: {
        isTrending: true,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json(templates);
  } catch (error: any) {
    console.error('Get trending templates error:', error);
    res.status(500).json({ error: 'Failed to fetch trending templates' });
  }
};

// ============================================
// SEARCH TEMPLATES
// ============================================

export const searchTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const templates = await prisma.template.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          },
          { status: 'PUBLISHED' },
          { deletedAt: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json(templates);
  } catch (error: any) {
    console.error('Search templates error:', error);
    res.status(500).json({ error: 'Failed to search templates' });
  }
};
