import { Router } from "express";
import { addCompany, deleteCompany, getCompanies, getCompany, updateCompany } from "../controllers/CompanyController.js";

const router = Router();

router.get('/', getCompanies)
router.get('/:id', getCompany)
router.post('/', addCompany)
router.delete('/:id', deleteCompany)
router.put('/:id', updateCompany)

export default router;