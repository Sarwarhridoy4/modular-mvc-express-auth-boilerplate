import { Router } from 'express';
import { apiLogController } from './api-log.controller';
import { checkAuth } from '../../middleware/CheckAuth';
import { UserRole } from '@prisma/client';

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
 */
const router = Router();

router.delete(
  '/',
  checkAuth(UserRole.SUPER_ADMIN),
  apiLogController.clearApiLogs
);

export const apiLogRoutes = router;
