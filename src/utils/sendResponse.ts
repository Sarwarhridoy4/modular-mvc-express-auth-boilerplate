import type { Response } from "express";

interface TMeta {
  page: number;
  limit: number;
  totalPage: number;
  total: number;
}

interface TResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: TMeta;
}

/**
 * Sends a standardized JSON response to the client.
 *
 * This utility function ensures all API responses follow a consistent
 * structure, including status code, success status, a message, and the actual
 * data. It can also include optional metadata for paginated responses.
 *
 * @template T The type of the data being sent in the response.
 * @param {Response} res - The Express response object.
 * @param {TResponse<T>} data - An object containing the response details.
 * @param {number} data.statusCode - The HTTP status code for the response.
 * @param {boolean} data.success - Indicates if the operation was successful.
 * @param {string} data.message - A descriptive message for the response.
 * @param {T} data.data - The actual data payload of the response.
 * @param {TMeta} [data.meta] - Optional metadata, typically used for pagination (e.g., page, limit, total).
 *
 * @example
 * // Example: Sending a successful creation response
 * import { sendResponse } from './sendResponse.js';
 * import { Response } from 'express';
 *
 * // Assuming `res` is an Express Response object and `newUser` is the created resource
 * const newUser = { id: '123', name: 'John Doe' };
 * sendResponse(res, {
 *   statusCode: 201,
 *   success: true,
 *   message: 'User created successfully',
 *   data: newUser,
 * });
 *
 * @example
 * // Example: Sending a successful list response with pagination metadata
 * import { sendResponse } from './sendResponse.js';
 * import { Response } from 'express';
 *
 * // Assuming `res` is an Express Response object and `products` is an array of products
 * const products = [{ id: 'p1', name: 'Laptop' }, { id: 'p2', name: 'Mouse' }];
 * sendResponse(res, {
 *   statusCode: 200,
 *   success: true,
 *   message: 'Products fetched successfully',
 *   data: products,
 *   meta: {
 *     page: 1,
 *     limit: 10,
 *     totalPage: 5,
 *     total: 45,
 *   },
 * });
 */
export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    statusCode: data.statusCode,
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data,
  });
};
