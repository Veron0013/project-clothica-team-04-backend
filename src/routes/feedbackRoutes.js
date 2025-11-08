import { Router } from "express";
import { celebrate } from "celebrate";
import { authenticate } from "../middleware/authenticate.js";
import { createFeedback, getFeedbacks } from "../controllers/feedbackController.js";
import { createFeedbackSchema, getFeedbacksSchema } from "../validations/feedbackValidation.js";

const router = Router();


router.get("/feedbacks", celebrate(getFeedbacksSchema), getFeedbacks);
router.post("/feedbacks", authenticate, celebrate(createFeedbackSchema), createFeedback);

export default router;