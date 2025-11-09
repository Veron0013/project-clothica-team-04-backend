import createHttpError from "http-errors";
import { isValidObjectId, Types } from "mongoose";
import { Feedback } from "../models/feedback.js";
import { Good } from "../models/good.js";
import { User } from "../models/user.js";

export const getFeedbacks = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 6));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.productId && isValidObjectId(req.query.productId)) {
      filter.productId = new Types.ObjectId(`${req.query.productId}`);//req.query.productId;
    }

    console.log("f", req.query)
    if (req.query.userId && isValidObjectId(req.query.userId)) {
      filter.userId = new Types.ObjectId(`${req.query.userId}`);
    }

    const [total, items] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .populate("productId", "name")
        .populate("userId", "name"),
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
    const { productId, author, rate, description, category, userId } = req.body;

    const product = await Good.findById(productId).select("_id");
    if (!product) return next(createHttpError(404, "Good not found"));

    const tempUserId = await User.findById(userId).select("_id") || ""

    const doc = await Feedback.create({
      productId: product._id,
      userId: tempUserId,
      author,
      rate,
      description,
      category,
      approved: false,
    });

    await Good.updateOne(
      { _id: product._id },
      { $addToSet: { feedbacks: doc._id } }
    ).catch(() => { });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};