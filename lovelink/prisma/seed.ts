import { PrismaClient } from '@prisma/client';
import { INITIAL_CATEGORIES, INITIAL_TEMPLATES, INITIAL_COUPONS, INITIAL_LEGAL_PAGES, INITIAL_ANNOUNCEMENTS } from '../src/data/initialDb';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Seed templates
  console.log('📝 Seeding templates...');
  for (const template of INITIAL_TEMPLATES) {
    await prisma.template.upsert({
      where: { slug: template.slug },
      update: {},
      create: {
        id: template.id,
        name: template.name,
        slug: template.slug,
        category: template.category,
        description: template.description,
        coverImage: template.coverImage,
        previewImages: template.previewImages,
        previewVideo: template.previewVideo,
        price: template.price || 0,
        salePrice: template.salePrice,
        estimatedTime: template.estimatedTime,
        isFeatured: template.isFeatured ?? false,
        isTrending: template.isTrending ?? false,
        isPremium: template.isPremium ?? false,
        status: 'PUBLISHED',
        version: template.version || 1,
        theme: template.theme,
        music: template.music || null,
        sections: template.sections || [],
        fields: template.fields || [],
        defaultContent: template.defaultContent || {},
        seo: template.seo || null,
      },
    });
  }
  console.log('✅ Templates seeded');

  // Seed coupons
  console.log('🎟️  Seeding coupons...');
  for (const coupon of INITIAL_COUPONS) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate) : null,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount || 0,
        minPurchaseAmount: coupon.minPurchaseAmount,
        isActive: coupon.isActive ?? true,
        applicableTemplates: coupon.applicableTemplates || ['ALL'],
      },
    });
  }
  console.log('✅ Coupons seeded');

  // Seed legal pages
  console.log('📄 Seeding legal pages...');
  for (const page of INITIAL_LEGAL_PAGES) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        htmlContent: page.content,
        version: 1,
        isPublished: true,
      },
    });
  }
  console.log('✅ Legal pages seeded');

  // Seed announcements
  console.log('📢 Seeding announcements...');
  for (const ann of INITIAL_ANNOUNCEMENTS) {
    await prisma.announcement.upsert({
      where: { id: ann.id },
      update: {},
      create: {
        id: ann.id,
        text: ann.text,
        linkText: ann.linkText,
        linkUrl: ann.linkUrl,
        badge: ann.badge,
        bgColor: ann.bgColor,
        isActive: ann.isActive ?? true,
        priority: 0,
      },
    });
  }
  console.log('✅ Announcements seeded');

  console.log('✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
