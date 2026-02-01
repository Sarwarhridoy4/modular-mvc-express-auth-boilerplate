import type { Request } from 'express';

/**
 * Extracts the real client IP address from a request.
 * 
 * This function handles various scenarios including:
 * - Direct connections
 * - Proxy servers (X-Forwarded-For, X-Real-IP)
 * - Cloudflare (CF-Connecting-IP)
 * - Load balancers
 * 
 * @param req - Express request object
 * @returns The client's IP address as a string
 */
export const getClientIp = (req: Request): string => {
  // Check X-Forwarded-For header (most common for proxies)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
    // The first one is typically the real client IP
    const ips = typeof xForwardedFor === 'string' 
      ? xForwardedFor.split(',').map(ip => ip.trim())
      : xForwardedFor;
    const clientIp = Array.isArray(ips) ? ips[0] : ips;
    if (clientIp) return clientIp;
  }

  // Check X-Real-IP header (used by Nginx and others)
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp && typeof xRealIp === 'string') {
    return xRealIp;
  }

  // Check CF-Connecting-IP header (Cloudflare)
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (cfConnectingIp && typeof cfConnectingIp === 'string') {
    return cfConnectingIp;
  }

  // Check X-Client-IP header
  const xClientIp = req.headers['x-client-ip'];
  if (xClientIp && typeof xClientIp === 'string') {
    return xClientIp;
  }

  // Fall back to req.ip (Express built-in, requires trust proxy)
  if (req.ip) {
    // Convert IPv6 loopback to IPv4 for consistency
    if (req.ip === '::1' || req.ip === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }
    // Remove IPv6 prefix if present
    return req.ip.replace(/^::ffff:/, '');
  }

  // Last resort: socket remote address
  const socketIp = req.socket?.remoteAddress;
  if (socketIp) {
    if (socketIp === '::1' || socketIp === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }
    return socketIp.replace(/^::ffff:/, '');
  }

  // If all else fails, return unknown
  return 'Unknown';
};
