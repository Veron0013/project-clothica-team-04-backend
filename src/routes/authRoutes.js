import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';
import { loginUser, logoutUser, refreshUserSession, registerUser, getSession } from '../controllers/authController.js';
import { loginUserSchema, registerUserSchema } from '../validations/authValidation.js';

const router = Router();
router.post('/auth/register', celebrate({ [Segments.BODY]: registerUserSchema }, { abortEarly: false }), registerUser);

router.post('/auth/login', celebrate({ [Segments.BODY]: loginUserSchema }, { abortEarly: false }), loginUser);
router.post('auth/logout', logoutUser);
router.post('auth/refresh', refreshUserSession);
router.get('/auth/session', getSession);

export default router;
