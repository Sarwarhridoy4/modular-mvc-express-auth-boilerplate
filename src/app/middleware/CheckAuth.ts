import { NextFunction, Request, Response } from "express";

import { env } from '../../config/env.js';
import { prisma } from '../../config/db.js';
import { StatusCodes } from "http-status-codes";
import AppError from '../../helpers/errorHelper/AppError.js';
import { verifyToken } from '../../utils/jwt.js';
import { AuthJwtPayload } from '../modules/auth/auth.interface.js'; // Import AuthJwtPayload

/**
 * Middleware to check user authentication and authorization based on roles.
 *
 * This middleware verifies the presence and validity of an access token
 * from cookies. If the token is valid, it decodes the user information
 * (email, role, sessionId) and retrieves the user from the database.
 * It then checks if the user's role matches any of the allowed roles
 * specified in `authRoles`. If authentication or authorization fails,
 * it throws an `AppError` with an appropriate status code and message.
 * On success, it attaches user details (id, email, role, name, sessionId)
 * to `req.user` for subsequent middleware/handlers.
 *
 * @param {...string} authRoles - A variable number of strings representing allowed user roles (e.g., 'ADMIN', 'USER').
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>} An Express middleware function.
 *
 * @example
 * // Example: Protecting a route for administrators only
 * import { checkAuth } from '../../middleware/CheckAuth.js';
 * import { UserRole } from '@prisma/client';
 *
 * // In your route definition:
 * router.get('/admin/dashboard', checkAuth(UserRole.ADMIN), adminController.getDashboard);
 *
 * @example
 * // Example: Protecting a route for both users and administrators
 * import { checkAuth } from '../../middleware/CheckAuth.js';
 * import { UserRole } from '@prisma/client';
 *
 * // In your route definition:
 * router.get('/profile', checkAuth(UserRole.USER, UserRole.ADMIN), userController.getUserProfile);
 *
 * @example
 * // Example: How req.user is populated after successful authentication
 * // Assuming a route like: router.get('/my-data', checkAuth(UserRole.USER), (req, res) => { ... });
 * // Inside the handler:
 * const userId = req.user.id;
 * const userEmail = req.user.email;
 * const userRole = req.user.role;
 * console.log(`Authenticated user: ${userEmail} with role ${userRole}`);
 */
export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies?.accessToken;

      if (!accessToken) {
        throw new AppError(403, "No token received");
      }

      const verifiedToken = verifyToken(
        accessToken,
        env.JWT_SECRET_KEY
      ) as AuthJwtPayload; // Use AuthJwtPayload
      if (!verifiedToken) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid token");
      }

      // ✅ Prisma query
      const user = await prisma.user.findUnique({
        where: { email: verifiedToken.email },
      });

      if (!user) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User does not exist");
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route");
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        sessionId: verifiedToken.sessionId, // Attach sessionId
      };

      next();
    } catch (error) {
      console.log("JWT error", error);
      next(error);
    }
  };
