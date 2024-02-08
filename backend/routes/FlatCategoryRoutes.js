import { Router } from "express";
import { addFlatCategory, deleteFlatCategory, getFlatCategories, getFlatCategory, updateFlatCategory } from "../controllers/FlatCategoryController.js";


const router = Router();

router.get('/', getFlatCategories)
router.get('/:id', getFlatCategory)
router.post('/', addFlatCategory)
router.delete('/:id', deleteFlatCategory)
router.put('/:id', updateFlatCategory)

export default router;