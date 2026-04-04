import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiResponse } from "../helpers/ApiResponse.js";
import { ApiError } from "../helpers/ApiError.js";
import { Job } from "../models/Job.js";
import mongoose from "mongoose";
import { ROLES } from "../constants/constants.js";
import { User } from "../models/User.js";

const postJob = asyncHandler(async (req, res) => {
  const { title, description, salary, location, company, postedBy } = req.body;

  if (
    [title, description, location, company].some(
      (feild) => !feild || feild.trim() === "",
    )
  ) {
    throw new ApiError(400, "All feilds are required");
  }
  if (!salary) {
    throw new ApiError(400, "Salary is required");
  }
  if (salary <= 0) {
    throw new ApiError(400, "Salary cannot be 0 or below 0");
  }
  const job = await Job.create({
    title: title.toLowerCase(),
    description: description.toLowerCase(),
    salary,
    location,
    company,
    postedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Job created successfully", job));
});

const getAllJobs = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const currentPage = Number(page);
  const pageLimit = Number(limit);

  const query = search
    ? {
        title: {
          $regex: search,
          $options: "i",
        },
      }
    : {};
  const skip = (currentPage - 1) * pageLimit;

  const jobs = await Job.find(query).skip(skip).limit(pageLimit);
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

  const job = await Job.findById(id);

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
  await job.deleteOne();

  return res.status(200).json(new ApiResponse(200, "job deleted successfully"));
});

const myJobs = asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.RECRUITER) {
    throw new ApiError(403, "Only recruiters are allowed");
  }

  const jobs = await Job.find({
    postedBy: req.user._id,
  });

  if (jobs.length === 0) {
    return res.status(200).json(new ApiResponse(200, "none found", []));
  }

  return res.status(200).json(new ApiResponse(200, "Jobs fetched", jobs));
});

export { postJob, getAllJobs, getJobById, deleteJob, myJobs };
