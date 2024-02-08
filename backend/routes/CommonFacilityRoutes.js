import { Router } from "express";
import { addCommonFacility, deleteCommonFacility, getCommonFacilities, getCommonFacility, updateCommonFacility } from "../controllers/CommonFacilityController.js";

const router = Router();

router.get('/', getCommonFacilities)
router.get('/:id', getCommonFacility)
router.post('/store', addCommonFacility)
router.delete('/:id', deleteCommonFacility)
router.put('/:id', updateCommonFacility)

export default router;