import { celebrate } from 'celebrate';
import { Router } from 'express';
import { createSubscriptionSchema } from '../validations/subscriptValidation.js';
import { createSubscription, submitSubscription } from '../controllers/subscriptController.js';
import { authenticate, checkAdmin } from '../middleware/authenticate.js';

const router = Router();

router.post('/subscriptions', celebrate(createSubscriptionSchema), createSubscription);
// для адміна - розсилка
router.post('/submit-subscription', authenticate, checkAdmin, submitSubscription);

export default router;
