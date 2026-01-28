import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../../utils/catchAsync.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import authService from "./auth.service.js";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import { setAuthCookie } from "../../../utils/setCookie.js";

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
  const userWithTokens = await authService.loginWithOTP(req.body);
  const { tokens, ...safeUser } = userWithTokens;

  setAuthCookie(res, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Login successful",
    data: {
      ...safeUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

const logout = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

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
  const result = await authService.resetPassword(req.body);
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
  const userWithTokens = await authService.verifyOTP(req.body);
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
