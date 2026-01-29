/* eslint-disable no-console */
import { StatusCodes } from "http-status-codes";
import { generateToken, verifyToken} from './jwt.js';
import { env } from '../config/env.js';
import AppError from '../helpers/errorHelper/AppError.js';
import { prisma } from '../config/db.js';
import { UserRole } from "@prisma/client";
import { AuthJwtPayload } from '../app/modules/auth/auth.interface.js';

/**
 * 🔐 Generate access + refresh tokens for a user
 */
export const createUserTokens = async (user: {
  id: string;
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
    userId: user.id,
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
 * ♻️ Generate new access token using refresh token
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
        userId: user.id,
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
