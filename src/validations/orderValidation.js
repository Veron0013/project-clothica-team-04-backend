import { Joi, Segments } from 'celebrate';
import { mongoose } from 'mongoose';
import { ORDER_STATUS } from '../constants/orderStatus.js';

const isValidOblectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
};

const itemSchema = Joi.object({
    productId: Joi.string().custom(isValidOblectId).required(),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().min(0.01).required(),
});

export const createOrderSchema = {
    [Segments.BODY]: Joi.object({
        items: Joi.array().items(itemSchema).min(1).required(),
        totalAmount: Joi.number().min(0.01).required(),
        deliveryDetails: Joi.object({
            fullName: Joi.string().min(3).required(),
            phone: Joi.string().min(10).required(),
            address: Joi.string().min(10).required(),
        }).required(),
    }),
};

export const updateOrderStatusSchema = {
    [Segments.BODY]: Joi.object({
        status: Joi.string().valid(...Object.values(ORDER_STATUS)).required(),
    }).min(1),
    [Segments.PARAMS]: Joi.object({
        orderId: Joi.string().custom(isValidOblectId).required(),
    }),
};