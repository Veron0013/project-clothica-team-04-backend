import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { GENDERS, SIZES, COLORS } from '../models/good.js';

const objectId = (v, h) => (isValidObjectId(v) ? v : h.message('Invalid id format'));

const csvEnumRegex = (arr) => new RegExp(`^(${arr.join('|')})(,(${arr.join('|')}))*$`);

export const getAllGoodsSchema = {
  [Segments.QUERY]: Joi.object({
    search: Joi.string().trim(),
    category: Joi.string().custom(objectId),
    sizes: Joi.alternatives().try(
      Joi.string().valid(...SIZES),
      Joi.array().items(Joi.string().valid(...SIZES))
    ).optional(),
    fromPrice: Joi.number().integer().min(1).max(1999999).default(1),
    toPrice: Joi.number().integer().min(2).max(2000000).default(20000),
    color: Joi.string().valid(...COLORS),
    gender: Joi.alternatives().try(
      Joi.string().pattern(csvEnumRegex(GENDERS)),
      Joi.array().items(Joi.string().valid(...GENDERS))
    ),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(3).default(12),
    sort: Joi.string().valid('price_asc', 'price_desc', 'name_asc', 'name_desc'),
  }),
};

export const goodIdSchema = {
  [Segments.PARAMS]: Joi.object({
    goodId: Joi.string().custom(objectId).required(),
  }),
};