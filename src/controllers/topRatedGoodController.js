import createHttpError from 'http-errors';
import { TopRatedGood } from '../models/topRatedGoods.js';
import { Good } from '../models/good.js';

export const getTopRatedGoods = async (req, res, next) => {
	try {
		const page = Math.max(Number(req.query.page) || 1, 1);
		const limit = Math.min(Number(req.query.limit) || 6, 6);
		const skip = (page - 1) * limit;

		const [total, items] = await Promise.all([
			TopRatedGood.countDocuments(),
			TopRatedGood.find()
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate('productId', 'name price category'),
		]);

		res.json({
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
			items,
		});
	} catch (err) {
		next(err);
	}
};

export const createTopRatedGood = async (req, res, next) => {
	try {
		const { productId } = req.body;

		const good = await Good.findById(productId);
		if (!good) {
			throw createHttpError(404, 'Товар не знайдено');
		}

		const exists = await TopRatedGood.findOne({ productId });
		if (exists) {
			throw createHttpError(409, 'Товар вже у списку найкращих');
		}

		const doc = await TopRatedGood.create({ productId });

		res.status(201).json(doc);
	} catch (err) {
		next(err);
	}
};
