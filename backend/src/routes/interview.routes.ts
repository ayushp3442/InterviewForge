import { Router } from "express";
import { createInterview,addQuestionsToInterview } from "../controllers/interview.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createInterview);
router.post("/:id/questions", authenticate, addQuestionsToInterview);


export default router;