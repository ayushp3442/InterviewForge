import { Router } from "express";
import { register, login, refresh, logout, updateProfile, changePassword, getMe } from "../controllers/auth.controller.js";
import { authenticate, AuthRequest } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";
import { validateRegister, validateLogin, validateRefresh } from "../middleware/validate.middleware.js";
import { Response } from "express";

const router = Router();

// Public auth routes — rate-limited + validated
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/refresh", validateRefresh, refresh);
router.post("/logout", logout);

// Protected routes
router.get("/me", authenticate, getMe);
router.patch("/profile", authenticate, updateProfile);
router.patch("/password", authenticate, changePassword);

export default router;