import { UserRole } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { env } from "../../../config/env.js";
import AppError from "../../../helpers/errorHelper/AppError.js";
import {
  LoginPayload,
  SignupPayload,
  UserWithTokens,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "./auth.type.js";
import { StatusCodes } from "http-status-codes";
import { createUserTokens } from "../../../utils/userTokens.js";
import { prisma } from "../../../config/db.js";
import { sendEmail } from "../../../utils/sendEmail.js";
import {
  generateResetToken,
  getTokenExpirationTime,
} from "../../../utils/tokenGenerator.js";

const signupUser = async (payload: SignupPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existingUser)
    throw new AppError(400, "User already exists with this email");

  const hashedPassword = await bcryptjs.hash(
    payload.password,
    Number(env.BYCRYPT_SALT_ROUNDS),
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role || UserRole.CASHIER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const loginWithEmailAndPassword = async (
  payload: LoginPayload,
): Promise<UserWithTokens> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  const isPasswordValid = await bcryptjs.compare(
    payload.password,
    user.password,
  );
  if (!isPasswordValid)
    throw new AppError(StatusCodes.UNAUTHORIZED, "Password is incorrect!");

  const tokens = createUserTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const { password, ...safeUser } = user;
  return { ...safeUser, tokens };
};

/**
 * 🔑 Forgot Password - Generate reset token and send email
 */
const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found with this email");
  }

  // Generate reset token
  const resetToken = generateResetToken();
  const tokenExpiration = getTokenExpirationTime(10); // 10 minutes

  // Save token to database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: tokenExpiration,
    },
  });

  // Generate reset URL for frontend
  const resetUILink = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  // Send reset email
  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      templateName: "forgetPassword",
      templateData: {
        name: user.name,
        resetUILink,
      },
    });
  } catch (error) {
    // If email fails, clear the token from DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    throw error;
  }

  return {
    message: "Password reset email sent successfully",
  };
};

/**
 * 🔐 Reset Password - Verify token and update password
 */
const resetPassword = async (payload: ResetPasswordPayload) => {
  const { token, password } = payload;

  // Find user with valid reset token
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        gt: new Date(), // Token not expired
      },
    },
  });

  if (!user) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Invalid or expired reset token",
    );
  }

  // Hash new password
  const hashedPassword = await bcryptjs.hash(
    password,
    Number(env.BYCRYPT_SALT_ROUNDS),
  );

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return {
    message: "Password reset successfully",
  };
};

export default {
  signupUser,
  loginWithEmailAndPassword,
  forgotPassword,
  resetPassword,
};
