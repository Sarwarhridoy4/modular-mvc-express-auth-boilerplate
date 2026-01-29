import type { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Higher-order function to wrap asynchronous Express route handlers.
 *
 * This utility function catches any errors that occur within an asynchronous
 * route handler and passes them to the `next` middleware function. This
 * eliminates the need for repetitive `try-catch` blocks in every async route.
 *
 * @param {AsyncHandler} fn - An asynchronous Express route handler function.
 * @returns {(req: Request, res: Response, next: NextFunction) => void} An Express middleware function that handles asynchronous operations and errors.
 *
 * @example
 * // In your controller:
 * import { Request, Response, NextFunction } from 'express';
 * import { catchAsync } from '../../utils/catchAsync.js';
 * import { SomeService } from '../services/some.service.js';
 *
 * const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
 *   const user = await SomeService.create(req.body);
 *   res.status(201).json({ success: true, data: user });
 * });
 *
 * // In your router:
 * // router.post('/users', createUser);
 */
export const catchAsync =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      next(err);
    });
  };