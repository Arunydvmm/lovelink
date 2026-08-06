import prisma from './db';
import { Template, Story, Order, Coupon, LegalPage, Announcement, AnalyticsSummary, PaymentGatewayConfig, CloudinaryConfig } from '../types';

// ============================================
// PAYMENT & CLOUDINARY CONFIG
// ============================================

const DEFAULT_PAYMENT_CONFIG: PaymentGatewayConfig = {
  upiEnabled: true,
  upiId: process.env.UPI_ID || 'lovelink@upi',
  upiName: process.env.UPI_NAME || 'LoveLink Digital Surprises',
  upiQrCodeUrl: process.env.UPI_QR_CODE_URL,
  razorpayEnabled: true,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: '', // Never expose in frontend
  instructions: 'Complete payment to publish your surprise and get instant sharing link.',
  currencySymbol: '₹',
  currencyCode: 'INR',
};

const DEFAULT_CLOUDINARY_CONFIG: CloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'lovelink-cloud',
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset',
  enabled: !!process.env.CLOUDINARY_CLOUD_NAME,
};

class LoveLinkStore {
  // ============================================
  // TEMPLATES
  // ============================================

  public async getTemplates(): Promise<Template[]> {
    try {
      const templates = await prisma.template.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      return templates as any[];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw new Error('Failed to fetch templates');
    }
  }

  public async getTemplateBySlug(slug: string): Promise<Template | undefined> {
    try {
      const template = await prisma.template.findFirst({
        where: {
          OR: [{ slug }, { id: slug }],
          deletedAt: null,
        },
      });

      return template as any;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw new Error('Failed to fetch template');
    }
  }

  public async getTemplateById(id: string): Promise<Template | undefined> {
    try {
      const template = await prisma.template.findUnique({
        where: { id },
      });

      return template as any;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw new Error('Failed to fetch template');
    }
  }

  public async saveTemplate(template: Template): Promise<Template> {
    try {
      const existingTemplate = await prisma.template.findUnique({
        where: { id: template.id },
      });

      let result;

      if (existingTemplate) {
        result = await prisma.template.update({
          where: { id: template.id },
          data: {
            ...template,
            updatedAt: new Date(),
          },
        });
      } else {
        result = await prisma.template.create({
          data: {
            ...template,
            sections: template.sections || [],
            fields: template.fields || [],
          } as any,
        });
      }

      return result as any;
    } catch (error) {
      console.error('Error saving template:', error);
      throw new Error('Failed to save template');
    }
  }

  public async deleteTemplate(id: string): Promise<boolean> {
    try {
      await prisma.template.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new Error('Failed to delete template');
    }
  }

  // ============================================
  // STORIES
  // ============================================

  public async getStories(): Promise<Story[]> {
    try {
      const stories = await prisma.story.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      return stories as any[];
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw new Error('Failed to fetch stories');
    }
  }

  public async getStoryById(idOrSlug: string): Promise<Story | undefined> {
    try {
      const story = await prisma.story.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
          deletedAt: null,
        },
      });

      return story as any;
    } catch (error) {
      console.error('Error fetching story:', error);
      throw new Error('Failed to fetch story');
    }
  }

  public async getUserStories(userId: string): Promise<Story[]> {
    try {
      const stories = await prisma.story.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      return stories as any[];
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw new Error('Failed to fetch user stories');
    }
  }

  public async saveStory(story: Story): Promise<Story> {
    try {
      const existingStory = await prisma.story.findUnique({
        where: { id: story.id },
      });

      let result;

      if (existingStory) {
        result = await prisma.story.update({
          where: { id: story.id },
          data: {
            ...story,
            updatedAt: new Date(),
          },
        });
      } else {
        result = await prisma.story.create({
          data: story as any,
        });
      }

      return result as any;
    } catch (error) {
      console.error('Error saving story:', error);
      throw new Error('Failed to save story');
    }
  }

  public async incrementStoryViews(id: string): Promise<number> {
    try {
      const story = await prisma.story.update({
        where: { id },
        data: { views: { increment: 1 } },
      });

      return story.views;
    } catch (error) {
      console.error('Error incrementing story views:', error);
      return 1;
    }
  }

  public async deleteStory(id: string): Promise<boolean> {
    try {
      await prisma.story.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return true;
    } catch (error) {
      console.error('Error deleting story:', error);
      throw new Error('Failed to delete story');
    }
  }

  // ============================================
  // DRAFT STORIES
  // ============================================

  public async getDraftStory(templateId: string, userId: string): Promise<any> {
    try {
      const draft = await prisma.draftStory.findUnique({
        where: { templateId_userId: { templateId, userId } },
      });

      return draft;
    } catch (error) {
      console.error('Error fetching draft story:', error);
      return null;
    }
  }

  public async saveDraftStory(
    templateId: string,
    userId: string,
    storyData: Record<string, any>,
    step: number = 1
  ): Promise<any> {
    try {
      const draft = await prisma.draftStory.upsert({
        where: { templateId_userId: { templateId, userId } },
        update: { storyData, step, updatedAt: new Date() },
        create: { templateId, userId, storyData, step },
      });

      return draft;
    } catch (error) {
      console.error('Error saving draft story:', error);
      throw new Error('Failed to save draft');
    }
  }

  public async deleteDraftStory(templateId: string, userId: string): Promise<boolean> {
    try {
      await prisma.draftStory.delete({
        where: { templateId_userId: { templateId, userId } },
      });

      return true;
    } catch (error) {
      console.error('Error deleting draft story:', error);
      return false;
    }
  }

  // ============================================
  // COUPONS
  // ============================================

  public async getCoupons(): Promise<Coupon[]> {
    try {
      const coupons = await prisma.coupon.findMany({
        where: { isActive: true },
      });

      return coupons as any[];
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw new Error('Failed to fetch coupons');
    }
  }

  public async validateCoupon(
    code: string,
    amount: number
  ): Promise<{ valid: boolean; discountAmount: number; coupon?: Coupon; error?: string }> {
    try {
      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        return { valid: false, discountAmount: 0, error: 'Invalid coupon code' };
      }

      if (coupon.expiryDate && new Date() > coupon.expiryDate) {
        return { valid: false, discountAmount: 0, error: 'Coupon has expired' };
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return {
          valid: false,
          discountAmount: 0,
          error: 'Coupon usage limit reached',
        };
      }

      if (coupon.minPurchaseAmount && amount < coupon.minPurchaseAmount) {
        return {
          valid: false,
          discountAmount: 0,
          error: `Minimum order of ₹${coupon.minPurchaseAmount / 100} required`,
        };
      }

      let discount = 0;

      if (coupon.discountType === 'PERCENTAGE') {
        discount = Math.floor((amount * coupon.discountValue) / 100);
      } else {
        discount = coupon.discountValue;
      }

      discount = Math.min(discount, amount);

      return { valid: true, discountAmount: discount, coupon };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { valid: false, discountAmount: 0, error: 'Validation failed' };
    }
  }

  public async saveCoupon(coupon: Coupon): Promise<Coupon> {
    try {
      const result = await prisma.coupon.upsert({
        where: { code: coupon.code },
        update: coupon as any,
        create: coupon as any,
      });

      return result as any;
    } catch (error) {
      console.error('Error saving coupon:', error);
      throw new Error('Failed to save coupon');
    }
  }

  public async deleteCoupon(code: string): Promise<boolean> {
    try {
      await prisma.coupon.delete({
        where: { code },
      });

      return true;
    } catch (error) {
      console.error('Error deleting coupon:', error);
      return false;
    }
  }

  // ============================================
  // ORDERS
  // ============================================

  public async createOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      const result = await prisma.order.create({
        data: {
          orderId: orderData.orderId || `ORD_${Date.now()}`,
          templateId: orderData.templateId || '',
          templateName: orderData.templateName || '',
          userId: orderData.userId || '',
          userEmail: orderData.userEmail || '',
          amount: orderData.amount || 0,
          discount: orderData.discount || 0,
          tax: orderData.tax || 0,
          totalAmount: orderData.totalAmount || 0,
          paymentMethod: (orderData.paymentMethod || 'RAZORPAY') as any,
          paymentStatus: 'PAID',
          transactionId: `TXN_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          couponCode: orderData.couponCode,
          notes: orderData.notes,
        } as any,
      });

      return result as any;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  public async getOrders(): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return orders as any[];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  public async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return orders as any[];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch user orders');
    }
  }

  // ============================================
  // LEGAL PAGES
  // ============================================

  public async getLegalPage(slug: string): Promise<LegalPage | undefined> {
    try {
      const page = await prisma.legalPage.findUnique({
        where: { slug },
      });

      return page as any;
    } catch (error) {
      console.error('Error fetching legal page:', error);
      return undefined;
    }
  }

  public async saveLegalPage(page: LegalPage): Promise<LegalPage> {
    try {
      const result = await prisma.legalPage.upsert({
        where: { slug: page.slug },
        update: { ...page, updatedAt: new Date() },
        create: page as any,
      });

      return result as any;
    } catch (error) {
      console.error('Error saving legal page:', error);
      throw new Error('Failed to save legal page');
    }
  }

  // ============================================
  // ANNOUNCEMENTS
  // ============================================

  public async getAnnouncements(): Promise<Announcement[]> {
    try {
      const announcements = await prisma.announcement.findMany({
        where: {
          isActive: true,
          OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }],
          expiresAt: { gt: new Date() },
        },
        orderBy: { priority: 'desc' },
      });

      return announcements as any[];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw new Error('Failed to fetch announcements');
    }
  }

  public async saveAnnouncement(ann: Announcement): Promise<Announcement> {
    try {
      const result = await prisma.announcement.upsert({
        where: { id: ann.id },
        update: { ...ann, updatedAt: new Date() },
        create: ann as any,
      });

      return result as any;
    } catch (error) {
      console.error('Error saving announcement:', error);
      throw new Error('Failed to save announcement');
    }
  }

  // ============================================
  // ANALYTICS
  // ============================================

  public async getAnalytics(): Promise<AnalyticsSummary> {
    try {
      const orders = await prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
      });

      const stories = await prisma.story.findMany({
        where: { isPublished: true },
      });

      const users = await prisma.user.findMany({
        where: { emailVerified: { not: null } },
      });

      const coupons = await prisma.coupon.findMany({
        where: { isActive: true },
      });

      const totalRev = orders.reduce((acc, o) => acc + o.totalAmount, 0);
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayRev = orders
        .filter((o) => o.createdAt.toISOString().startsWith(todayStr))
        .reduce((acc, o) => acc + o.totalAmount, 0);

      const totalViews = stories.reduce((acc, s) => acc + s.views, 0);

      return {
        totalRevenue: totalRev,
        todayRevenue: todayRev,
        monthlyRevenue: totalRev * 0.75,
        totalUsers: users.length,
        totalStories: stories.length,
        activeCoupons: coupons.length,
        totalViews,
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        totalRevenue: 0,
        todayRevenue: 0,
        monthlyRevenue: 0,
        totalUsers: 0,
        totalStories: 0,
        activeCoupons: 0,
        totalViews: 0,
      };
    }
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  public getPaymentConfig(): PaymentGatewayConfig {
    return DEFAULT_PAYMENT_CONFIG;
  }

  public savePaymentConfig(config: PaymentGatewayConfig): PaymentGatewayConfig {
    return config;
  }

  public getCloudinaryConfig(): CloudinaryConfig {
    return DEFAULT_CLOUDINARY_CONFIG;
  }

  public saveCloudinaryConfig(config: CloudinaryConfig): CloudinaryConfig {
    return config;
  }
}

export const store = new LoveLinkStore();
