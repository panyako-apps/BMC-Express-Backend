import { Router } from "express";
import { addBuilding, deleteBuilding, getBuildings, getBuilding, updateBuilding } from "../controllers/BuildingController.js";

const router = Router();

router.get('/', getBuildings)
router.get('/:id', getBuilding)
router.post('/store', addBuilding)
router.delete('/:id', deleteBuilding)
router.put('/:id', updateBuilding)

export default router;