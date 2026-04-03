import { Router } from "express";
import {
  getAllJobs,
  postJob,
  getJobById,
  deleteJob,
  myJobs,
} from "../controllers/job.controller.js";
import { authorizeRoles } from "../middlewares/auth.roles.js";
import { verifyJWT } from "../middlewares/verifyjwt.js";

const router = Router();

router.route("/").get(getAllJobs).post(verifyJWT, authorizeRoles, postJob); // Recruiter: post a job

router.get("/my", verifyJWT, authorizeRoles, myJobs); // Recruiter: view own jobs

router
  .route("/:id")
  .get(getJobById)
  .delete(verifyJWT, authorizeRoles, deleteJob); // Recruiter: delete a job

export default router;
