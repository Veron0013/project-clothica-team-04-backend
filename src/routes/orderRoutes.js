import { Router } from "express";
import { celebrate } from "celebrate";
import {
    createOrderSchema,
    updateOrderStatusSchema,
} from '../validations/orderValidation.js';
import {
    createOrder,
    createGuestOrder,
    getUserOrders,
    updateOrderStatus
} from "../controllers/orderController.js";

import { authenticate, checkAdmin } from "../middleware/authenticate.js";

const router = Router();

router.post('/orders', authenticate, celebrate(createOrderSchema), createOrder);
router.post('/orders/guest', celebrate(createOrderSchema), createGuestOrder);
router.get('/orders', authenticate, getUserOrders);
router.get('/orders/all', authenticate, checkAdmin, getUserOrders);
router.patch('/orders/:orderId/status', authenticate, checkAdmin, celebrate(updateOrderStatusSchema), updateOrderStatus);

export default router;

