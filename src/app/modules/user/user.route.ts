import { Router } from "express";
import userController from './user.controller.js';
import { checkAuth } from '../../middleware/CheckAuth.js';
import { UserRole } from "@prisma/client";


const router = Router();

router.get("/", checkAuth(UserRole.ADMIN), userController.getAllUsers);

export const UserRoutes = router;