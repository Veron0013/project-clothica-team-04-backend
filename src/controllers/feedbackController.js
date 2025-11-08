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
    if (req.query.productId && isValidObjectId(req.query.productId)) {
      filter.productId = req.query.productId;
    }

    const [total, items] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .populate("productId", "name"),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      items,
    });
  } catch (err) {
    next(err);
  }
};

export const createFeedback = async (req, res, next) => {
  try {
    const { productId, author, rate, description, category } = req.body;

    const product = await Good.findById(productId).select("_id");
    if (!product) return next(createHttpError(404, "Good not found"));

    const doc = await Feedback.create({
      productId: product._id,
      author,
      rate,
      description,
      category,
      approved: false,
    });

    await Good.updateOne(
      { _id: product._id },
      { $addToSet: { feedbacks: doc._id } }
    ).catch(() => {});

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};