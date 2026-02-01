// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import AppError from '../../helpers/errorHelper/AppError.js';

/**
 * Global error handling middleware for Express applications.
 *
 * This middleware catches various types of errors that occur during request
 * processing and sends a standardized JSON error response to the client.
 * It handles Zod validation errors, Prisma database errors, JWT authentication
 * errors, custom `AppError` instances, and generic JavaScript `Error` objects.
 * For unhandled error types, it provides a fallback "Internal Server Error" response.
 *
 * @param {unknown} err - The error object caught by Express.
 * @param {Request} _req - The Express request object (unused).
 * @param {Response} res - The Express response object.
 * @param {NextFunction} _next - The Express next middleware function (unused, as this is a terminal error handler).
 *
 * @example
 * // To use in your Express application, typically after all routes:
 * import express from 'express';
 * import { globalErrorHandler } from './app/middleware/globalErrorHandler.js';
 * // ... other imports and route definitions
 *
 * const app = express();
 * // ... other middleware and routes
 * app.use(globalErrorHandler);
 *
 * // Example of an error being caught by the handler:
 * // A Zod validation error from `zodValidator` middleware
 * // A custom AppError thrown in a service layer
 * // A database error from Prisma
 */
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
      message: err.message || "Internal Server Error"
    });
  }

  // Fallback for unknown errors
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal Server Error"
  });
};
