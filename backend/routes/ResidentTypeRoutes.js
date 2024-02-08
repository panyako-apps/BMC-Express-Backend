import { Router } from "express";
import { addResidentType, deleteResidentType, getResidentTypes, getResidentType, updateResidentType } from "../controllers/ResidentTypeController.js";


const router = Router();

router.get('/', getResidentTypes)
router.get('/:id', getResidentType)
router.post('/', addResidentType)
router.delete('/:id', deleteResidentType)
router.put('/:id', updateResidentType)

export default router;