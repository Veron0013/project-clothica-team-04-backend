import { Order } from '../models/order.js';
import { feedbackPipeline } from '../utils/goodsPapeline.js';
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
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const user = req.user;

    const matchStage = user.role === 'admin'
      ? {}
      : { userId: user._id };

    const pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'goods',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      ...feedbackPipeline('$product._id'),
      {
        $group: {
          _id: '$_id',
          userId: { $first: '$userId' },
          totalAmount: { $first: '$totalAmount' },
          status: { $first: '$status' },
          deliveryDetails: { $first: '$deliveryDetails' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          items: {
            $push: {
              productId: '$product._id',
              name: '$product.name',
              price: '$product.price.value',
              currency: '$product.price.currency',
              image: '$product.image',
              quantity: '$items.quantity',
              totalPrice: { $multiply: ['$items.quantity', '$items.price'] },
              feedbackCount: '$feedbackCount',
              averageRating: '$averageRating',
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const orders = await Order.aggregate(pipeline);

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!updatedOrder) {
      return createHttpError(404, 'Order not found');

    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    next(err);
  }
};

