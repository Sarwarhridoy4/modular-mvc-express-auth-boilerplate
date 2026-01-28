import { Router } from "express";
import authController from "./auth.controller.js";
import { zodValidator } from "../../middleware/zodValidator.js";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/signup", zodValidator(signupSchema), authController.signupUser);
router.post(
  "/login",
  zodValidator(loginSchema),
  authController.loginWithEmailAndPassword,
);
router.post("/logout", authController.logout);
router.post(
  "/forgot-password",
  zodValidator(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  zodValidator(resetPasswordSchema),
  authController.resetPassword,
);

export const AuthRoutes = router;
