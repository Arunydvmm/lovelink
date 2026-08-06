import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

// ============================================
// VALIDATION ERROR HANDLER
// ============================================

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.type === 'field' ? (err as any).path : err.type,
        message: err.msg,
      })),
    });
    return;
  }

  next();
};

// ============================================
// AUTH VALIDATIONS
// ============================================

export const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,)
    .withMessage(
      'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    ),
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Display name must be at most 100 characters'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

export const validateResetPassword = [
  body('token')
    .notEmpty()
    .isHexadecimal()
    .withMessage('Valid token is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    ),
  handleValidationErrors,
];

// ============================================
// PAYMENT VALIDATIONS
// ============================================

export const validateCreateOrder = [
  body('templateId')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('Template ID is required'),
  body('couponCode')
    .optional()
    .isString()
    .trim()
    .toUpperCase(),
  handleValidationErrors,
];

export const validateVerifyPayment = [
  body('orderId')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('Order ID is required'),
  body('razorpayOrderId')
    .notEmpty()
    .isString()
    .withMessage('Razorpay Order ID is required'),
  body('razorpayPaymentId')
    .notEmpty()
    .isString()
    .withMessage('Razorpay Payment ID is required'),
  body('razorpaySignature')
    .notEmpty()
    .isString()
    .isHexadecimal()
    .withMessage('Razorpay Signature is required'),
  body('storyData')
    .optional()
    .isObject()
    .withMessage('Story data must be an object'),
  handleValidationErrors,
];

// ============================================
// COUPON VALIDATIONS
// ============================================

export const validateCoupon = [
  body('code')
    .notEmpty()
    .isString()
    .trim()
    .toUpperCase()
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be 3-20 characters'),
  body('discountType')
    .isIn(['PERCENTAGE', 'FIXED'])
    .withMessage('Discount type must be PERCENTAGE or FIXED'),
  body('discountValue')
    .isInt({ min: 1 })
    .withMessage('Discount value must be at least 1'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format'),
  body('maxUses')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max uses must be at least 1'),
  body('minPurchaseAmount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Min purchase amount must be at least 0'),
  handleValidationErrors,
];

// ============================================
// TEMPLATE VALIDATIONS
// ============================================

export const validateTemplateCreate = [
  body('name')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Template name must be 3-100 characters'),
  body('slug')
    .notEmpty()
    .isString()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('category')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('Category is required'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters'),
  body('price')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Price must be at least 0'),
  body('coverImage')
    .notEmpty()
    .isURL()
    .withMessage('Valid cover image URL is required'),
  body('theme')
    .notEmpty()
    .isObject()
    .withMessage('Theme must be an object'),
  handleValidationErrors,
];

// ============================================
// STORY VALIDATIONS
// ============================================

export const validateStoryCreate = [
  body('templateId')
    .notEmpty()
    .isString()
    .withMessage('Template ID is required'),
  body('senderName')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Sender name is required and must be 1-100 characters'),
  body('recipientName')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Recipient name is required and must be 1-100 characters'),
  body('storyData')
    .notEmpty()
    .isObject()
    .withMessage('Story data is required'),
  handleValidationErrors,
];

// ============================================
// UTILITY VALIDATIONS
// ============================================

export const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  handleValidationErrors,
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('Page must be at least 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  handleValidationErrors,
];

export const validateSlug = [
  param('slug')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid slug format'),
  handleValidationErrors,
];
