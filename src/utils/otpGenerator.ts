/**
 * 🔐 OTP (One-Time Password) Utilities
 * Secure 6-digit OTP generation and validation
 */

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calculate OTP expiration time (5 minutes from now)
 * @returns {Date} Expiration datetime
 */
export const getOTPExpirationTime = (): Date => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

/**
 * Check if OTP is expired
 * @param expiresAt - Expiration datetime
 * @returns {boolean} true if expired, false otherwise
 */
export const isOTPExpired = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
};

/**
 * Check if user is blocked from requesting OTP
 * @param blockedUntil - Block expiration datetime
 * @returns {boolean} true if blocked, false otherwise
 */
export const isOTPBlocked = (blockedUntil: Date | null): boolean => {
  if (!blockedUntil) return false;
  return new Date() < blockedUntil;
};

/**
 * Calculate OTP block duration (10 minutes from now)
 * @returns {Date} Block expiration datetime
 */
export const getOTPBlockDuration = (): Date => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Check if OTP attempt window has expired (30 minutes)
 * @param lastAttemptTime - Time of last attempt
 * @returns {boolean} true if window expired, false otherwise
 */
export const isOTPAttemptWindowExpired = (lastAttemptTime: Date | null): boolean => {
  if (!lastAttemptTime) return true;
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return lastAttemptTime < thirtyMinutesAgo;
};
