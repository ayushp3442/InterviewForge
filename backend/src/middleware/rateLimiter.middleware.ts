import rateLimit from "express-rate-limit";

/**
 * Strict rate limiter for authentication endpoints (login, register).
 * Prevents brute-force password attacks and credential stuffing.
 * Limit: 10 requests per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    error: "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * General rate limiter for all API routes.
 * Prevents abuse and DoS on the overall API.
 * Limit: 100 requests per 15-minute window per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for code execution endpoints (run / submit).
 * Prevents abuse of the Piston sandbox API.
 * Limit: 20 requests per 1-minute window per IP.
 */
export const codeExecutionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  message: {
    error: "Too many code execution requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

