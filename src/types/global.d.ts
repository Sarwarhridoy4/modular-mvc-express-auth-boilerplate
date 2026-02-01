// src/types/global.d.ts
import { AuthJwtPayload } from '../app/modules/auth/auth.interface.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
        sessionId?: string;
      };
    }
  }
}