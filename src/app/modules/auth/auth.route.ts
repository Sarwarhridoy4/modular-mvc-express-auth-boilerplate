import { Router } from "express";
import authController from './auth.controller.js';
import { zodValidator } from '../../middleware/zodValidator.js';
import { loginSchema, signupSchema } from './auth.validation.js';

const router = Router();

router.post("/signup", zodValidator(signupSchema), authController.signupUser);
router.post("/login", zodValidator(loginSchema), authController.loginWithEmailAndPassword);
router.post("/logout", authController.logout);

export const AuthRoutes = router;
