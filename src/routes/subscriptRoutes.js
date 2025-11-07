import { celebrate } from 'celebrate';
import { Router } from 'express';
import { createSubscriptionSchema } from '../validations/subscriptValidation.js';
import { createSubscription } from '../controllers/subscriptController.js';

const router = Router();

router.post('/subscriptions', celebrate(createSubscriptionSchema), createSubscription);

export default router;
