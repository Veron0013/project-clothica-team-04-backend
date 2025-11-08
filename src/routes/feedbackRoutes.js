import { Router } from 'express';
import { celebrate } from 'celebrate';
import { createFeedback, getFeedbacks } from '../controllers/feedbackController.js';
import { createFeedbackSchema, getFeedbacksSchema } from '../validations/feedbackValidation.js';

const router = Router();

router.get('/feedbacks', celebrate(getFeedbacksSchema), getFeedbacks);
router.post('/feedbacks', celebrate(createFeedbackSchema), createFeedback);

export default router;