import { Response } from "express";

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Set auth cookies (access + refresh tokens)
 */
export const setAuthCookie = (
  res: Response,
  tokenInfo: AuthTokens,
  accessTokenExpiryMs = 15 * 60 * 1000, // 15 min default
  refreshTokenExpiryMs = 7 * 24 * 60 * 60 * 1000 // 7 days default
) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: true, // only HTTPS in prod
      sameSite: "none",
      maxAge: accessTokenExpiryMs,
      path: "/",
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: refreshTokenExpiryMs,
      path: "/",
    });
  }
};

/**
 * Clear auth cookies (for logout)
 */
export const clearAuthCookie = (res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};
