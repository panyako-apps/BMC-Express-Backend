import { Router } from "express";
import { addProject, deleteProject, getProjects, getProject, updateProject } from "../controllers/ProjectController.js";

const router = Router();

router.get('/', getProjects)
router.get('/:id', getProject)
router.post('/store', addProject)
router.delete('/:id', deleteProject)
router.put('/:id', updateProject)

export default router;