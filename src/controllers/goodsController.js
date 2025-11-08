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
      sort,
    } = req.query;

    const pageNum    = Math.max(1, Number(page) || 1);
    const perPageNum = Math.min(12, Math.max(8, Number(perPage) || 12));
    const priceMin   = Number(fromPrice) || 1;
    const priceMax   = Number(toPrice)   || 20000;
    if (priceMin > priceMax) {
      return next(createHttpError(400, 'fromPrice must be <= toPrice'));
    }

    const filter = { 'price.value': { $gte: priceMin, $lte: priceMax } };
    if (category && isValidObjectId(category)) filter.category = category;

    if (sizes) {
      const list = String(sizes).split(',').map(s => s.trim()).filter(Boolean);
      if (list.length) filter.size = { $in: list };
    }
    if (color)  filter.color  = color;
    if (gender) filter.gender = gender;

    const sortMap = {
      price_asc:  { 'price.value': 1 },
      price_desc: { 'price.value': -1 },
      name_asc:   { name: 1 },
      name_desc:  { name: -1 },
    };
    const sortStage = sortMap[sort] || { createdAt: -1 };

    const totalGoods = await Good.countDocuments(filter);
    const totalPages = Math.ceil(totalGoods / perPageNum);

    if (totalGoods > 0 && pageNum > totalPages) {
      return next(createHttpError(404, 'Page not found'));
    }

    const skip = (pageNum - 1) * perPageNum;

    const goods = await Good.find(filter)
      .sort(sortStage)
      .skip(skip)
      .limit(perPageNum)
      .populate('category', 'name')
      .populate('feedbacks')
      .lean();

    res.status(200).json({
      page: pageNum,
      perPage: perPageNum,
      totalGoods,
      totalPages,
      goods,
    });
  } catch (err) {
    next(err);
  }
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
  } catch (err) {
    next(err);
  }
};