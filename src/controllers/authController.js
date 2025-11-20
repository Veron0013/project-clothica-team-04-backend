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

export const registerUser = async (req, res) => {
  const { phone: rawPhone, password, name } = req.body ?? {};
  if (!rawPhone || !password) throw createHttpError(400, 'Необхідно ввести номер телефону та пароль.');

  const phone = normalizePhone(rawPhone);
  if (!phone) throw createHttpError(400, 'Некоректний номер телефону.');

  const exists = await User.findOne({ phone });
  if (exists) throw createHttpError(409, 'Цей номер телефону вже використовується.');

  const user = await User.create({ phone, password, name });
  const newSession = await createSession(user._id);
  setSessionCookies(res, newSession);

  res.status(201).json(user);

};

export const loginUser = async (req, res, next) => {
  try {
    const { phone: rawPhone, password } = req.body ?? {};
    if (!rawPhone || !password) throw createHttpError(400, 'Необхідно ввести номер телефону та пароль.');

    const phone = normalizePhone(rawPhone);
    if (!phone) throw createHttpError(400, 'Некоректний номер телефону.');

    const user = await User.findOne({ phone }).select('+password');
    if (!user) throw createHttpError(401, 'Невірний номер телефону або пароль.');

    const isValid = await (typeof user.comparePassword === 'function'
      ? user.comparePassword(password)
      : bcrypt.compare(password, user.password));

    if (!isValid) throw createHttpError(401, 'Невірний номер телефону або пароль.');

    await Session.deleteOne({ userId: user._id });

    const newSession = await createSession(user._id);
    setSessionCookies(res, newSession);

    const safe = user.toObject();
    delete safe.password;
    res.json(user);
  } catch (e) {
    next(e);
  }
};

const clearAuthCookies = (res) => {
  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
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

  clearAuthCookies(res)

  res.status(204).send();
};

export const refreshUserSession = async (req, res) => {

  const { sessionId, refreshToken } = req.cookies || {};

  if (!sessionId || !refreshToken) {
    clearAuthCookies(res);
    throw createHttpError(400, 'Недійсний або прострочений токен оновлення.');
  }

  console.log("sessionId", sessionId, refreshToken)

  const session = await Session.findOne({ _id: sessionId, refreshToken });
  if (!session) {
    clearAuthCookies(res);
    throw createHttpError(401, 'Сесію не знайдено.');
  }

  if (new Date() > new Date(session.refreshTokenValidUntil)) {
    await Session.deleteOne({ _id: sessionId, refreshToken });
    clearAuthCookies(res);
    throw createHttpError(401, 'Термін дії токена закінчився.');
  }

  await Session.deleteOne({ _id: sessionId, refreshToken });
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  const user = await User.findById(session.userId).select('-password').lean();
  if (!user) {
    clearAuthCookies(res);
    throw createHttpError(401, 'Користувача не знайдено.');
  }

  return res.json(user);
};

export const getSession = async (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');

  try {
    const { accessToken } = req.cookies || {};

    if (accessToken) {
      const session = await Session.findOne({ accessToken });
      if (session) {
        return res.status(200).json({ message: 'OK' });
      }
    }
    await refreshUserSession(req, res, next);
  } catch (error) {
    return next(error);
  }
};

export const requestResetEmail = async (req, res, next) => {
  const { phone, email } = req.body;

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(200).json({
        data: {
          message: "Якщо такий email існує — лист для відновлення надіслано.",
        }
      });
    }

    const resetToken = jwt.sign(
      { sub: user._id, phone },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const templatePath = path.resolve("src/templates/reset-password-email.html");
    const templateSource = await fs.readFile(templatePath, "utf-8");

    const template = handlebars.compile(templateSource);

    const html = template({
      name: user.username,
      link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
    });

    await sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Reset your password",
      html,
    });

    return res.status(200).json({
      data: {
        message: "Лист для відновлення пароля надіслано.",
      }
    });
  } catch (error) {
    next(createHttpError(500, "Помилка під час надсилання листа." + error?.message));
  }
};


export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  console.log(token, password)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: payload.sub, phone: payload.phone });

    if (!user) {
      return next(createHttpError(404, "Користувача не знайдено."));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ _id: user._id }, { password: hashedPassword });

    // важливо — скидаємо всі сесії користувача
    await Session.deleteMany({ userId: user._id });

    return res.status(200).json({
      data: {
        message: "Пароль змінено. Увійдіть повторно.",
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(createHttpError(401, "Термін дії токена вичерпано."));
    }
    if (error.name === "JsonWebTokenError") {
      return next(createHttpError(401, "Токен недійсний."));
    }
    next(error);
  }
};

