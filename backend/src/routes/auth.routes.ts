import { Router } from "express";
import { register, login, refresh, logout } from "../controllers/auth.controller";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimiter.middleware";
import { validateRegister, validateLogin, validateRefresh } from "../middleware/validate.middleware";
import { Response } from "express";

const router = Router();

// Public auth routes — rate-limited + validated
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/refresh", validateRefresh, refresh);
router.post("/logout", logout);

// Protected test route
router.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    message: "You are authenticated",
    userId: req.userId,
  });
});

export default router;