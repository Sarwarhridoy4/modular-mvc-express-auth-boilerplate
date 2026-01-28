import { Router } from "express";
import authController from "./auth.controller.js";
import { zodValidator } from "../../middleware/zodValidator.js";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  requestOTPSchema,
  verifyOTPSchema,
  loginWithOTPSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/signup", zodValidator(signupSchema), authController.signupUser);

// Step 1: Validate credentials and send OTP
router.post(
  "/login",
  zodValidator(loginSchema),
  authController.loginWithEmailAndPassword,
);

// Step 2: Verify OTP and complete login
router.post(
  "/login/verify-otp",
  zodValidator(loginWithOTPSchema),
  authController.loginWithOTP,
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
router.post(
  "/request-otp",
  zodValidator(requestOTPSchema),
  authController.requestOTP,
);
router.post(
  "/verify-otp",
  zodValidator(verifyOTPSchema),
  authController.verifyOTP,
);

export const AuthRoutes = router;
