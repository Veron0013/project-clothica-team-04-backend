import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

const objectIdValidator = (value, helpers) => {
  return isValidObjectId(value) ? value : helpers.message('Invalid id format');
};

export const createFeedbackSchema = {
  [Segments.BODY]: Joi.object({
    author: Joi.string().min(2).max(53).required(),
    description: Joi.string().min(3).max(2000).required(),
    rate: Joi.number()
      .min(0)
      .max(5)
      .valid(0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
      .required(),
    category: Joi.string().trim().optional(),
    productId: Joi.string().custom(objectIdValidator).required(),
    userId: Joi.string().custom(objectIdValidator),
  }),
};

export const getFeedbacksSchema = {
  [Segments.QUERY]: Joi.object({
    productId: Joi.string().custom(objectIdValidator),
    userId: Joi.string().custom(objectIdValidator),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(24).default(6),
  }),
};