import { Router } from "express";
import { addBuildingManager, deleteBuildingManager, getBuildingManagers, getBuildingManager, updateBuildingManager } from "../controllers/BuildingManagerController.js";

const router = Router();

router.get('/', getBuildingManagers)
router.get('/:id', getBuildingManager)
router.post('/', addBuildingManager)
router.delete('/:id', deleteBuildingManager)
router.put('/:id', updateBuildingManager)
export default router;