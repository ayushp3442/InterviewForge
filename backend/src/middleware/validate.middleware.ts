import { Request, Response, NextFunction } from "express";

// ---- helpers ----

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// At least 8 chars, 1 uppercase, 1 lowercase, 1 digit
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function fail(res: Response, message: string) {
  return res.status(400).json({ error: message });
}

// ---- validators ----

/**
 * Validate register request body: name, email, password.
 */
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return fail(res, "Name must be at least 2 characters");
  }

  if (name.trim().length > 50) {
    return fail(res, "Name must not exceed 50 characters");
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return fail(res, "Please provide a valid email address");
  }

  if (!password || typeof password !== "string") {
    return fail(res, "Password is required");
  }

  if (!PASSWORD_REGEX.test(password)) {
    return fail(res, "Password must be at least 8 characters with 1 uppercase letter, 1 lowercase letter, and 1 number");
  }

  // Sanitize — trim whitespace
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
};

/**
 * Validate login request body: email, password.
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return fail(res, "Please provide a valid email address");
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    return fail(res, "Password is required");
  }

  // Sanitize
  req.body.email = email.trim().toLowerCase();

  next();
};

/**
 * Validate refresh request body: refreshToken.
 */
export const validateRefresh = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  if (!refreshToken || typeof refreshToken !== "string" || refreshToken.trim().length === 0) {
    return fail(res, "Refresh token is required");
  }

  next();
};
