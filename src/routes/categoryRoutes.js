import { Router } from 'express';
import { celebrate } from 'celebrate';
import { getAllCategories, getAllCategoriesFlat } from '../controllers/categoryController.js';
import { getAllCategoriesSchema } from '../validations/categoryValidation.js';

const router = Router();

router.get('/categories', celebrate(getAllCategoriesSchema), getAllCategories);
router.get('/categories/all', getAllCategoriesFlat);

export default router;