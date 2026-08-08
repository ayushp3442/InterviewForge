import { Router } from "express";
import { createInterview,addQuestionsToInterview,submitResponse } from "../controllers/interview.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createInterview);
router.post("/:id/questions", authenticate, addQuestionsToInterview);
router.post("/questions/:id/response", authenticate, submitResponse);


export default router;