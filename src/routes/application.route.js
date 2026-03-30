import { Router } from "express";
import { applyJob, getAllApplicants, updateStatus, myApplications } from "../controllers/application.controller.js";
import { verifyJWT } from "../middlewares/verifyjwt.js";
import { authorizeRoles } from '../middlewares/auth.roles.js';
import { upload } from '../helpers/multer.js';
import { ROLES } from '../constants/constants.js';  // Fix: was missing
 
const router = Router()
 
router.post('/', verifyJWT, upload.single("resume"), applyJob)
router.get('/', verifyJWT, authorizeRoles, getAllApplicants)   
router.patch('/:id/status', verifyJWT, authorizeRoles, updateStatus)        
 
export default router