import { Router } from "express";
import { register, login, refresh, logout } from "../controllers/auth.controller";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Test protected route
router.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    message: "You are authenticated",
    userId: req.userId,
  });
});

export default router;