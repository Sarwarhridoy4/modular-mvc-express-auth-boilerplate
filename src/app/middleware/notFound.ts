import {type Request,type Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Middleware to handle requests for routes that do not exist.
 *
 * This middleware should be placed at the very end of your middleware stack,
 * after all other routes and middleware, to catch any requests that have not
 * been handled by previous routes. It sends a 404 Not Found JSON response.
 *
 * @param {Request} _req - The Express request object (unused).
 * @param {Response} res - The Express response object.
 *
 * @example
 * // To use in your Express application:
 * import express from 'express';
 * import notFound from './app/middleware/notFound.js';
 * // ... other imports and route definitions
 *
 * const app = express();
 * // ... other middleware and routes
 *
 * // This middleware should be the last one added
 * app.use(notFound);
 */
const notFound = (_req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Route Not Found",
  });
};

export default notFound;
