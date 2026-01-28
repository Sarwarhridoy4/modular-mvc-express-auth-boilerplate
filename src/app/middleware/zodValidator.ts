import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const zodValidator =
  (zodSchema: ZodObject<any>) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Check if body exists
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new Error("Request body is empty. Make sure Content-Type is application/json");
      }
      
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };

  
