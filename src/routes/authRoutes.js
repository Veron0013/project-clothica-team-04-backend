import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  getSession,
  requestResetEmail,
  resetPassword,
  confirmChangeEmail,
  requestChangeEmail,
} from '../controllers/authController.js';
import {
  requestChangeEmailSchema,
  loginUserSchema,
  registerUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
  confirmChangeEmailSchema,
} from '../validations/authValidation.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/auth/register', celebrate({ [Segments.BODY]: registerUserSchema }, { abortEarly: false }), registerUser);
router.post('/auth/login', celebrate({ [Segments.BODY]: loginUserSchema }, { abortEarly: false }), loginUser);
router.post('/auth/logout', logoutUser);
router.post('/auth/refresh', refreshUserSession);
router.get('/auth/me', getSession);
router.post('/auth/request-reset-pwd', celebrate(requestResetEmailSchema), requestResetEmail);
router.post('/auth/reset-password', celebrate(resetPasswordSchema), resetPassword);

router.post('/auth/change-email-request', authenticate, celebrate(requestChangeEmailSchema), requestChangeEmail);
router.post('/auth/confirm-change-email', celebrate(confirmChangeEmailSchema), confirmChangeEmail);

export default router;
