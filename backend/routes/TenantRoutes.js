import { Router } from "express";
import { addTenant, deleteTenant, getTenants, getTenant, updateTenant } from "../controllers/TenantController.js";

const router = Router();

router.get('/', getTenants)
router.get('/:id', getTenant)
router.post('/', addTenant)
router.delete('/:id', deleteTenant)
router.put('/:id', updateTenant)

export default router;

