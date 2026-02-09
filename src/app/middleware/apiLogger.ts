import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { getClientIp } from '../../utils/getClientIp.js';

const SENSITIVE_KEYS = new Set([
  'password',
  'confirmPassword',
  'otp',
  'otpCode',
  'passwordResetToken',
  'accessToken',
  'refreshToken',
  'token',
]);

const shouldSkipLogging = (url: string) =>
  url.startsWith('/api/v1/auth') || url.startsWith('/api/v1/login');

const redact = (value: unknown): unknown => {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce((acc, [key, val]) => {
      if (SENSITIVE_KEYS.has(key)) {
        acc[key] = '[REDACTED]';
      } else {
        acc[key] = redact(val);
      }
      return acc;
    }, {} as Record<string, unknown>);
  }

  return value;
};

export const apiLogger = async (req: Request, res: Response, next: NextFunction) => {
  if (shouldSkipLogging(req.originalUrl)) {
    return next();
  }

  const originalSend = res.send;
  let responseBody: unknown;

  res.send = function (body) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    try {
      const log = {
        method: req.method,
        url: req.originalUrl,
        ip: getClientIp(req),
        requestBody: JSON.stringify(redact(req.body)),
        userId: req.user?.id,
      };
      await prisma.apiLog.create({
        data: {
          ...log,
          statusCode: res.statusCode,
          responseBody: responseBody
            ? (typeof responseBody === 'object'
              ? JSON.stringify(redact(responseBody))
              : String(responseBody))
            : null,
        },
      });
    } catch (error) {
      console.error('Error logging API call:', error);
    }
  });

  res.on('error', async (err) => {
    try {
      const log = {
        method: req.method,
        url: req.originalUrl,
        ip: getClientIp(req),
        requestBody: JSON.stringify(redact(req.body)),
        userId: req.user?.id,
      };
      await prisma.apiLog.create({
        data: {
          ...log,
          statusCode: res.statusCode || 500,
          responseBody: responseBody
            ? (typeof responseBody === 'object'
              ? JSON.stringify(redact(responseBody))
              : String(responseBody))
            : null,
          error: err.stack,
        },
      });
    } catch (error) {
      console.error('Error logging API call error:', error);
    }
  });

  next();
};
