import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

const objectIdValidator = (value, helpers) =>
  isValidObjectId(value) ? value : helpers.message('Invalid id format');

const sizesPattern = /^(XXS|XS|S|M|L|XL|XXL)(,(XXS|XS|S|M|L|XL|XXL))*$/;

export const getAllGoodsSchema = {
  [Segments.QUERY]: Joi.object({
    category: Joi.string().custom(objectIdValidator),
    sizes: Joi.string().pattern(sizesPattern),
    fromPrice: Joi.number().integer().min(1).max(19999).default(1),
    toPrice: Joi.number().integer().min(2).max(20000).default(20000),
    color: Joi.string().pattern(/^(white|black|grey|blue|green|red|pastel)$/),
    gender: Joi.string().pattern(/^(women|men|unisex)$/),
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(8).max(12).default(12),
  }),
};

export const goodIdSchema = {
  [Segments.PARAMS]: Joi.object({
    goodId: Joi.string().custom(objectIdValidator).required(),
  }),
};