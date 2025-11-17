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
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true,
        default: null,
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
    comment: {
        type: String,
        trim: true,
        default: "",
    },
},
    {
        timestamps: true,
        versionKey: false,
    },
);

orderSchema.pre('validate', async function (next) {
    if (this.isNew && !this.orderNumber) {
        const currentYear = new Date().getFullYear();

        const lastOrder = await this.constructor
            .findOne({ orderNumber: new RegExp(`^${currentYear}-`) })
            .sort({ createdAt: -1 })
            .lean();

        let nextNumber = 1;
        if (lastOrder) {
            const lastNum = parseInt(lastOrder.orderNumber.split('-').pop(), 10);
            nextNumber = lastNum + 1;
        }

        this.orderNumber = `${currentYear}-${String(nextNumber).padStart(5, '0')}`;
    }
    next();
});

export const Order = model('Order', orderSchema);
