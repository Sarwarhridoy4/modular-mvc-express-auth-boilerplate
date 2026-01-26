import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import authService from "./auth.service";
import type { Request, Response } from "express";
import { setAuthCookie } from "../../../utils/setCookie";


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
    const userWithTokens = await authService.loginWithEmailAndPassword(
      req.body
    );
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
  }
);


export default {
  signupUser,
  loginWithEmailAndPassword,
};