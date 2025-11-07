import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

import { User } from '../models/user.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';
import { sendMail } from '../utils/sendMail.js';
import { normalizePhone } from '../utils/normalizePhone.js';

export const registerUser = async (req, res, next) => {
  try {
    const { phone: rawPhone, password, name } = req.body ?? {};
    if (!rawPhone || !password) return next(createHttpError(400, 'Phone and password required'));

    const phone = normalizePhone(rawPhone);
    if (!phone) return next(createHttpError(400, 'Invalid phone number'));

    const exists = await User.findOne({ phone });
    if (exists) return next(createHttpError(400, 'Phone already in use'));

    const user = await User.create({ phone, password, name });
    const newSession = await createSession(user._id);
    setSessionCookies(res, newSession);

    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { phone: rawPhone, password } = req.body ?? {};
    if (!rawPhone || !password) return next(createHttpError(400, 'Phone and password required'));

    const phone = normalizePhone(rawPhone);
    if (!phone) return next(createHttpError(400, 'Invalid phone number'));

    const user = await User.findOne({ phone }).select('+password');
    if (!user) return next(createHttpError(401, 'Invalid phone or password'));

    const isValid = await (typeof user.comparePassword === 'function'
      ? user.comparePassword(password)
      : bcrypt.compare(password, user.password));

    if (!isValid) return next(createHttpError(401, 'Invalid phone or password'));

    await Session.deleteOne({ userId: user._id });

    const newSession = await createSession(user._id);
    setSessionCookies(res, newSession);

    const safe = user.toObject();
    delete safe.password;
    res.json({ user: safe });
  } catch (e) {
    next(e);
  }
};
export const logoutUser = async (req, res) => {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }
  } catch (error) {
    console.error('Error deleting session:', error.message);
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const refreshUserSession = async (req, res, next) => {
  if (!req.cookies?.sessionId || !req.cookies?.refreshToken) {
    res.clearCookie('sessionId');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    throw createHttpError(400, 'Invalid or expired refresh token');
  }

  const { sessionId, refreshToken } = req.cookies;

  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  const isSessionExpired = new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionExpired) {
    return next(createHttpError(401, 'Token expired'));
  }

  await Session.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({ message: 'Session refreshed' });
};

export const getSession = async (req, res, next) => {
  try {
    if (!req.user?.id) return next(createHttpError(401, 'Unauthorized'));

    const user = await User.findById(req.user.id).select('-password').lean();

    if (!user) return next(createHttpError(401, 'Unauthorized'));

    res.json({ user });
  } catch (e) {
    next(e);
  }
};

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      message: 'If this email exists, a reset link has been sent',
    });
  }

  const resetToken = jwt.sign({ sub: user._id, email }, process.env.JWT_SECRET, { expiresIn: '15m' });

  const templatePath = path.resolve('src/templates/reset-password-email.html');

  const templateSource = await fs.readFile(templatePath, 'utf-8');

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  try {
    await sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (error) {
    throw createHttpError(500, error);
  }

  res.status(200).json({
    message: 'Password reset email sent successfully',
  });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid token');
  }

  const user = await User.findOne({ _id: payload.sub, email: payload.email });

  if (!user) {
    throw createHttpError(404, 'user not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updateOne({ _id: user._id }, { password: hashedPassword });

  await Session.deleteMany({ userId: user._id });

  res.status(200).json({
    message: 'Password reset successfully. Please log in again.',
  });
};
