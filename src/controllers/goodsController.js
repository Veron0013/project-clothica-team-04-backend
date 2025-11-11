import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import { Good } from '../models/good.js';
import '../models/feedback.js';
import '../models/category.js';
import { categoryLookupPipeline, feedbackPipeline, goodsBasePipeline } from '../utils/goodsPapeline.js';
import { Types } from 'mongoose';
import { Category } from '../models/category.js';
import { GENDERS, SIZES, COLORS } from '../models/good.js';

export const getAllGoods = async (req, res, next) => {
  try {
    const {
      category,
      sizes,
      fromPrice,
      toPrice,
      color,
      gender,
      page,
      perPage,
      sort,
    } = req.query;

    //const pageNum = Math.max(1, Number(page) || 1);
    //const perPageNum = Math.min(12, Math.max(8, Number(perPage) || 12));
    const priceMin = Number(fromPrice);
    const priceMax = Number(toPrice);

    const filter = {}

    if (priceMin > 0 && priceMax > 0) {
      if (priceMin > priceMax)
        throw createHttpError(400, 'fromPrice must be <= toPrice');

      filter['price.value'] = { $gte: priceMin, $lte: priceMax }
    }

    if (category && isValidObjectId(category)) filter.category = new Types.ObjectId(`${category}`);

    if (sizes) {
      const list = String(sizes).split(',').map(s => s.trim()).filter(Boolean);
      if (list.length) filter.size = { $in: list };
    }
    if (color) filter.color = color;
    if (gender) filter.gender = gender;

    const sortMap = {
      price_asc: { 'price.value': 1 },
      price_desc: { 'price.value': -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };
    const sortStage = sortMap[sort] || { createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const perPageNum = Math.max(8, Number(perPage));
    const skip = (pageNum - 1) * perPageNum;

    const pipeline = goodsBasePipeline(filter, sortStage, skip, perPageNum);
    const goods = await Good.aggregate(pipeline);
    const totalGoods = await Good.countDocuments(filter);

    res.status(200).json({
      page: pageNum,
      perPage: perPageNum,
      totalGoods,
      totalPages: Math.ceil(totalGoods / perPageNum),
      goods,
    });
  } catch (err) {
    next(err);
  }
};

export const getGoodById = async (req, res, next) => {
  try {
    const { goodId } = req.params;
    if (!Types.ObjectId.isValid(goodId)) return next(createHttpError(400, 'Invalid good id'));

    const pipeline = [
      { $match: { _id: new Types.ObjectId(goodId) } },
      ...feedbackPipeline('$_id'),
      ...categoryLookupPipeline,
      {
        $project: {
          name: 1,
          price: '$price.value',
          currency: '$price.currency',
          color: 1,
          size: 1,
          gender: 1,
          image: 1,
          category: 1,
          characteristics: 1,
          prevDescription: 1,
          feedbackCount: 1,
          averageRating: 1,
        },
      },
    ];

    //[] бо повертає масив
    const [good] = await Good.aggregate(pipeline);
    if (!good) return next(createHttpError(404, 'Good not found'));

    res.status(200).json(good);
  } catch (err) {
    next(err);
  }
};

export const getAllFilters = async (req, res, next) => {
  try {
    const allFilters = {};

    allFilters.categories = await Category.find({}, { name: 1, _id: 1 }).lean();

    allFilters.genders = GENDERS;
    allFilters.sizes = SIZES;
    allFilters.colors = COLORS;

    res.status(200).json(allFilters);
  } catch (error) {
    next(error);
  }
};