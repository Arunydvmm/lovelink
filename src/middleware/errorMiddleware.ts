import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/db';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

export const errorHandler = async (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.error('❌ Error:', err);

  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof SyntaxError) {
    statusCode = 400;
    message = 'Invalid request format';
  }

  // Log error to database
  try {
    await prisma.systemLog.create({
      data: {
        level: statusCode >= 500 ? 'ERROR' : 'WARN',
        category: 'API_ERROR',
        message: err.message,
        metadata: {
          path: req.path,
          method: req.method,
          statusCode,
          userId: req.userId || null,
          ip: req.ip,
        },
        stackTrace: err.stack,
      },
    });

    // Log to audit if user is authenticated
    if (req.userId && statusCode >= 400) {
      await prisma.auditLog.create({
        data: {
          userId: req.userId,
          action: 'ERROR',
          entity: 'API',
          entityId: req.path,
          status: 'ERROR',
          errorMessage: err.message,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      });
    }
  } catch (dbError) {
    console.error('Failed to log error to database:', dbError);
  }

  // Send response
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    requestId: res.getHeader('X-Request-ID'),
  });
};

// ============================================
// NOT FOUND HANDLER
// ============================================

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(404, `Route ${req.path} not found`);
  next(error);
};

// ============================================
// ASYNC ERROR WRAPPER
// ============================================

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================
// VALIDATION ERROR HANDLER
// ============================================

export const validationErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.array) {
    // Express-validator error
    const errors = err.array();
    res.status(400).json({
      error: 'Validation failed',
      details: errors.map((e: any) => ({
        field: e.param,
        message: e.msg,
      })),
    });
    return;
  }

  next(err);
};

// ============================================
// PRISMA ERROR HANDLER
// ============================================

export const prismaErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const target = err.meta?.target?.[0] || 'field';
    const error = new AppError(409, `${target} already exists`);
    return next(error);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    const error = new AppError(404, 'Record not found');
    return next(error);
  }

  next(err);
};

// ============================================
// CUSTOM ERROR RESPONSES
// ============================================

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  details?: any
): void => {
  res.status(statusCode).json({
    error: message,
    ...(details && { details }),
  });
};

export const sendSuccess = (
  res: Response,
  data: any,
  statusCode: number = 200,
  message?: string
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// ============================================
// THROW OPERATIONS WRAPPED ERRORS
// ============================================

export const throwNotFound = (resource: string): never => {
  throw new AppError(404, `${resource} not found`);
};

export const throwUnauthorized = (message: string = 'Unauthorized'): never => {
  throw new AppError(401, message);
};

export const throwForbidden = (message: string = 'Forbidden'): never => {
  throw new AppError(403, message);
};

export const throwBadRequest = (message: string = 'Bad request'): never => {
  throw new AppError(400, message);
};

export const throwConflict = (message: string = 'Conflict'): never => {
  throw new AppError(409, message);
};
