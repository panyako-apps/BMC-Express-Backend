import { Router } from "express";
import { addBill, deleteBill, getBills, getBill, updateBill } from "../controllers/BillController.js";

const router = Router();

router.get('/', getBills)
router.get('/:id', getBill)
router.post('/', addBill)
router.delete('/:id', deleteBill)
router.put('/:id', updateBill)

export default router;