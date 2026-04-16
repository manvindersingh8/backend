import mongoose, { Schema } from "mongoose";
import {
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  WORK_MODES,
} from "../constants/constants.js";
const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 64,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 500,
      lowercase: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    jobType: {
      type: String,
      enum: Object.values(JOB_TYPES),
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: Object.values(EXPERIENCE_LEVELS),
    },

    salary: {
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
      },
    },

    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    workMode: {
      type: String,
      enum: Object.values(WORK_MODES),
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Job = mongoose.model("Job", jobSchema);
