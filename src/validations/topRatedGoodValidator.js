import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

const objectIdValidator = (value, helpers) => {
	return isValidObjectId(value) ? value : helpers.error('any.invalid');
};

export const createTopRatedGoodSchema = {
	[Segments.BODY]: Joi.object({
		productId: Joi.string().custom(objectIdValidator).required().messages({
			'any.required': 'Поле productId обовʼязкове',
			'any.invalid': 'Не коректний productId',
		}),
	}),
}

export const paginationSchema = {
	[Segments.QUERY]: Joi.object({
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).max(50).default(6),
	}),
};
