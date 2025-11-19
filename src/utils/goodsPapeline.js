
const FEEDBACK_APPROVED = false;

/**
 * Підрахунок рейтингу та кількості відгуків
 */
export const feedbackPipeline = (productIdField = '$_id') => [
	{
		$lookup: {
			from: 'feedbacks',
			let: { productId: productIdField },
			pipeline: [
				{
					$match: {
						$expr: { $eq: ['$productId', '$$productId'] },
						approved: FEEDBACK_APPROVED,
					},
				},
				{ $project: { rate: 1 } },
			],
			as: 'approvedFeedbacks',
		},
	},
	{
		$addFields: {
			feedbackCount: { $size: '$approvedFeedbacks' },
			averageRating: {
				$cond: [
					{ $gt: [{ $size: '$approvedFeedbacks' }, 0] },
					{ $divide: [{ $sum: '$approvedFeedbacks.rate' }, { $size: '$approvedFeedbacks' }] },
					0,
				],
			},
		},
	},
	{
		$addFields: {
			averageRating: { $divide: [{ $round: [{ $multiply: ['$averageRating', 2] }, 0] }, 2] },
		},
	},
	{ $project: { approvedFeedbacks: 0 } },
];

//* Підтягування категорії (назва, без усього зайвого)

export const categoryLookupPipeline = [
	{
		$lookup: {
			from: 'categories',
			localField: 'category',
			foreignField: '_id',
			as: 'category',
		},
	},
	{ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
	{
		$addFields: {
			category: {
				name: '$category.name',
				image: { $ifNull: ['$category.image', '$category.img_url'] },
			},
		},
	},
];

// * Готовий pipeline для агрегування товарів

export const goodsBasePipeline = (filter = {}, sortStage, skip, limit) => [
	{ $match: filter },

	// Lookup-и не змінюють кількість документів
	...feedbackPipeline("$_id"),
	...categoryLookupPipeline,

	{ $sort: sortStage },
	{ $skip: skip },
	{ $limit: limit },

	{
		$project: {
			name: 1,
			price: "$price.value",
			currency: "$price.currency",
			color: 1,
			size: 1,
			gender: 1,
			image: 1,
			category: 1,
			feedbackCount: 1,
			averageRating: 1,
		},
	},
];
