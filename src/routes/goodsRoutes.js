import { Router } from 'express';
import { celebrate } from 'celebrate';
import { getAllFilters, getAllGoods, getGoodById, getGoodsFromArray } from '../controllers/goodsController.js';
import { getAllGoodsSchema, goodIdSchema } from '../validations/goodsValidation.js';

const router = Router();

router.get('/goods', celebrate(getAllGoodsSchema), getAllGoods);
router.post('/goods/from-array', getGoodsFromArray);
router.get('/goods/all-filters', getAllFilters);
router.get('/goods/:goodId', celebrate(goodIdSchema), getGoodById);

export default router;