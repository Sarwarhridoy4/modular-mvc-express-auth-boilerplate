import { Router } from 'express';
import { apiLogController } from './api-log.controller';
import { checkAuth } from '../../middleware/CheckAuth';
import { UserRole } from '@prisma/client';

const router = Router();

router.delete(
  '/',
  checkAuth(UserRole.SUPER_ADMIN),
  apiLogController.clearApiLogs
);

export const apiLogRoutes = router;
