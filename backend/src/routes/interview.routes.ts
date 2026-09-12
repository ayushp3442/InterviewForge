import { Router } from "express";
import { createInterview, addQuestionsToInterview, submitResponse, completeInterview, getInterviewReport, listInterviews, deleteInterview, getInterviewSummary } from "../controllers/interview.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";


const router = Router();

// Apply role-based authorization (e.g. only 'student' role can access these interview actions)
router.get("/", authenticate, authorize("student"), listInterviews);
router.post("/", authenticate, authorize("student"), createInterview);
router.get("/summary", authenticate, authorize("student"), getInterviewSummary);
router.get("/:id/report", authenticate, authorize("student"), getInterviewReport);
router.post("/:id/questions", authenticate, authorize("student"), addQuestionsToInterview);
router.post("/questions/:id/response", authenticate, authorize("student"), submitResponse);
router.post("/:id/complete", authenticate, authorize("student"), completeInterview);
router.delete("/:id", authenticate, authorize("student"), deleteInterview);


export default router;