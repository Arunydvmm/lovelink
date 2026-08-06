import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  profileImage?: string;
  role: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

// ============================================
// GOOGLE OAUTH
// ============================================

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export const verifyGoogleToken = async (idToken: string): Promise<GoogleUserInfo> => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid Google token');
    }

    if (!payload.email_verified) {
      throw new Error('Email not verified by Google');
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
      verified_email: payload.email_verified,
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Failed to verify Google token');
  }
};

// ============================================
// JWT TOKENS (for API authentication)
// ============================================

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: 'lovelink',
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
    issuer: 'lovelink',
  });
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'lovelink',
    }) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'lovelink',
    }) as JWTPayload;
  } catch (error) {
    return null;
  }
};

// ============================================
// SESSION MANAGEMENT (without Redis)
// ============================================

export const generateSessionToken = (): string => {
  return randomBytes(64).toString('hex');
};

export const hashSessionToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ============================================
// PASSWORD GENERATION (for admin accounts if needed)
// ============================================

export const generateRandomPassword = (length: number = 12): string => {
  return randomBytes(length).toString('hex');
};

// ============================================
// COOKIE HELPERS
// ============================================

export const getSessionCookieOptions = (): any => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
};

export const getAuthCookieOptions = (): any => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  };
};

export const clearCookieOptions = (): any => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    expires: new Date(0),
    path: '/',
  };
};
