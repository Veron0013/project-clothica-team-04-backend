import createHttpError from 'http-errors';
import { Good } from '../models/good.js';
import { TopRatedGood } from '../models/topRatedGood.js';
import { feedbackPipeline } from '../utils/goodsPapeline.js';

export const getTopRatedGoods_rw = async (req, res, next) => {
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
				.populate({
					path: 'productId',
					select: 'name price category image feedbacks',
					populate: { // populate feedbacks для отримання rate
						path: 'feedbacks',
						select: 'rate approved',
						match: { approved: false },
					},
				})
				.lean(),
		]);

		// обчислюємо rating та кількість фідбеків
		const enrichedItems = items.map(top => {
			const product = top.productId;
			const approvedFeedbacks = product.feedbacks || [];
			//const approvedFeedbacks = feedbacks.filter(f => f.approved);
			const feedbackCount = approvedFeedbacks.length;
			const averageRating =
				feedbackCount > 0
					? Math.round(
						approvedFeedbacks.reduce((sum, f) => sum + (f.rate || 0), 0) / feedbackCount * 2
					) / 2
					: 0;
			//- feedbacks e масиві даних
			// eslint-disable-next-line no-unused-vars
			const { feedbacks, category, ...productData } = product;

			return {
				...top,
				productId: product._id,
				product: {
					...productData
				},
				feedbackCount,
				averageRating
			};
		});

		res.json({
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
			items: enrichedItems,
		});
	} catch (err) {
		next(err);
	}
};

export const getTopRatedGoods = async (req, res, next) => {
	try {
		const page = Math.max(Number(req.query.page) || 1, 1);
		const limit = Math.min(Number(req.query.limit) || 6, 20);
		const skip = (page - 1) * limit;

		const pipeline = [
			{ $sort: { averageRating: -1 } },
			{ $skip: skip },
			{ $limit: limit },
			{
				$lookup: {
					from: 'goods',
					localField: 'productId',
					foreignField: '_id',
					as: 'product',
				},
			},
			{ $unwind: '$product' },
			...feedbackPipeline('$product._id'),
			{
				$project: {
					_id: '$product._id',
					name: '$product.name',
					price: '$product.price.value',
					currency: '$product.price.currency',
					image: '$product.image',
					feedbackCount: 1,
					averageRating: 1,
				},
			},
		];

		const items = await TopRatedGood.aggregate(pipeline);
		const total = await TopRatedGood.countDocuments();

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
