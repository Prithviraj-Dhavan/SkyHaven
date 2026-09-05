import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error occurred';
  let code = err.code || 'INTERNAL_ERROR';
  let details = err.details || null;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request parameters';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    message = 'A resource with this unique field already exists';
    details = err.meta;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = 'Resource not found in database';
  }

  if (statusCode >= 500) {
    console.error('💥 Unhandled Server Exception:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      details,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
