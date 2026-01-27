import { Router } from "express";
import authController from "./auth.controller";
import { zodValidator } from "../../middleware/zodValidator";
import { loginSchema, signupSchema } from "./auth.validation";

const router = Router();

router.post("/signup", zodValidator(signupSchema), authController.signupUser);
router.post("/login", zodValidator(loginSchema), authController.loginWithEmailAndPassword);
router.post("/logout", authController.logout);

export const AuthRoutes = router;
