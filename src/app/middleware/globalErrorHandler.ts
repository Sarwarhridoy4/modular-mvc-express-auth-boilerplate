// middlewares/errorHandler.ts
import {type Request,type Response,type NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import AppError from "../../helpers/errorHelper/AppError";




export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Global Error:", err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.issues.map((issue) => issue.message);
    return res.status(400).json({
      success: false,
      message: messages.length === 1 ? messages[0] : messages,
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
    return res.status(400).json({ success: false, message });
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Handle JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({ success: false, message: "Token has expired" });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message });
  }

  // Fallback for unknown errors
  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({ success: false, message });
};
