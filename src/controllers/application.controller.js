import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiResponse } from "../helpers/ApiResponse.js";
import { ApiError } from "../helpers/ApiError.js";
import { Application } from "../models/Application.js";
import mongoose from "mongoose";
import { Job } from "../models/Job.js";
import { ROLES } from "../constants/constants.js";
import { cloudinary } from "../constants/cloudinary.js";
import fs from "fs";

const applyJob = asyncHandler(async (req, res) => {
  const { jobId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job id");
  }

  if (req.user.role !== ROLES.JOBSEEKER) {
    throw new ApiError(403, "Only job seekers are allowed");
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const alreadyApplied = await Application.findOne({
    jobId,
    applicantId: req.user._id,
  });

  if (alreadyApplied) {
    throw new ApiError(400, "You have already applied for the job");
  }

  const filePath = req.file?.path;
  if (!filePath) {
    throw new ApiError(400, "Resume file is required");
  }

  const uploadResult = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    folder: "resumes",
  });

  fs.unlinkSync(filePath);

  const resumeUrl = uploadResult.secure_url;

  const application = await Application.create({
    jobId,
    applicantId: req.user._id,
    resume: resumeUrl,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Application submitted successfully", application),
    );
});

const getAllApplicants = asyncHandler(async (req, res) => {
  const { jobId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "invalid job id");
  }
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "job not found");
  }

  if (job.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "not authroized");
  }

  const applicants = await Application.find({ jobId }).populate(
    "applicantId",
    "username email",
  );

  if (applicants.length === 0) {
    throw new ApiError(404, "no applicants found");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "applicant fetched sucessfully ", applicants));
});

const updateStatus = asyncHandler(async (req, res) => {
  const { jobId, applicantId, status } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(jobId) ||
    !mongoose.Types.ObjectId.isValid(applicantId)
  ) {
    throw new ApiError(400, "invalid job id");
  }
  if (!Object.values(APPLICATION_STATUS).includes(status)) {
    throw new ApiError(400, "Invalid status");
  }
  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, "job not found");
  }

  if (job.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authroized");
  }

  const application = await Application.findByIdAndUpdate(
    { jobId, applicantId },
    { status },
    { new: true },
  );
  if (!application) {
    throw new ApiError(404, "Application not found");
  }
  return res.status(200).json(new ApiResponse(200, "Status updated"));
});

const myApplications = asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.JOBSEEKER) {
    throw new ApiError(403, "Only job seekers are allowed");
  }

  const applications = await Application.find({
    applicantId: req.user._id,
  }).populate("jobId", "title company location salary");

  if (applications.length === 0) {
    throw new ApiError(404, "No applications found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Applications fetched", applications));
});



export { applyJob, getAllApplicants, updateStatus,myApplications };
