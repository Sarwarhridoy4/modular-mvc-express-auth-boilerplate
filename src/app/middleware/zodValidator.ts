import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

/**
 * Middleware to validate request body, query, or parameters against a Zod schema.
 *
 * This middleware uses a provided Zod schema to parse and validate
 * incoming request data. It supports validation of `req.body`, `req.query`,
 * or `req.params`. If validation fails, it forwards the ZodError to the
 * next middleware (e.g., a global error handler).
 *
 * @param {ZodObject<any>} zodSchema - The Zod schema to use for validation.
 * @param {'body' | 'query' | 'params'} [type='body'] - The part of the request to validate ('body', 'query', or 'params'). Defaults to 'body'.
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>} An Express middleware function.
 *
 * @example
 * // Example: Validating a request body
 * import { z } from 'zod';
 *
 * const userSchema = z.object({
 *   name: z.string().min(3),
 *   email: z.string().email(),
 * });
 *
 * // In your route definition:
 * router.post('/users', zodValidator(userSchema, 'body'), userController.createUser);
 *
 * @example
 * // Example: Validating query parameters
 * import { z } from 'zod';
 *
 * const paginationSchema = z.object({
 *   page: z.string().transform(Number).optional().default('1'),
 *   limit: z.string().transform(Number).optional().default('10'),
 * });
 *
 * // In your route definition:
 * router.get('/products', zodValidator(paginationSchema, 'query'), productController.getProducts);
 *
 * @example
 * // Example: Validating path parameters
 * import { z } from 'zod';
 *
 * const idSchema = z.object({
 *   id: z.string().uuid(),
 * });
 *
 * // In your route definition:
 * router.get('/users/:id', zodValidator(idSchema, 'params'), userController.getUserById);
 */
export const zodValidator =
  (zodSchema: ZodObject<any>, type: 'body' | 'query' | 'params' = 'body') =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Determine which part of the request to validate
      let dataToValidate: any;
      if (type === 'body') {
        dataToValidate = req.body;
      } else if (type === 'query') {
        dataToValidate = req.query;
      } else if (type === 'params') {
        dataToValidate = req.params;
      } else {
        throw new Error(`Invalid validation type: ${type}`);
      }

      req[type] = await zodSchema.parseAsync(dataToValidate); // Reassign validated data back to req
      next();
    } catch (error) {
      next(error);
    }
  };
