import { Router } from "express";
import { addIssue, deleteIssue, getIssues, getIssue, updateIssue } from "../controllers/IssueController.js";

const router = Router();

router.get('/', getIssues)
router.get('/:id', getIssue)
router.post('/', addIssue)
router.delete('/:id', deleteIssue)
router.put('/:id', updateIssue)

export default router;