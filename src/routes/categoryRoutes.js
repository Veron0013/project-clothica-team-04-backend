import { Router } from 'express';
import { celebrate } from 'celebrate';
import { getAllCategories, getAllCategoriesFlat, getPopularCategories } from '../controllers/categoryController.js';
import { getAllCategoriesSchema } from '../validations/categoryValidation.js';

const router = Router();

router.get('/categories', celebrate(getAllCategoriesSchema), getAllCategories);
router.get('/categories/all', getAllCategoriesFlat);
router.get('/categories/popular', celebrate(getAllCategoriesSchema), getPopularCategories);

export default router;