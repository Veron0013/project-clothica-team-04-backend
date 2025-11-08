import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import { Feedback } from "../models/feedback.js";
import { Good } from "../models/good.js";

export const getFeedbacks = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 6));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.goodId && isValidObjectId(req.query.goodId)) {
      filter.good = req.query.goodId;
    }

    const [total, items] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .populate("user", "username email")
        .populate("good", "name"),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      items,
    });
  } catch (err) {
    next(err);
  }
};

export const createFeedback = async (req, res, next) => {
  try {
    const { goodId, rate, description } = req.body;

    const good = await Good.findById(goodId);
    if (!good) return next(createHttpError(404, "Good not found"));

    const user = req.user;
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const doc = await Feedback.create({
      author: user.username || user.email,
      user: user._id,
      good: good._id,
      rate,
      description,
      date: new Date(),
    });

    await Good.updateOne(
      { _id: good._id },
      { $addToSet: { feedbacks: doc._id } }
    );

    res.status(201).json(doc);
  } catch (err) {
    if (err?.code === 11000) {
      return next(createHttpError(409, "You already reviewed this good"));
    }
    next(err);
  }
};