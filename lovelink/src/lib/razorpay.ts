import crypto from 'crypto';
import axios from 'axios';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description: string;
  order_id: string | null;
  receipt: string | null;
  email: string;
  contact: string;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_reason: string | null;
  error_step: string | null;
  notes: Record<string, any>;
  created_at: number;
}

// ============================================
// RAZORPAY API CLIENT
// ============================================

const razorpayClient = axios.create({
  baseURL: RAZORPAY_API_URL,
  auth: {
    username: RAZORPAY_KEY_ID,
    password: RAZORPAY_KEY_SECRET,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// CREATE ORDER
// ============================================

export const createRazorpayOrder = async (
  amount: number, // in paise
  receipt: string,
  notes: Record<string, any> = {}
): Promise<RazorpayOrder> => {
  try {
    const response = await razorpayClient.post('/orders', {
      amount,
      currency: 'INR',
      receipt,
      notes,
    });

    return response.data;
  } catch (error: any) {
    console.error('Razorpay order creation error:', error.response?.data || error.message);
    throw new Error('Failed to create Razorpay order');
  }
};

// ============================================
// FETCH PAYMENT
// ============================================

export const fetchRazorpayPayment = async (paymentId: string): Promise<RazorpayPayment> => {
  try {
    const response = await razorpayClient.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error: any) {
    console.error('Razorpay payment fetch error:', error.response?.data || error.message);
    throw new Error('Failed to fetch payment details');
  }
};

// ============================================
// VERIFY PAYMENT SIGNATURE
// ============================================

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const message = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(message)
    .digest('hex');

  return generatedSignature === signature;
};

// ============================================
// VERIFY WEBHOOK SIGNATURE
// ============================================

export const verifyWebhookSignature = (
  payload: string,
  signature: string
): boolean => {
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return generatedSignature === signature;
};

// ============================================
// REFUND PAYMENT
// ============================================

export const refundPayment = async (
  paymentId: string,
  amount?: number,
  notes?: Record<string, any>
): Promise<any> => {
  try {
    const data: any = { notes };
    if (amount) {
      data.amount = amount;
    }

    const response = await razorpayClient.post(`/payments/${paymentId}/refund`, data);
    return response.data;
  } catch (error: any) {
    console.error('Razorpay refund error:', error.response?.data || error.message);
    throw new Error('Failed to refund payment');
  }
};

// ============================================
// CAPTURE PAYMENT
// ============================================

export const capturePayment = async (
  paymentId: string,
  amount: number
): Promise<RazorpayPayment> => {
  try {
    const response = await razorpayClient.post(`/payments/${paymentId}/capture`, {
      amount,
    });
    return response.data;
  } catch (error: any) {
    console.error('Razorpay capture error:', error.response?.data || error.message);
    throw new Error('Failed to capture payment');
  }
};

// ============================================
// PAYMENT LINK CREATION (Alternative for UPI, Card, etc.)
// ============================================

export const createPaymentLink = async (
  amount: number,
  customerId: string,
  description: string,
  notes: Record<string, any> = {}
): Promise<any> => {
  try {
    const response = await razorpayClient.post('/payment_links', {
      amount,
      currency: 'INR',
      customer_notify: 1,
      description,
      notes,
    });

    return response.data;
  } catch (error: any) {
    console.error('Razorpay payment link error:', error.response?.data || error.message);
    throw new Error('Failed to create payment link');
  }
};

// ============================================
// VALIDATE CONFIGURATION
// ============================================

export const validateRazorpayConfig = (): boolean => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || !RAZORPAY_WEBHOOK_SECRET) {
    console.warn('⚠️ Razorpay configuration is incomplete. Payments will not work.');
    return false;
  }
  return true;
};
