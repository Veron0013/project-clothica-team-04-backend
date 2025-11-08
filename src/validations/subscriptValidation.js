import { Joi, Segments } from 'celebrate';

export const createSubscriptionSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required().trim().messages({
      'string.base': 'Невірний формат електронної адреси',
      'any.required': "Email - це обов'язкове поле",
    }),
  }),
};
