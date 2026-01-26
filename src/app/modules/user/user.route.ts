import { Router } from "express";
import userController from "./user.controller";
import { checkAuth } from "../../middleware/CheckAuth";
import { UserRole } from "@prisma/client";


const router = Router();

router.get("/", checkAuth(UserRole.ADMIN), userController.getAllUsers);

export const UserRoutes = router;