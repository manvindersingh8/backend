import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiResponse } from "../helpers/ApiResponse.js";
import { ApiError } from "../helpers/ApiError.js";
import { Job } from "../models/Job.js";
import mongoose from "mongoose";
import {
  ROLES,
  JOB_TYPES,
  WORK_MODES,
  EXPERIENCE_LEVELS,
} from "../constants/constants.js";

const postJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    salary,
    location,
    company,
    jobType,
    skills,
    workMode,
    experienceLevel,
  } = req.body;

  // Required fields check (safe trim)
  if (
    [title, description, location, company].some(
      (f) => typeof f !== "string" || !f.trim(),
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Salary validation (safe optional check)
  if (
    !salary ||
    typeof salary.min !== "number" ||
    typeof salary.max !== "number" ||
    salary.min < 0 ||
    salary.max < salary.min
  ) {
    throw new ApiError(400, "Invalid salary range");
  }

  // Skills validation
  if (!Array.isArray(skills) || skills.length === 0) {
    throw new ApiError(400, "Skills are required");
  }

  // Enum validation
  const isValidEnum = (value, enumObj) =>
    Object.values(enumObj).includes(value);

  if (
    !isValidEnum(jobType, JOB_TYPES) ||
    !isValidEnum(workMode, WORK_MODES) ||
    !isValidEnum(experienceLevel, EXPERIENCE_LEVELS)
  ) {
    throw new ApiError(400, "Invalid job configuration");
  }

  const job = await Job.create({
    title,
    description,
    salary,
    location,
    company,
    jobType,
    skills,
    workMode,
    experienceLevel,
    postedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Job created successfully", job));
});
const getAllJobs = asyncHandler(async (req, res) => {
  const {
    search,
    page = 1,
    limit = 18,
    location,
    jobType,
    experienceLevel,
    workMode,
  } = req.query;

  const currentPage = Number(page);
  const pageLimit = Number(limit);

  // 🔥 Build dynamic query
  const query = {
    isDeleted: false,

    // Search (title)
    ...(search && {
      title: { $regex: search, $options: "i" },
    }),

    // Location (partial match)
    ...(location && {
      location: { $regex: location, $options: "i" },
    }),

    // Exact filters
    ...(jobType && { jobType }),
    ...(experienceLevel && { experienceLevel }),
    ...(workMode && { workMode }),
  };

  const skip = (currentPage - 1) * pageLimit;

  const jobs = await Job.find(query)
    .skip(skip)
    .limit(pageLimit)
    .sort({ createdAt: -1 });

  const totalJobs = await Job.countDocuments(query);
  const totalPage = Math.ceil(totalJobs / pageLimit);

  return res.status(200).json(
    new ApiResponse(200, "Jobs fetched successfully", {
      jobs,
      currentPage,
      totalJobs,
      totalPage,
    }),
  );
});

const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "invalid job id");
  }

  const job = await Job.findOne({ _id: id, isDeleted: false });

  if (!job) {
    throw new ApiError(404, "job does not exist");
  }
  return res.status(200).json(new ApiResponse(200, "job fetched", job));
});

const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "invalid job id");
  }
  const job = await Job.findById(id);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (job.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this job");
  }
  await Job.findByIdAndUpdate(id, { isDeleted: true });

  return res.status(200).json(new ApiResponse(200, "job deleted successfully"));
});

const myJobs = asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.RECRUITER) {
    throw new ApiError(403, "Only recruiters are allowed");
  }

  const jobs = await Job.find({
    postedBy: req.user._id,
    isDeleted: false,
  });

  if (jobs.length === 0) {
    return res.status(200).json(new ApiResponse(200, "none found", []));
  }

  return res.status(200).json(new ApiResponse(200, "Jobs fetched", jobs));
});

export { postJob, getAllJobs, getJobById, deleteJob, myJobs };
