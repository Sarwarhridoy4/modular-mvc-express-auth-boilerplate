import { Response } from "express";

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Sets authentication cookies (accessToken and refreshToken) in the response.
 *
 * This function is responsible for setting HTTP-only, secure, and same-site
 * cookies for both access and refresh tokens. The expiration times for
 * these cookies can be customized. This helps in managing user sessions
 * securely.
 *
 * @param {Response} res - The Express response object.
 * @param {AuthTokens} tokenInfo - An object containing `accessToken` and `refreshToken` strings.
 * @param {number} [accessTokenExpiryMs=15 * 60 * 1000] - Expiration time for the accessToken cookie in milliseconds (default: 15 minutes).
 * @param {number} [refreshTokenExpiryMs=7 * 24 * 60 * 60 * 1000] - Expiration time for the refreshToken cookie in milliseconds (default: 7 days).
 *
 * @example
 * // After successful login or token refresh:
 * import { setAuthCookie } from './setCookie.js';
 * // Assuming `res` is an Express Response object and `tokens` contains accessToken and refreshToken
 * const tokens = {
 *   accessToken: 'eyJhbGciOiJIUzI1Ni...',
 *   refreshToken: 'eyJhbGciOiJIUzI1Ni...',
 * };
 * setAuthCookie(res, tokens);
 *
 * @example
 * // Custom expiration times:
 * import { setAuthCookie } from './setCookie.js';
 * // Set access token to 30 minutes, refresh token to 30 days
 * setAuthCookie(res, tokens, 30 * 60 * 1000, 30 * 24 * 60 * 60 * 1000);
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
 * Clears authentication cookies (accessToken and refreshToken) from the client.
 *
 * This function is used during logout or when a user session needs to be
 * terminated, ensuring that the client no longer holds valid authentication
 * tokens in its cookies.
 *
 * @param {Response} res - The Express response object.
 *
 * @example
 * // On user logout:
 * import { clearAuthCookie } from './setCookie.js';
 * // Assuming `res` is an Express Response object
 * clearAuthCookie(res);
 * res.status(200).json({ message: 'Logged out successfully' });
 */
export const clearAuthCookie = (res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};
