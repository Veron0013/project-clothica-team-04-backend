import createHttpError from 'http-errors';
import { Subscription } from '../models/subscription.js';

export const createSubscription = async (req, res, next) => {
  const { email } = req.body;

  const subscriptionExist = await Subscription.findOne({ email });

  if (subscriptionExist) {
    return next(createHttpError(409, 'Така поштова адреса вже має підписку.'));
  }

  const subscription = await Subscription.create({ email });
  res.status(201).json({
    message: 'Підписка успішно створена.',
    subscription,
  });
};
