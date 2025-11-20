import { Joi, Segments } from 'celebrate';

export const registerUserSchema = Joi.object({
  phone: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
  name: Joi.string().max(32).allow('', null),
}).unknown(false);

export const loginUserSchema = Joi.object({
  phone: Joi.string().required(),
  password: Joi.string().required(),
}).unknown(false);

export const requestResetEmailSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
  }),
};

export const resetPasswordSchema = {
  [Segments.BODY]: Joi.object({
    password: Joi.string().min(8).required(),
    token: Joi.string().required(),
  }),
};
