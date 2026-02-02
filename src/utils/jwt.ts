import jwt, { SignOptions } from "jsonwebtoken";
// adjust path
import { AuthJwtPayload } from '../app/modules/auth/auth.interface.js';
import AppError from '../helpers/errorHelper/AppError.js';



/**
 * Generates a JSON Web Token (JWT).
 *
 * This function creates a signed JWT using a given payload, secret, and expiration time.
 * It's commonly used to issue access tokens or refresh tokens after successful authentication.
 *
 * @param {AuthJwtPayload} payload - The payload to be included in the JWT.
 * @param {string} secret - The secret key used to sign the JWT.
 * @param {string} expiresIn - A string describing the token's expiration (e.g., '1h', '7d').
 * @returns {string} The generated JWT string.
 * @throws {AppError} If token generation fails.
 *
 * @example
 * // To generate an access token:
 * import { generateToken } from './jwt.js';
 * import { env } from '../config/env.js';
 * import { AuthJwtPayload } from '../app/modules/auth/auth.interface.js';
 *
 * const userPayload: AuthJwtPayload = {
 *   userId: 'user123',
 *   email: 'test@example.com',
 *   role: 'USER',
 *   sessionId: 'sessionABC'
 * };
 * const accessToken = generateToken(userPayload, env.JWT_SECRET_KEY, '1h');
 * console.log('Access Token:', accessToken);
 */
export const generateToken = (
  payload: AuthJwtPayload,
  secret: string,
  expiresIn: string
): string => {
  try {
    return jwt.sign(payload, secret, { expiresIn } as SignOptions);
  } catch (err: unknown) {
    throw new AppError(500, "Failed to generate token", (err as Error)?.message);
  }
};

/**
 * Verifies a JSON Web Token (JWT) and returns its decoded payload.
 *
 * This function validates a JWT's signature and expiration. If the token
 * is valid, it returns the original payload. If verification fails (e.g.,
 * due to invalid signature or expiration), it throws an `AppError`.
 *
 * @param {string} token - The JWT string to verify.
 * @param {string} secret - The secret key used to verify the JWT's signature.
 * @returns {AuthJwtPayload} The decoded payload of the verified JWT.
 * @throws {AppError} If the token is invalid or expired.
 *
 * @example
 * // To verify an access token:
 * import { verifyToken } from './jwt.js';
 * import { env } from '../config/env.js';
 *
 * const tokenToVerify = 'your-jwt-token-here';
 * try {
 *   const decodedPayload = verifyToken(tokenToVerify, env.JWT_SECRET_KEY);
 *   console.log('Decoded Payload:', decodedPayload);
 * } catch (error) {
 *   console.error('Token verification failed:', error.message);
 * }
 */
export const verifyToken = (token: string, secret: string): AuthJwtPayload => {
  try {
    return jwt.verify(token, secret) as AuthJwtPayload;
  } catch (err: unknown) {
    throw new AppError(401, "Invalid or expired token", (err as Error)?.message);
  }
};

/**
 * Decodes a JSON Web Token (JWT) without verifying its signature.
 *
 * Use this function with caution, primarily for debugging or inspecting
 * the token's payload in non-security-critical contexts, as it does not
 * guarantee the token's authenticity or integrity. Returns `null` if decoding fails.
 *
 * @param {string} token - The JWT string to decode.
 * @returns {AuthJwtPayload | null} The decoded payload if successful, otherwise `null`.
 *
 * @example
 * // To decode a token (for inspection/debugging):
 * import { decodeToken } from './jwt.js';
 *
 * const tokenToDecode = 'your-jwt-token-here';
 * const decodedPayload = decodeToken(tokenToDecode);
 * if (decodedPayload) {
 *   console.log('Decoded (unverified) Payload:', decodedPayload);
 * } else {
 *   console.log('Failed to decode token.');
 * }
 */
export const decodeToken = (token: string): AuthJwtPayload | null => {
  try {
    return jwt.decode(token) as AuthJwtPayload | null;
  } catch {
    return null;
  }
};
