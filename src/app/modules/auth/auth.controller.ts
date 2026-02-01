import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../../utils/catchAsync.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import authService from "./auth.service.js";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import { setAuthCookie } from "../../../utils/setCookie.js";
import { getClientIp } from "../../../utils/getClientIp.js";

const signupUser = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.signupUser(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "User registered successfully",
    data: user,
  });
});

const loginWithEmailAndPassword = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.loginWithEmailAndPassword(req.body);
    
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: {
        email: result.email,
        requiresOTP: true,
      },
    });
  },
);

/**
 * 🔐 Login with OTP - Complete login after OTP verification
 */
const loginWithOTP = catchAsync(async (req: Request, res: Response) => {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = getClientIp(req);

  const userWithTokens = await authService.loginWithOTP({ ...req.body, userAgent, ipAddress });
  const { tokens, ...safeUser } = userWithTokens;

  setAuthCookie(res, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });

  let message = "Login successful";
  if (userWithTokens.autoLogoutScheduled) {
    message = userWithTokens.autoLogoutMessage || "Login successful, but an older session was terminated.";
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: message,
    data: {
      ...safeUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      autoLogoutScheduled: userWithTokens.autoLogoutScheduled,
      autoLogoutMessage: userWithTokens.autoLogoutMessage,
    },
  });
});

const logout = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    // Check if req.user and req.user.sessionId exist
    if (req.user && req.user.sessionId) {
      await authService.logoutUser(req.user.sessionId);
    } else {
      // Handle the case where sessionId is not available, maybe log a warning
      console.warn("Session ID not found during logout. Skipping session deletion.");
    }

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "User Logged Out Successfully",
      data: null,
    });
  },
);

/**
 * 🔑 Forgot Password - Send reset email
 */
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: null,
  });
});

/**
 * 🔐 Reset Password - Verify token and update password
 */
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  // Get token from query params or body
  const token = req.query.token as string || req.body.token;
  const payload = {
    token,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };
  
  const result = await authService.resetPassword(payload);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: null,
  });
});

/**
 * 📱 Request OTP - Send OTP to user email
 */
const requestOTP = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.requestOTP(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: null,
  });
});

/**
 * 🔐 Verify OTP - Verify OTP and login user
 */
const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = getClientIp(req);

  const userWithTokens = await authService.verifyOTP({ ...req.body, userAgent, ipAddress });
  const { tokens, ...safeUser } = userWithTokens;

  setAuthCookie(res, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Login successful with OTP",
    data: {
      ...safeUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

export default {
  signupUser,
  loginWithEmailAndPassword,
  loginWithOTP,
  logout,
  forgotPassword,
  resetPassword,
  requestOTP,
  verifyOTP,
};
