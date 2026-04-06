import mongoose, { Schema } from "mongoose";

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
    salary: {
      type: Number,
      required: true,
      min: 1,
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
