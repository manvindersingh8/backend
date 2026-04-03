import { asyncHandler } from "../helpers/asyncHandler.js";
import { User } from "../models/User.js";
import { ApiError } from "../helpers/ApiError.js";
import { ROLES } from "../constants/constants.js";

const authorizeRoles = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role !== ROLES.RECRUITER) {
    throw new ApiError(403, "Only recruiters allowed");
  }

  next();
});

export { authorizeRoles };
