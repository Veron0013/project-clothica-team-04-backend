import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import { Good } from '../models/good.js';
import '../models/feedback.js';
import '../models/category.js';
import { categoryLookupPipeline, feedbackPipeline, goodsBasePipeline } from '../utils/goodsPapeline.js';
import { Types } from 'mongoose';
import { Category } from '../models/category.js';
import { GENDERS, SIZES, COLORS } from '../models/good.js';

const toList = (val) => {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export const getAllGoods = async (req, res, next) => {
  try {
    const {
      category,
      sizes,
      fromPrice,
      toPrice,
      gender,
      page,
      limit,
      sort,
      search,
    } = req.query;

    const filter = {};

    // --- CATEGORY ---
    if (category && isValidObjectId(category)) {
      filter.category = new Types.ObjectId(category);
    }

    // --- PRICE ---
    if (fromPrice && toPrice) {
      const min = Number(fromPrice);
      const max = Number(toPrice);
      if (min <= max) {
        filter["price.value"] = { $gte: min, $lte: max };
      }
    }

    // --- GENDER ---
    if (gender) {
      const list = toList(gender).map(g => g.toLowerCase());
      filter.gender = list.length > 1 ? { $in: list } : list[0];
    }

    // --- SEARCH ---
    if (search) {
      if (search.length > 5) {
        filter.$text = { $search: search };
      } else {
        filter.name = { $regex: `^${search}`, $options: "i" };
      }
    }

    // -------- SIZE (основна логіка) --------
    const selectedSizes = toList(sizes ?? []);

    if (selectedSizes.length === 1) {
      // Строгий фільтр: може бути 0
      filter.size = { $in: selectedSizes };
    }

    if (selectedSizes.length > 1) {
      // Отримуємо дійсно доступні розміри (після category/price/gender/search)
      const availableSizes = await Good.distinct("size", filter);

      const validSizes = selectedSizes.filter(s =>
        availableSizes.includes(s)
      );

      if (validSizes.length > 0) {
        filter.size = { $in: validSizes };
      }
      // Якщо validSizes.length === 0 → НЕ додаємо size у фільтр
      // Тобто size не впливає
    }

    // --- SORT ---
    const sortMap = {
      price_asc: { "price.value": 1 },
      price_desc: { "price.value": -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };
    const sortStage = sortMap[sort] || { createdAt: -1 };

    // --- PAGINATION ---
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(8, Number(limit) || 12);
    const skip = (pageNum - 1) * limitNum;

    // --- PIPELINE ---
    const pipeline = goodsBasePipeline(filter, sortStage, skip, limitNum);

    const goods = await Good.aggregate(pipeline);
    const totalGoods = await Good.countDocuments(filter);

    res.status(200).json({
      page: pageNum,
      limit: limitNum,
      totalGoods,
      totalPages: Math.ceil(totalGoods / limitNum),
      goods,
    });

  } catch (err) {
    next(err);
  }
};

export const getGoodById = async (req, res, next) => {
  try {
    const { goodId } = req.params;
    if (!Types.ObjectId.isValid(goodId)) throw createHttpError(400, 'Invalid good id');

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
          description: 1,
          characteristics: 1,
          prevDescription: 1,
          feedbackCount: 1,
          averageRating: 1,
        },
      },
    ];

    //[] бо повертає масив
    const [good] = await Good.aggregate(pipeline);
    if (!good) throw createHttpError(404, 'Good not found');

    res.status(200).json(good);
  } catch (err) {
    next(err);
  }
};

export const getGoodsFromArray = async (req, res, next) => {
  try {
    const { goodIds } = req.body; // очікуємо масив id у тілі запиту
    if (!Array.isArray(goodIds) || goodIds.length === 0) {
      throw createHttpError(400, 'Не надано масиву ids provided');
    }

    // Перевірка валідності ObjectId
    const invalidIds = goodIds.filter(id => !Types.ObjectId.isValid(id));
    if (invalidIds.length) {
      throw createHttpError(400, `Не правильний ID: ${invalidIds.join(', ')}`);
    }

    const objectIds = goodIds.map(id => new Types.ObjectId(`${id}`));

    const pipeline = [
      { $match: { _id: { $in: objectIds } } },
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

    const goods = await Good.aggregate(pipeline);

    if (!goods.length) throw createHttpError(404, 'Товарів не знайдено');

    res.status(200).json(goods);
  } catch (err) {
    next(err);
  }
};

async function getPriceRange() {
  const result = await Good.aggregate([
    {
      $group: {
        _id: null,
        fromPrice: { $min: '$price.value' },
        toPrice: { $max: '$price.value' },
      },
    },
    {
      $project: {
        _id: 0,
        fromPrice: 1,
        toPrice: 1,
      },
    },
  ]);

  return result[0] || { fromPrice: 1, toPrice: 10000 };
}


export const getAllFilters = async (req, res, next) => {
  try {
    const allFilters = {};
    const categories = await Category.find({}, { name: 1, _id: 1 }).lean();
    const prices = await getPriceRange();

    allFilters.categories = categories;
    allFilters.genders = GENDERS;
    allFilters.sizes = SIZES;
    allFilters.colors = COLORS;
    allFilters.fromPrice = prices.fromPrice;
    allFilters.toPrice = prices.toPrice;

    res.status(200).json(allFilters);
  } catch (error) {
    next(error);
  }
};