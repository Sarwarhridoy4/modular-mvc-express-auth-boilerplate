import crypto from "crypto";

/**
 * 🔐 Generate a secure random token for password reset
 * @returns {string} 32-byte hex token
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * ⏰ Calculate expiration time for reset token (default 10 minutes)
 * @param minutes - Number of minutes until expiration
 * @returns {Date} Expiration datetime
 */
export const getTokenExpirationTime = (minutes: number = 10): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
