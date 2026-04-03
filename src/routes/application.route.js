import { Router } from "express";
import {
  applyJob,
  getAllApplicants,
  updateStatus,
  myApplications,
  hasApplied,
} from "../controllers/application.controller.js";
import { verifyJWT } from "../middlewares/verifyjwt.js";
import { authorizeRoles } from "../middlewares/auth.roles.js";
import { upload } from "../helpers/multer.js";

const router = Router();

router.get("/my", verifyJWT, myApplications);
router.post("/:id", verifyJWT, upload.single("resume"), applyJob);
router.get("/", verifyJWT, authorizeRoles, getAllApplicants);
router.get("/:id", verifyJWT, hasApplied);
router.patch("/:id/status", verifyJWT, authorizeRoles, updateStatus);

export default router;
