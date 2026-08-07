import { Router } from "express";
import { createInterview } from "../controllers/interview.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createInterview);

export default router;