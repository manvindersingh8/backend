import { Router } from "express";
import {
  currentUser,
  updateProfile,
  changePassword,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/verifyjwt.js";

const router = Router();

router
  .route("/me")
  .get(verifyJWT, currentUser)
  .patch(verifyJWT, updateProfile)
  .delete(verifyJWT, deleteUser);

router.patch("/change-password", verifyJWT, changePassword);

export default router;
