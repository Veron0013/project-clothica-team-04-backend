import { Router } from 'express';
import { celebrate } from 'celebrate';
import { getAllGoods, getGoodById } from '../controllers/goodsController.js';
import { getAllGoodsSchema, goodIdSchema } from '../validations/goodsValidation.js';

const router = Router();

router.get('/goods', celebrate(getAllGoodsSchema), getAllGoods);
router.get('/goods/:goodId', celebrate(goodIdSchema), getGoodById);

export default router;