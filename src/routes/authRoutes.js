import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';
import { loginUser, logoutUser, refreshUserSession, registerUser, getSession, requestResetEmail, resetPassword } from '../controllers/authController.js';
import { loginUserSchema, registerUserSchema, requestResetEmailSchema, resetPasswordSchema } from '../validations/authValidation.js';

const router = Router();

router.post('/auth/register', celebrate({ [Segments.BODY]: registerUserSchema }, { abortEarly: false }), registerUser);
router.post('/auth/login', celebrate({ [Segments.BODY]: loginUserSchema }, { abortEarly: false }), loginUser);
router.post('/auth/logout', logoutUser);
router.post('/auth/refresh', refreshUserSession);
router.get('/auth/me', getSession);
router.post("/auth/request-reset-pwd", celebrate(requestResetEmailSchema), requestResetEmail )
router.post("/auth/reset-password", celebrate(resetPasswordSchema), resetPassword)
export default router;
