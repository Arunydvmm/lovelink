export type CategoryId = 
  | 'girlfriend_day'
  | 'boyfriend_day'
  | 'proposal'
  | 'anniversary'
  | 'birthday'
  | 'valentine'
  | 'friendship'
  | 'festival'
  | 'romance';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  iconName: string;
}

// Generic Component Types supported by the dynamic Renderer Engine
export type ComponentType =
  | 'heading'
  | 'text'
  | 'gallery'
  | 'image'
  | 'video'
  | 'audio'
  | 'button'
  | 'timeline'
  | 'countdown'
  | 'certificate'
  | 'gift_box'
  | 'scratch_card'
  | 'quiz'
  | 'flip_card'
  | 'interactive_question'
  | 'confetti'
  | 'particles'
  | 'music';

export interface GenericComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
}

export interface DynamicSection {
  id: string;
  title?: string;
  subtitle?: string;
  backgroundStyle?: 'solid' | 'gradient' | 'glass' | 'stars' | 'hearts' | 'dark_romantic' | 'sunset';
  customBgColor?: string;
  padding?: 'small' | 'medium' | 'large';
  components: GenericComponent[];
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'color'
  | 'music_select'
  | 'gallery_upload'
  | 'image_upload'
  | 'video_upload'
  | 'dropdown'
  | 'checkbox'
  | 'timeline_items'
  | 'quiz_items';

export interface EditableField {
  id: string;
  key: string; // matches field replacement path or storyData key
  label: string;
  type: FieldType;
  stepName: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
}

export interface TemplateTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string; // e.g. 'Playfair Display', 'Plus Jakarta Sans', 'Dancing Script', 'Cinzel'
  particleType?: 'hearts' | 'stars' | 'sparkles' | 'snow' | 'petals' | 'none';
  heartFloating?: boolean;
}

export interface TemplateMusic {
  url: string;
  title: string;
  artist?: string;
  autoplay?: boolean;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: CategoryId;
  coverImage: string;
  previewImages: string[];
  previewVideo?: string;
  price: number; // 0 for free
  salePrice?: number;
  description: string;
  estimatedTime: string; // e.g. "3 mins"
  theme: TemplateTheme;
  music?: TemplateMusic;
  sections: DynamicSection[];
  fields: EditableField[];
  defaultContent: Record<string, any>;
  isFeatured?: boolean;
  isTrending?: boolean;
  isPremium?: boolean;
  status: 'published' | 'draft' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface Story {
  id: string;
  slug: string;
  templateId: string;
  templateSnapshot: Template; // Full snapshot of template schema at time of creation
  userEmail: string;
  senderName: string;
  recipientName: string;
  storyData: Record<string, any>;
  customMusicUrl?: string;
  customMusicTitle?: string;
  isPaid: boolean;
  isPublished: boolean;
  views: number;
  uniqueVisits: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGatewayConfig {
  upiEnabled: boolean;
  upiId: string;
  upiName: string;
  upiQrCodeUrl?: string;
  razorpayEnabled: boolean;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  instructions?: string;
  currencySymbol: string; // "₹"
  currencyCode: string; // "INR"
}

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
  enabled: boolean;
}

export interface Order {
  id: string;
  storyId: string;
  templateId: string;
  templateName: string;
  userEmail: string;
  amount: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'upi' | 'card' | 'wallet' | 'netbanking' | 'razorpay';
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'failed';
  transactionId: string;
  utrNumber?: string;
  couponCode?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g., 20 for 20% or 100 for $100/₹100
  expiryDate?: string;
  maxUses?: number;
  usedCount: number;
  minPurchaseAmount?: number;
  isActive: boolean;
}

export interface LegalPage {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  text: string;
  linkText?: string;
  linkUrl?: string;
  badge?: string;
  isActive: boolean;
  bgColor?: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalUsers: number;
  totalStories: number;
  activeCoupons: number;
  totalViews: number;
}
