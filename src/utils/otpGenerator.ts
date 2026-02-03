import crypto from "crypto";

/**
 * 🔐 OTP (One-Time Password) Utilities
 * Secure 6-digit OTP generation and validation
 */

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP code
 *
 * @example
 * // Generate a new OTP
 * const otp = generateOTP(); // e.g., "123456"
 * console.log(otp);
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash an OTP for secure storage.
 * Uses SHA-256 so we never store the raw code in the database.
 */
export const hashOTP = (otp: string): string => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

/**
 * Verify a provided OTP against a stored hash using a timing-safe compare.
 */
export const verifyOTPHash = (otp: string, hashed: string): boolean => {
  const candidate = hashOTP(otp);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(hashed, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

/**
 * Calculate OTP expiration time (5 minutes from now)
 * @returns {Date} Expiration datetime
 *
 * @example
 * // Get the expiration time for a new OTP
 * const expiresAt = getOTPExpirationTime();
 * console.log('OTP expires at:', expiresAt); // e.g., 2026-01-29T10:35:00.000Z
 */
export const getOTPExpirationTime = (): Date => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

/**
 * Check if OTP is expired
 * @param {Date | null} expiresAt - Expiration datetime
 * @returns {boolean} true if expired, false otherwise
 *
 * @example
 * // Check if an OTP that expires in 1 minute is expired (should be false)
 * const futureExpiration = new Date(Date.now() + 60 * 1000);
 * console.log('Is OTP expired (future)?', isOTPExpired(futureExpiration)); // false
 *
 * // Check if an OTP that expired 1 minute ago is expired (should be true)
 * const pastExpiration = new Date(Date.now() - 60 * 1000);
 * console.log('Is OTP expired (past)?', isOTPExpired(pastExpiration)); // true
 *
 * // Check with null expiration (should be true)
 * console.log('Is OTP expired (null)?', isOTPExpired(null)); // true
 */
export const isOTPExpired = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
};

/**
 * Check if user is blocked from requesting OTP
 * @param {Date | null} blockedUntil - Block expiration datetime
 * @returns {boolean} true if blocked, false otherwise
 *
 * @example
 * // Check if user is blocked until 5 minutes from now (should be true)
 * const futureBlock = new Date(Date.now() + 5 * 60 * 1000);
 * console.log('Is user OTP blocked (future)?', isOTPBlocked(futureBlock)); // true
 *
 * // Check if user was blocked until 5 minutes ago (should be false)
 * const pastBlock = new Date(Date.now() - 5 * 60 * 1000);
 * console.log('Is user OTP blocked (past)?', isOTPBlocked(pastBlock)); // false
 *
 * // Check with null blockedUntil (should be false)
 * console.log('Is user OTP blocked (null)?', isOTPBlocked(null)); // false
 */
export const isOTPBlocked = (blockedUntil: Date | null): boolean => {
  if (!blockedUntil) return false;
  return new Date() < blockedUntil;
};

/**
 * Calculate OTP block duration (10 minutes from now)
 * @returns {Date} Block expiration datetime
 *
 * @example
 * // Get the time until the OTP block expires
 * const blockExpires = getOTPBlockDuration();
 * console.log('OTP block expires at:', blockExpires); // e.g., 2026-01-29T10:40:00.000Z
 */
export const getOTPBlockDuration = (): Date => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Check if OTP attempt window has expired (30 minutes)
 * @param {Date | null} lastAttemptTime - Time of last attempt
 * @returns {boolean} true if window expired, false otherwise
 *
 * @example
 * // Last attempt 10 minutes ago (should be false)
 * const recentAttempt = new Date(Date.now() - 10 * 60 * 1000);
 * console.log('OTP attempt window expired (recent)?', isOTPAttemptWindowExpired(recentAttempt)); // false
 *
 * // Last attempt 40 minutes ago (should be true)
 * const oldAttempt = new Date(Date.now() - 40 * 60 * 1000);
 * console.log('OTP attempt window expired (old)?', isOTPAttemptWindowExpired(oldAttempt)); // true
 *
 * // Check with null lastAttemptTime (should be true)
 * console.log('OTP attempt window expired (null)?', isOTPAttemptWindowExpired(null)); // true
 */
export const isOTPAttemptWindowExpired = (
  lastAttemptTime: Date | null,
): boolean => {
  if (!lastAttemptTime) return true;
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return lastAttemptTime < thirtyMinutesAgo;
};
