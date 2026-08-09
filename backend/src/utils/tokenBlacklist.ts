// In-memory refresh token blacklist with automatic TTL cleanup.
// Tokens are removed after they would have expired naturally (7 days).
// For production at scale, replace with Redis or a DB table.

const blacklistedTokens = new Map<string, number>(); // token -> expiry timestamp

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // cleanup every 1 hour

/**
 * Add a refresh token to the blacklist.
 * It will be automatically removed after the token's natural expiry (7 days).
 */
export const blacklistToken = (token: string): void => {
  const expiresAt = Date.now() + REFRESH_TOKEN_TTL_MS;
  blacklistedTokens.set(token, expiresAt);
};

/**
 * Check if a refresh token has been blacklisted (i.e., user logged out).
 */
export const isTokenBlacklisted = (token: string): boolean => {
  return blacklistedTokens.has(token);
};

/**
 * Remove expired entries from the blacklist to prevent memory leaks.
 */
const cleanup = (): void => {
  const now = Date.now();
  for (const [token, expiresAt] of blacklistedTokens.entries()) {
    if (now >= expiresAt) {
      blacklistedTokens.delete(token);
    }
  }
};

// Run cleanup periodically
setInterval(cleanup, CLEANUP_INTERVAL_MS);
