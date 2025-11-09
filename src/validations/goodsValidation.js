import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { GENDERS, SIZES, COLORS } from '../models/good.js';

const objectId = (v, h) => (isValidObjectId(v) ? v : h.message('Invalid id format'));

const csvEnumRegex = (arr) => new RegExp(`^(${arr.join('|')})(,(${arr.join('|')}))*$`);

export const getAllGoodsSchema = {
  [Segments.QUERY]: Joi.object({
    category:  Joi.string().custom(objectId),
    sizes:     Joi.string().pattern(csvEnumRegex(SIZES)),
    fromPrice: Joi.number().integer().min(1).max(19999).default(1),
    toPrice:   Joi.number().integer().min(2).max(20000).default(20000),
    color:     Joi.string().valid(...COLORS),
    gender:    Joi.alternatives().try(
                  Joi.string().pattern(csvEnumRegex(GENDERS)),
                  Joi.array().items(Joi.string().valid(...GENDERS))
               ),
    page:      Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(8).max(12).default(12),
    sort:      Joi.string().valid('price_asc','price_desc','name_asc','name_desc'),
  }),
};

export const goodIdSchema = {
  [Segments.PARAMS]: Joi.object({
    goodId: Joi.string().custom(objectId).required(),
  }),
};