import { normalizePhoneDigits } from "../utils/normalizePhone.js";
import { Joi, Segments } from "celebrate";

export const updateUserSchema = {
	[Segments.BODY]: Joi.object({
		name: Joi.string().min(2).allow("", null),
		lastName: Joi.string().allow("", null),
		city: Joi.string().allow("", null),
		phone: Joi.string()
			.required()
			.custom((value, helpers) => {
				const normalized = normalizePhoneDigits(value);
				if (!normalized) return helpers.error("any.invalid");
				return normalized;
			}, "Phone normalization"),
		warehoseString: Joi.string().allow("", null),
		username: Joi.string().required(),
		avatar: Joi.any(),
	}),
};
