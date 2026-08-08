import { Request, Response, NextFunction } from "express";

/**
 * Centralized error-handling middleware.
 * Must be registered AFTER all routes in app.ts.
 * Express recognises it as an error handler because it has 4 parameters.
 */
export const errorHandler = (
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  // Always log the full error for debugging
  console.error(`[Error] ${status} — ${err.message}`, err.stack);

  res.status(status).json({ error: message });
};
