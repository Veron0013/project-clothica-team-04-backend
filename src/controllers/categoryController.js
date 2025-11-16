import createHttpError from 'http-errors';
import { Category } from '../models/category.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const totalCategories = await Category.countDocuments();
    const totalPages = Math.max(1, Math.ceil(totalCategories / limit));
    if (totalCategories > 0 && page > totalPages) {
      throw createHttpError(404, 'Page not found');
    }

    const categories = await Category.aggregate([
      { $sort: { name: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          image: { $ifNull: ['$image', '$img_url'] },
        },
      },
    ]);

    res.status(200).json({ page, limit, totalCategories, totalPages, categories });
  } catch (err) { next(err); }
};

export const getAllCategoriesFlat = async (_req, res, next) => {
  try {
    const categories = await Category.aggregate([
      { $sort: { name: 1 } },
      {
        $project: {
          name: 1,
          image: { $ifNull: ['$image', '$img_url'] },
        },
      },
    ]);
    res.status(200).json(categories);
  } catch (err) { next(err); }
};