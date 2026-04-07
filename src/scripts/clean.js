import mongoose from "mongoose";
import dotenv from "dotenv";
import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";
import { User } from "../models/User.js";

dotenv.config();

const cleanDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB connected");

    const appRes = await Application.deleteMany({});
    const jobRes = await Job.deleteMany({});
    const userRes = await User.deleteMany({});

    console.log(`🧹 Applications deleted: ${appRes.deletedCount}`);
    console.log(`🧹 Jobs deleted: ${jobRes.deletedCount}`);
    console.log(`🧹 Users deleted: ${userRes.deletedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

cleanDB();
