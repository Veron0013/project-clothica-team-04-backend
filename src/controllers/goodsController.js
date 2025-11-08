import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import { Good } from '../models/good.js';
import '../models/feedback.js';
import '../models/category.js';

export const getAllGoods = async (req, res, next) => {
  try {
    const {
      category,
      sizes,
      fromPrice = 1,
      toPrice = 20000,
      color,
      gender,
      page = 1,
      perPage = 12,
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const perPageNum = Math.min(12, Math.max(8, Number(perPage) || 12));
    const skip = (pageNum - 1) * perPageNum;
    const q = Good.find()
      .where('price.value').gte(Number(fromPrice)).lte(Number(toPrice))
      .populate('feedbacks')
      .populate('category', 'name');

    if (category && isValidObjectId(category)) {
      q.where('category').equals(category);
    }

    if (sizes) {
      const list = String(sizes).split(',').map(s => s.trim()).filter(Boolean);
      if (list.length) {
        q.or([
          { size: { $in: list } },
          { sizes: { $in: list } },
        ]);
      }
    }

    if (color) {
      q.or([
        { color: color },
        { colors: { $in: [color] } },
      ]);
    }

    if (gender) {
      q.where('gender').equals(gender);
    }

    const [totalGoods, goods] = await Promise.all([
      q.clone().countDocuments(),
      q.sort({ createdAt: -1 }).skip(skip).limit(perPageNum),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalGoods / perPageNum));
    res.status(200).json({ page: pageNum, perPage: perPageNum, totalGoods, totalPages, goods });
  } catch (err) { next(err); }
};

export const getGoodById = async (req, res, next) => {
  try {
    const { goodId } = req.params;
    if (!isValidObjectId(goodId)) {
      return next(createHttpError(400, 'Invalid good id'));
    }

    const good = await Good.findById(goodId)
      .populate('category', 'name')
      .populate('feedbacks');

    if (!good) return next(createHttpError(404, 'Good not found'));
    res.status(200).json(good);
  } catch (err) { next(err); }
};