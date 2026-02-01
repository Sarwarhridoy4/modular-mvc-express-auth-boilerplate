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
  RequestOTPPayload,
  VerifyOTPPayload,
} from "./auth.type.js";
import { StatusCodes } from "http-status-codes";
import { createUserTokens } from "../../../utils/userTokens.js";
import { prisma } from "../../../config/db.js";
import { sendEmail } from "../../../utils/sendEmail.js";
import {
  generateResetToken,
  getTokenExpirationTime,
} from "../../../utils/tokenGenerator.js";
import {
  generateOTP,
  getOTPExpirationTime,
  isOTPExpired,
  isOTPBlocked,
  getOTPBlockDuration,
  isOTPAttemptWindowExpired,
} from "../../../utils/otpGenerator.js";

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

  // Send welcome email
  try {
    const loginUrl = `${env.FRONTEND_URL}/auth/login`;
    const registrationDate = new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    await sendEmail({
      to: user.email,
      subject: "Welcome to POS Inventory System! 🎉",
      templateName: "welcomeEmail",
      templateData: {
        name: user.name,
        email: user.email,
        role: user.role,
        registrationDate,
        loginUrl,
      },
    });
  } catch (error) {
    // Log the error but don't fail the registration
    console.error("Failed to send welcome email:", error);
    // User is still created successfully even if email fails
  }

  return user;
};

const loginWithEmailAndPassword = async (
  payload: LoginPayload,
): Promise<{ message: string; email: string }> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  if (!(await bcryptjs.compare(payload.password, user.password))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Password is incorrect!");
  }

  // Check if user is currently blocked from requesting OTP
  if (user.otpBlockedUntil && isOTPBlocked(user.otpBlockedUntil)) {
    const blockedMinutes = Math.ceil(
      (user.otpBlockedUntil.getTime() - new Date().getTime()) / 60000,
    );
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Too many OTP requests. Please try again in ${blockedMinutes} minute(s)`,
    );
  }

  // Check if the 30-minute attempt window has expired
  let otpAttempts = user.otpAttempts || 0;
  const windowExpired = isOTPAttemptWindowExpired(user.otpAttemptWindowStart);

  if (windowExpired) {
    // Reset attempts and start new window
    otpAttempts = 0;
  }

  // Check if user exceeded 3 attempts in 30 minutes
  if (otpAttempts >= 3) {
    const blockUntil = getOTPBlockDuration();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpBlockedUntil: blockUntil,
        otpAttempts: otpAttempts + 1, // Still increment for logging
      },
    });

    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      "Too many OTP requests. Please try again after 10 minutes",
    );
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpires = getOTPExpirationTime();
  const now = new Date();

  // Save OTP to database with updated attempt tracking
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: otp,
      otpExpiresAt: otpExpires,
      otpAttempts: otpAttempts + 1,
      // Set window start time if this is the first attempt in the window
      otpAttemptWindowStart: windowExpired || !user.otpAttemptWindowStart ? now : user.otpAttemptWindowStart,
      // Clear block if it was set
      otpBlockedUntil: null,
    },
  });

  // Send OTP email
  try {
    await sendEmail({
      to: user.email,
      subject: "Your Login OTP Code",
      templateName: "otpEmail",
      templateData: {
        name: user.name,
        otpCode: otp,
      },
    });
  } catch (error) {
    // Clear OTP if email fails
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
      },
    });
    throw error;
  }

  return {
    message: "OTP sent to your email. Valid for 5 minutes",
    email: user.email,
  };
};

/**
 * � Login with OTP - Verify OTP and complete login
 */
const loginWithOTP = async (
  payload: VerifyOTPPayload,
): Promise<UserWithTokens> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      sessions: true, // Include sessions to check count
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found with this email");
  }

  // Check if user is blocked
  if (isOTPBlocked(user.otpBlockedUntil)) {
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      "Account is temporarily blocked. Please try again later",
    );
  }

  // Check if OTP exists
  if (!user.otpCode) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "No OTP found. Please request a new one",
    );
  }

  // Check if OTP is expired
  if (isOTPExpired(user.otpExpiresAt)) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "OTP has expired. Request a new one",
    );
  }

  // Verify OTP matches
  if (user.otpCode !== payload.otp) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid OTP");
  }

  // Clear OTP and generate tokens
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      otpBlockedUntil: null,
      otpAttemptWindowStart: null,
    },
  });

  let autoLogoutScheduled = false;
  let autoLogoutMessage: string | undefined = undefined;

  // Check active sessions and enforce limit
  if (user.sessions.length >= 2) {
    // Sort sessions by createdAt to find the oldest
    const oldestSession = user.sessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

    // Delete the oldest session
    await prisma.userSession.delete({
      where: { id: oldestSession.id },
    });

    autoLogoutScheduled = true;
    autoLogoutMessage = "An older session was automatically logged out. This session will be logged out in 10 seconds due to device limit.";
  }

  const tokens = await createUserTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  }, payload.userAgent, payload.ipAddress);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    tokens,
    autoLogoutScheduled,
    autoLogoutMessage,
  };
};

/**
 * �🔑 Forgot Password - Generate reset token and send email
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
  console.log("Resetting password with token:", token);

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

  // Update password, clear reset token, and reset OTP attempts
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      // Reset OTP attempts and blocks
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      otpBlockedUntil: null,
      otpAttemptWindowStart: null,
    },
  });

  return {
    message: "Password reset successfully",
  };
};

/**
 * 📱 Request OTP - Generate and send OTP to email
 */
const requestOTP = async (payload: RequestOTPPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found with this email");
  }

  // Check if user is currently blocked from requesting OTP
  if (user.otpBlockedUntil && isOTPBlocked(user.otpBlockedUntil)) {
    const blockedMinutes = Math.ceil(
      (user.otpBlockedUntil.getTime() - new Date().getTime()) / 60000,
    );
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Too many OTP requests. Please try again in ${blockedMinutes} minute(s)`,
    );
  }

  // Check if the 30-minute attempt window has expired
  let otpAttempts = user.otpAttempts || 0;
  const windowExpired = isOTPAttemptWindowExpired(user.otpAttemptWindowStart);

  if (windowExpired) {
    // Reset attempts and start new window
    otpAttempts = 0;
  }

  // Check if user exceeded 3 attempts in 30 minutes
  if (otpAttempts >= 3) {
    const blockUntil = getOTPBlockDuration();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpBlockedUntil: blockUntil,
        otpAttempts: otpAttempts + 1, // Still increment for logging
      },
    });

    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      "Too many OTP requests. Please try again after 10 minutes",
    );
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpires = getOTPExpirationTime();
  const now = new Date();

  // Save OTP to database with updated attempt tracking
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: otp,
      otpExpiresAt: otpExpires,
      otpAttempts: otpAttempts + 1,
      // Set window start time if this is the first attempt in the window
      otpAttemptWindowStart: windowExpired || !user.otpAttemptWindowStart ? now : user.otpAttemptWindowStart,
      // Clear block if it was set
      otpBlockedUntil: null,
    },
  });

  // Send OTP email
  try {
    await sendEmail({
      to: user.email,
      subject: "Your OTP Code",
      templateName: "otpEmail",
      templateData: {
        name: user.name,
        otpCode: otp,
      },
    });
  } catch (error) {
    // Clear OTP if email fails
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
      },
    });
    throw error;
  }

  return {
    message: "OTP sent to your email. Valid for 5 minutes",
  };
};

/**
 * 🔐 Verify OTP - Verify OTP and login user
 */
const verifyOTP = async (
  payload: VerifyOTPPayload,
): Promise<UserWithTokens> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      sessions: true, // Include sessions to check count
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found with this email");
  }

  // Check if user is blocked
  if (isOTPBlocked(user.otpBlockedUntil)) {
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      "Account is temporarily blocked. Please try again later",
    );
  }

  // Check if OTP exists
  if (!user.otpCode) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "No OTP found. Please request a new one",
    );
  }

  // Check if OTP is expired
  if (isOTPExpired(user.otpExpiresAt)) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "OTP has expired. Request a new one",
    );
  }

  // Verify OTP matches
  if (user.otpCode !== payload.otp) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid OTP");
  }

  // Clear OTP and generate tokens
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      otpBlockedUntil: null,
      otpAttemptWindowStart: null,
    },
  });

  // Check active sessions
  if (user.sessions.length >= 2) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You have reached the maximum number of active devices (2). Please log out from another device.",
    );
  }

  const tokens = await createUserTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  }, payload.userAgent, payload.ipAddress);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    tokens,
  };
};

/**
 * 🔒 Logout User - Delete user session
 */
const logoutUser = async (sessionId: string) => {
  await prisma.userSession.delete({
    where: {
      id: sessionId,
    },
  });
};

export default {
  signupUser,
  loginWithEmailAndPassword,
  loginWithOTP,
  forgotPassword,
  resetPassword,
  requestOTP,
  verifyOTP,
  logoutUser,
};
