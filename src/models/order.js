import { ORDER_STATUS } from "../constants/orderStatus.js";
import { model, Schema } from 'mongoose';

const orderItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Good',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
},
    { _id: false },
);

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    deliveryDetails: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, reqired: true },
    },
    status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PENDING,
    },
},
    {
        timestamps: true,
        versionKey: false,
    },
);

export const Order = model('Order', orderSchema);
