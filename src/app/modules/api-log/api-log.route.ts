import { Router } from 'express';
import { apiLogController } from './api-log.controller.js';
import { checkAuth } from '../../middleware/CheckAuth.js';
import { UserRole } from '../../../constants/userRole.js';
import { zodValidator } from '../../middleware/zodValidator.js';
import { getErrorLogsSchema } from './api-log.validation.js';

/**
 * @swagger
 * tags:
 *   name: API Log
 *   description: API Log management operations
 */

/**
 * @swagger
 * /logs:
 *   delete:
 *     summary: Clear all API logs (Super Admin only)
 *     tags: [API Log]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API logs cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "API logs cleared successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (only Super Admin can clear logs)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /logs/admin/error-logs:
 *   get:
 *     summary: Get all error API logs with pagination and filtering (Super Admin only)
 *     tags: [API Log]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: statusCode
 *         schema:
 *           type: integer
 *         description: Filter by status code (e.g., 404, 500)
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *         description: Filter by request method (e.g., GET, POST)
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         description: Filter by URL (partial match)
 *       - in: query
 *         name: ip
 *         schema:
 *           type: string
 *         description: Filter by IP address (partial match)
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: Filter by error message content (partial match)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by the ID of the user associated with the log
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs up to this date (ISO 8601 format)
 *     responses:
 *       200:
 *         description: Error API logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Error logs retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ApiLog'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 100
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (only Super Admin can access error logs)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const router = Router();

router.delete(
  '/',
  checkAuth(UserRole.SUPER_ADMIN),
  apiLogController.clearApiLogs
);

router.get(
  '/admin/error-logs',
  checkAuth(UserRole.SUPER_ADMIN, UserRole.CASHIER),
  zodValidator(getErrorLogsSchema, 'query'),
  apiLogController.getPaginatedErrorLogs
);

export const apiLogRoutes = router;
