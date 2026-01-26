import jwt, { SignOptions } from "jsonwebtoken";
// adjust path
import { AuthJwtPayload } from "../app/modules/auth/auth.interface";
import AppError from "../helpers/errorHelper/AppError";



/**
 * 🔐 Generate a signed JWT
 */
export const generateToken = (
  payload: AuthJwtPayload,
  secret: string,
  expiresIn: string
): string => {
  try {
    return jwt.sign(payload, secret, { expiresIn } as SignOptions);
  } catch (err: any) {
    throw new AppError(500, "Failed to generate token", err?.message);
  }
};

/**
 * ✅ Verify token and return decoded payload
 */
export const verifyToken = (token: string, secret: string): AuthJwtPayload => {
  try {
    return jwt.verify(token, secret) as AuthJwtPayload;
  } catch (err: any) {
    throw new AppError(401, "Invalid or expired token", err?.message);
  }
};

/**
 * ⚠ Decode token without verification
 * - Only use for debugging or non-secure scenarios
 */
export const decodeToken = (token: string): AuthJwtPayload | null => {
  try {
    return jwt.decode(token) as AuthJwtPayload | null;
  } catch {
    return null;
  }
};
