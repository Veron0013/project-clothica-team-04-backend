import { Router } from 'express';
import { celebrate } from 'celebrate';
import { createTopRatedGood, getTopRatedGoods } from '../controllers/topRatedGoodController.js';
import { createTopRatedGoodSchema, paginationSchema } from '../validations/topRatedGoodValidator.js';

const router = Router();

router.get('/top-rated', celebrate(paginationSchema), getTopRatedGoods);
router.post('/top-rated', celebrate(createTopRatedGoodSchema), createTopRatedGood);

export default router;