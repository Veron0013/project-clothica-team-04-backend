import { Order } from '../models/order.js';
import createHttpError from 'http-errors';

export const createOrder = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const newOrder = await Order.create({
            ...req.body,
            userId: userId,
        });

        res.status(201).json(newOrder);
    } catch (err) {
        next(err);
    }
};

export const createGuestOrder = async (req, res, next) => {
    try {
        const newOrder = await Order.create({
            ...req.body,
            userId: null,
        });

        res.status(201).json(newOrder);
    } catch (err) {
        next(err)
    }
};

export const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const orders = (await Order.find({ userId })).toSorted({ cretedAt: -1 });

        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true },
        );

        if (!updatedOrder) {
            createHttpError(404, 'Order not found');
        }

        res.status(200).json(updatedOrder);
    } catch (err) {
        next(err);
    }
};
