import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { getClientIp } from '../../utils/getClientIp';

export const apiLogger = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  let responseBody: any;

  res.send = function (body) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  const log = {
    method: req.method,
    url: req.originalUrl,
    ip: getClientIp(req),
    requestBody: JSON.stringify(req.body),
    userId: req.user?.id,
  };

  res.on('finish', async () => {
    try {
      await prisma.apiLog.create({
        data: {
          ...log,
          statusCode: res.statusCode,
          responseBody: responseBody ? responseBody.toString() : null,
        },
      });
    } catch (error) {
      console.error('Error logging API call:', error);
    }
  });

  res.on('error', async (err) => {
    try {
      await prisma.apiLog.create({
        data: {
          ...log,
          statusCode: res.statusCode || 500,
          responseBody: responseBody ? responseBody.toString() : null,
          error: err.stack,
        },
      });
    } catch (error) {
      console.error('Error logging API call error:', error);
    }
  });

  next();
};
