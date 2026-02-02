// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name?: string;
        email: string;
        role?: string;
        [key: string]: unknown;
      };
    }
  }
}