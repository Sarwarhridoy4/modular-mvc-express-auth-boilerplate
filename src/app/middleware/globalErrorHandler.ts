// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import AppError from '../../helpers/errorHelper/AppError.js';

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("🔥 Global Error:", err);

  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.issues.map((issue) => issue.message);
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation Error",
      errors: messages,
    });
  }

  // Handle Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = "Database error";
    if (err.code === "P2002") {
      message = "Duplicate value found for a unique field";
    } else if (err.code === "P2025") {
      message = "Requested record not found";
    }
    return res.status(400).json({ 
      success: false, 
      statusCode: 400,
      message 
    });
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ 
      success: false, 
      statusCode: 400,
      message: "Database validation error" 
    });
  }

  // Handle JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ 
      success: false, 
      statusCode: 401,
      message: "Invalid token" 
    });
  }
  if (err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({ 
      success: false, 
      statusCode: 401,
      message: "Token has expired" 
    });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ 
        success: false, 
        statusCode: err.statusCode,
        message: err.message 
      });
  }

  // Handle generic Error objects
  if (err instanceof Error) {
    return res.status(500).json({ 
      success: false, 
      statusCode: 500,
      message: err.message 
    });
  }

  // Fallback for unknown errors
  return res.status(500).json({ 
    success: false, 
    statusCode: 500,
    message: "Internal Server Error" 
  });
};
