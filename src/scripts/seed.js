import mongoose from "mongoose";
import dotenv from "dotenv";
import { Job } from "../models/Job.js";
import {
  JOB_TYPES,
  WORK_MODES,
  EXPERIENCE_LEVELS,
} from "../constants/constants.js";

dotenv.config();

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    const titles = [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "DevOps Engineer",
      "Software Engineer",
      "React Developer",
      "Node.js Developer",
    ];

    const companies = [
      "Google",
      "Amazon",
      "Microsoft",
      "Flipkart",
      "Zomato",
      "Infosys",
      "TCS",
    ];

    const locations = ["Remote", "Delhi", "Bangalore", "Hyderabad", "Mumbai"];

    const skillsPool = [
      "React",
      "Node.js",
      "MongoDB",
      "Express",
      "JavaScript",
      "TypeScript",
      "AWS",
      "Docker",
      "Redis",
      "GraphQL",
    ];

    const descriptions = [
      "Develop scalable backend APIs and services using Node.js, ensuring performance, reliability, and security in production environments.",
      "Build modern and responsive user interfaces with React while optimizing performance and maintaining clean, reusable components.",
      "Collaborate with cross-functional teams to design, develop, and deploy high-quality software solutions for real-world applications.",
      "Work on full-stack development including frontend, backend, and database integration with a focus on scalability and maintainability.",
    ];

    const jobs = [];

    for (let i = 0; i < 200; i++) {
      const minSalary = Math.floor(Math.random() * 5) * 5 + 20; // 20–40
      const maxSalary = minSalary + Math.floor(Math.random() * 20) + 10;

      const randomSkills = skillsPool
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      jobs.push({
        title: titles[Math.floor(Math.random() * titles.length)],
        description:
          descriptions[Math.floor(Math.random() * descriptions.length)],

        salary: {
          min: minSalary,
          max: maxSalary,
        },

        location: locations[Math.floor(Math.random() * locations.length)],
        company: companies[Math.floor(Math.random() * companies.length)],

        experience:
          Object.values(EXPERIENCE_LEVELS)[
            Math.floor(Math.random() * Object.values(EXPERIENCE_LEVELS).length)
          ],

        jobType:
          Object.values(JOB_TYPES)[
            Math.floor(Math.random() * Object.values(JOB_TYPES).length)
          ],

        workMode:
          Object.values(WORK_MODES)[
            Math.floor(Math.random() * Object.values(WORK_MODES).length)
          ],

        skills: randomSkills,

        postedBy: "69e0be3c0c6b4d7a85a593fb", // replace with real user ID
      });
    }

    await Job.deleteMany(); // optional

    await Job.insertMany(jobs);

    console.log("✅ Jobs seeded successfully:", jobs.length);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedJobs();
