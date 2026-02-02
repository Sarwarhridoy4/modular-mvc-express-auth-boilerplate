/* eslint-disable no-console */
import { StatusCodes } from "http-status-codes";
import { generateToken, verifyToken} from './jwt.js';
import { env } from '../config/env.js';
import AppError from '../helpers/errorHelper/AppError.js';
import { prisma } from '../config/db.js';
import { UserRole } from "@prisma/client";
import { AuthJwtPayload } from '../app/modules/auth/auth.interface.js';

/**
 * Generates both an access token and a refresh token for a given user.
 *
 * This function creates a new user session in the database, associates it
 * with the provided user ID, user agent, and IP address. It then uses
 * this session information, along with user details, to generate a short-lived
 * access token and a longer-lived refresh token. Both tokens are JWTs.
 *
 * @param {object} user - The user object containing `id`, `email`, `name` and `role`.
 * @param {string} user.id - The unique identifier of the user.
 * @param {string} user.email - The email address of the user.
 * @param {string} user.name - The name of the user.
 * @param {UserRole} user.role - The role of the user (e.g., ADMIN, USER).
 * @param {string} [userAgent] - The user-agent string from the client's request.
 * @param {string} [ipAddress] - The IP address of the client.
 * @returns {Promise<{accessToken: string; refreshToken: string; expiresIn: string}>} An object containing the generated access token, refresh token, and access token expiration time.
 * @throws {AppError} If there's an issue with token generation or session creation.
 *
 * @example
 * // After a user successfully logs in:
 * import { createUserTokens } from './userTokens.js';
 * import { UserRole } from '@prisma/client';
 *
 * async function handleUserLogin(userId: string, email: string, role: UserRole, userAgent?: string, ipAddress?: string) {
 *   try {
 *     const tokens = await createUserTokens({ id: userId, email, role }, userAgent, ipAddress);
 *     console.log('Access Token:', tokens.accessToken);
 *     console.log('Refresh Token:', tokens.refreshToken);
 *     return tokens;
 *   } catch (error) {
 *     console.error('Failed to create user tokens:', error);
 *     throw error;
 *   }
 * }
 */
export const createUserTokens = async (user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}, userAgent?: string, ipAddress?: string) => {
  // Create UserSession
  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      userAgent: userAgent,
      ipAddress: ipAddress,
    },
  });

  const jwtPayload: AuthJwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    sessionId: session.id, // Include sessionId in JWT payload
  };

  // Access token (short lifespan)
  const accessToken = generateToken(
    jwtPayload,
    env.JWT_SECRET_KEY,
    env.JWT_EXPIRES_IN
  );

  // Refresh token (long lifespan)
  const refreshToken = generateToken(
    jwtPayload,
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_EXPIRES_IN,
  };
};

/**
 * Generates a new access token using a valid refresh token.
 *
 * This function takes an expired or soon-to-expire refresh token, verifies its
 * authenticity and checks for the existence of the associated user and session.
 * If all checks pass, a new access token is generated and returned. This mechanism
 * allows users to maintain authenticated sessions without needing to re-enter
 * credentials frequently.
 *
 * @param {string} refreshToken - The refresh token string provided by the client.
 * @returns {Promise<{accessToken: string; expiresIn: string}>} An object containing the new access token and its expiration time.
 * @throws {AppError} If the refresh token is invalid, expired, or if the user/session is not found.
 *
 * @example
 * // When an access token expires, use the refresh token to get a new one:
 * import { createNewAccessTokenWithRefreshToken } from './userTokens.js';
 *
 * async function refreshUserAccessToken(currentRefreshToken: string) {
 *   try {
 *     const newTokens = await createNewAccessTokenWithRefreshToken(currentRefreshToken);
 *     console.log('New Access Token:', newTokens.accessToken);
 *     // Update client-side access token
 *     return newTokens.accessToken;
 *   } catch (error) {
 *     console.error('Failed to refresh access token:', error);
 *     // Handle re-authentication (e.g., redirect to login)
 *     throw error;
 *   }
 * }
 */
export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  try {
    // Verify refresh token validity
    const decoded = verifyToken(
      refreshToken,
      env.JWT_REFRESH_SECRET
    ) as AuthJwtPayload;

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user)
      throw new AppError(StatusCodes.NOT_FOUND, "User no longer exists");

    // Check if session still exists
    if (!decoded.sessionId) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid session");
    }
    const session = await prisma.userSession.findUnique({
      where: { id: decoded.sessionId },
    });
    if (!session) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Session expired or invalid");
    }

    const newAccessToken = generateToken(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sessionId: decoded.sessionId, // Keep session ID in new access token
      },
      env.JWT_SECRET_KEY,
      env.JWT_EXPIRES_IN
    );

    return {
      accessToken: newAccessToken,
      expiresIn: env.JWT_EXPIRES_IN,
    };
  } catch (err) {
    console.error("❌ Refresh token error:", err);
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired token");
  }
};
