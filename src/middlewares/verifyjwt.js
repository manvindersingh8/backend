import jwt from 'jsonwebtoken';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { ApiError } from '../helpers/ApiError.js';
import { User } from '../models/User.js';

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new ApiError(401, 'Unauthorized access');
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired access token');
  }

  const user = await User.findById(decodedToken._id).select('-password -refreshToken');
  if (!user) {
    throw new ApiError(401, 'Invalid access token');
  }

  req.user = user;
  next();
});

export { verifyJWT };