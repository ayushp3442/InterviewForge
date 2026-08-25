import { Router } from "express";
import { createInterview,addQuestionsToInterview,submitResponse,completeInterview,getInterviewReport } from "../controllers/interview.controller.js"; 
import { authenticate, authorize } from "../middleware/auth.middleware.js"; 


const router = Router();

// Apply role-based authorization (e.g. only 'student' role can access these interview actions)
router.post("/", authenticate, authorize("student"), createInterview);
router.get("/:id/report", authenticate, authorize("student"), getInterviewReport);
router.post("/:id/questions", authenticate, authorize("student"), addQuestionsToInterview);
router.post("/questions/:id/response", authenticate, authorize("student"), submitResponse);
router.post("/:id/complete", authenticate, authorize("student"), completeInterview);


export default router;