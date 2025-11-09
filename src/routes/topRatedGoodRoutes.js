import { Router } from 'express';
import { celebrate } from 'celebrate';
import { getTopRatedGoods, createTopRatedGood } from '../controllers/topRatedGoodsController.js';
import { createTopRatedGoodSchema, paginationSchema } from '../validators/topRatedGoods.js';

const router = Router();

router.get('/top-rated', celebrate(paginationSchema), getTopRatedGoods);
router.post('/top-rated', celebrate(createTopRatedGoodSchema), createTopRatedGood);

export default router;