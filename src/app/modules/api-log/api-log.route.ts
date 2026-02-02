import { Router } from 'express';
import { apiLogController } from './api-log.controller';
import { CheckAuth } from '../../middleware/CheckAuth';
import { UserRole } from '@prisma/client';

const router = Router();

router.delete(
  '/',
  CheckAuth(UserRole.SUPER_ADMIN),
  apiLogController.clearApiLogs
);

export const apiLogRoutes = router;
