import { ApiResponse } from "../helpers/ApiResponse.js";
import { ApiError } from "../helpers/ApiError.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { User } from "../models/User.js";
import { refreshAndAccessToken } from "../helpers/refreshAndAccessToken.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, password, role } = req.body;

  if (
    [username, fullname, email].some((feild) => !feild || feild.trim() === "")
  ) {
    throw new ApiError(400, "all feild are required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }
  const existinguser = await User.findOne({
    $or: [
      { username: username?.toLowerCase() },
      { email: email?.toLowerCase() },
    ],
  });
  if (existinguser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullname,
    password,
    email: email.toLowerCase(),
    role,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  return res
    .status(201)
    .json(new ApiResponse(201, "User created Successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "All feilds are requried");
  }
  if (!password) {
    throw new ApiError(400, "password is required");
  }
  const user = await User.findOne({
    $or: [
      { email: email?.toLowerCase() },
      { username: username?.toLowerCase() },
    ],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Unauthorized");
  }

  const { accessToken, refreshToken } = await refreshAndAccessToken(user._id);

  const options = {
    httpOnly: true,
    secure: false,
  };

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: createdUser,
        accessToken,
        refreshToken,
      }),
    );
});

const currentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, "Current user", req.user));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logged out sucessfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { email, username, fullname } = req.body;

  if (!email && !username && !fullname) {
    throw ApiError(400, "Atleaast one feild is required");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        ...(username && { username: username.toLowerCase() }),
        ...(email && { email: email.toLowerCase() }),
        ...(fullname && { fullname: fullname.toLowerCase() }),
      },
    },
    { new: true },
  ).select("-refreshToken -password");

  return res.status(200).json(new ApiResponse(200, "updated", updatedUser));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both the feilds are required");
  }
  const user = await User.findById(req.user._id);

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) {
    throw new ApiError(401, "old password is incorrect");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "new password must be different");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password has been changed"));
});

const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User deleted successfully"));
});

export {
  registerUser,
  loginUser,
  currentUser,
  logoutUser,
  updateProfile,
  changePassword,
  deleteUser,
};
