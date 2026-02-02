// src/types/global.d.ts
import { AuthJwtPayload } from '../app/modules/auth/auth.interface.js';
import { GetErrorLogsInput } from '../app/modules/api-log/api-log.validation.js';
import { Request } from 'express'; // Import Request to extend it

declare global {
  namespace Express {
    interface Request {
      user?: AuthJwtPayload;
      // Merge properties from GetErrorLogsInput['query'] into the existing Query type
      query: Request['query'] & GetErrorLogsInput['query'];
    }
  }
}