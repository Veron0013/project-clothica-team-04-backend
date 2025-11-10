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
        index: true,
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        index: true,
        min: [0.01, 'Total amount must be positive'],
    },
    deliveryDetails: {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
    },
    status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PENDING,
        index: true,
    },
},
    {
        timestamps: true,
        versionKey: false,
    },
);

export const Order = model('Order', orderSchema);
