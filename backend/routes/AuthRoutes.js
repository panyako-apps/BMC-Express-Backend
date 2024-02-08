import { Router } from "express";
import { login, loginBuildingManager, loginCompany, loginTenant, logout, logoutBuildingManager, logoutCompany, logoutTenant, register, registerBuildingManager, registerCompany, registerTenant } from "../controllers/AuthController.js";

const router = Router()


router.post('/register', register)
router.post('/company/register', registerCompany)
router.post('/building-manager/register', registerBuildingManager)
router.post('/tenant/register', registerTenant)

router.post('/login', login)
router.post('/company/login', loginCompany)
router.post('/building-manager/login', loginBuildingManager)
router.post('/tenant/login', loginTenant)

router.post('/logout', logout)
router.post('/company/logout', logoutCompany)
router.post('/building-manager/logout', logoutBuildingManager)
router.post('/tenant/logout', logoutTenant)



export default router