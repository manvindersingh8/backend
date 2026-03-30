import mongoose, { Schema } from "mongoose";
import { APPLICATION_STATUS } from "../constants/constants.js";

const applicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
      required: true,
    },
  },
  { timestamps: true }
);


applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationSchema);