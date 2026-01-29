import crypto from "crypto";

/**
 * Generates a secure random token, typically used for password reset.
 *
 * This function uses Node.js's `crypto` module to create a cryptographically
 * strong pseudo-random data, which is then converted to a hexadecimal string.
 * This ensures the generated tokens are unpredictable and suitable for security-sensitive operations.
 *
 * @returns {string} A 64-character hexadecimal string representing the 32-byte token.
 *
 * @example
 * // To generate a new reset token:
 * import { generateResetToken } from './tokenGenerator.js';
 *
 * const resetToken = generateResetToken();
 * console.log('Generated Reset Token:', resetToken); // e.g., 'a1b2c3d4e5f6...'
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Calculates the expiration time for a token.
 *
 * This function returns a `Date` object representing a point in time
 * `minutes` from the current moment. It's useful for setting expiration
 * dates for tokens like password reset tokens or email verification tokens.
 *
 * @param {number} [minutes=10] - The number of minutes from now until the token expires. Defaults to 10 minutes.
 * @returns {Date} A Date object indicating the expiration time.
 *
 * @example
 * // Get expiration time for a token valid for 10 minutes (default):
 * import { getTokenExpirationTime } from './tokenGenerator.js';
 *
 * const expiryDefault = getTokenExpirationTime();
 * console.log('Default Expiration:', expiryDefault); // e.g., 2026-01-29T11:00:00.000Z
 *
 * @example
 * // Get expiration time for a token valid for 30 minutes:
 * import { getTokenExpirationTime } from './tokenGenerator.js';
 *
 * const expiryCustom = getTokenExpirationTime(30);
 * console.log('Custom Expiration (30 min):', expiryCustom); // e.g., 2026-01-29T11:20:00.000Z
 */
export const getTokenExpirationTime = (minutes = 10): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
