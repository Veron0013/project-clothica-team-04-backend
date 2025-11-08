import createHttpError from 'http-errors';
import { Category } from '../models/category.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 6;
    const skip = (page - 1) * perPage;

    const q = Category.find({}, { name: 1, image: 1 }).sort({ name: 1 });
    const [totalCategories, categories] = await Promise.all([
      q.clone().countDocuments(),
      q.skip(skip).limit(perPage),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCategories / perPage));

    if (totalCategories > 0 && page > totalPages) {
      return next(createHttpError(404, 'Page not found'));
    }

    res.status(200).json({ page, perPage, totalCategories, totalPages, categories });
  } catch (err) { next(err); }
};

export const getAllCategoriesFlat = async (_req, res, next) => {
  try {
    const categories = await Category.find({}, { name: 1, image: 1 }).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (err) { next(err); }
};