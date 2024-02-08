import { Router } from "express";
import { addFlat, deleteFlat, getFlats, getFlat, updateFlat } from "../controllers/FlatController.js";

const router = Router();

router.get('/', getFlats)
router.get('/:id', getFlat)
router.post('/', addFlat)
router.delete('/:id', deleteFlat)
router.put('/:id', updateFlat)

export default router;