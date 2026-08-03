import { Request, Response } from 'express';
import prisma from '../lib/db';
import {
  verifyGoogleToken,
  generateAccessToken,
  generateRefreshToken,
  generateSessionToken,
  hashSessionToken,
  getSessionCookieOptions,
  getAuthCookieOptions,
  clearCookieOptions,
  GoogleUserInfo,
  JWTPayload,
} from '../lib/auth';

// ============================================
// GOOGLE AUTHENTICATION
// ============================================

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'Google ID token is required' });
      return;
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(idToken);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.id },
    });

    if (!user) {
      // Check if email already exists (for migration scenarios)
      const existingUser = await prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (existingUser) {
        // Update existing user with Google ID
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: googleUser.id,
            name: googleUser.name,
            profileImage: googleUser.picture,
            lastLoginAt: new Date(),
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            profileImage: googleUser.picture,
            googleId: googleUser.id,
            lastLoginAt: new Date(),
          },
        });
      }
    } else {
      // Update last login
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Generate JWT tokens
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      profileImage: user.profileImage || undefined,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Create session
    const sessionToken = generateSessionToken();
    const hashedToken = hashSessionToken(sessionToken);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: hashedToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Set cookies
    res.cookie('session_token', sessionToken, getSessionCookieOptions());
    res.cookie('access_token', accessToken, getAuthCookieOptions());
    res.cookie('refresh_token', refreshToken, getAuthCookieOptions());

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        role: user.role,
      },
      accessToken,
      refreshToken,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
};

// ============================================
// LOGOUT
// ============================================

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionToken = req.cookies.session_token;

    if (sessionToken) {
      const hashedToken = hashSessionToken(sessionToken);
      await prisma.session.updateMany({
        where: { token: hashedToken },
        data: { revokedAt: new Date() },
      });
    }

    // Clear cookies
    res.clearCookie('session_token', clearCookieOptions());
    res.clearCookie('access_token', clearCookieOptions());
    res.clearCookie('refresh_token', clearCookieOptions());

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
};

// ============================================
// REFRESH TOKEN
// ============================================

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    const { verifyRefreshToken, generateAccessToken: generateNewAccessToken } = await import('../lib/auth');
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Generate new access token
    const newAccessToken = generateNewAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      profileImage: user.profileImage || undefined,
      role: user.role,
    });

    // Set new access token cookie
    res.cookie('access_token', newAccessToken, getAuthCookieOptions());

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Failed to refresh token' });
  }
};

// ============================================
// GET CURRENT USER
// ============================================

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// ============================================
// VALIDATE SESSION
// ============================================

export const validateSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
      res.status(401).json({ valid: false, message: 'No session token' });
      return;
    }

    const { hashSessionToken } = await import('../lib/auth');
    const hashedToken = hashSessionToken(sessionToken);

    const session = await prisma.session.findFirst({
      where: {
        token: hashedToken,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImage: true,
            role: true,
          },
        },
      },
    });

    if (!session) {
      res.status(401).json({ valid: false, message: 'Invalid or expired session' });
      return;
    }

    res.json({
      valid: true,
      user: session.user,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Validate session error:', error);
    res.status(500).json({ valid: false, message: 'Failed to validate session' });
  }
};
