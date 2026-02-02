// src/types/global.d.ts
import { AuthJwtPayload } from '../app/modules/auth/auth.interface.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthJwtPayload;
    }
  }
}