import { Router } from "express";
import { createInterview,addQuestionsToInterview,submitResponse,completeInterview } from "../controllers/interview.controller.js"; 
import { authenticate } from "../middleware/auth.middleware.js";


const router = Router();

router.post("/", authenticate, createInterview);
router.post("/:id/questions", authenticate, addQuestionsToInterview);
router.post("/questions/:id/response", authenticate, submitResponse);
router.post("/:id/complete", authenticate, completeInterview);


export default router;