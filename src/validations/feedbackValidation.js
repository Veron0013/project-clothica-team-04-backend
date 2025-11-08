import { Joi, Segments } from "celebrate";
import { isValidObjectId } from "mongoose";

const objectId = (value, helpers) => {
  if (!isValidObjectId(value)) return helpers.message("Invalid id format");
  return value;
};

export const createFeedbackSchema = {
  [Segments.BODY]: Joi.object({
    goodId: Joi.string().custom(objectId).required(),
    rate: Joi.number().integer().min(1).max(5).required().multiple(0.5),
    description: Joi.string().min(3).max(2000).required(),
  }),
};

export const getFeedbacksSchema = {
  [Segments.QUERY]: Joi.object({
    goodId: Joi.string().custom(objectId),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(24).default(6),
  }),
};