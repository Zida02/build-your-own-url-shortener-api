import mongoose from "mongoose";
import argon2 from "argon2";




import dotenv from "dotenv";
import logger from "../utils/logger.js";

const env = process.env.NODE_ENV || "development";
dotenv.config({
  path: `.env.${env}`,
});

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
    });

    console.log(" MongoDB connected successfully");
     logger.info(
        `🚀 mongodb is connected successfully in ${
          process.env.NODE_ENV || "development"
        } mode`
      );
  } catch (error) {
    logger.error("MongoDB connection failed", {
      message: error.message,
      stack: error.stack,
    });
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // exit the process if DB connection fails
  }
};

// Optional: handle disconnects gracefully
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected!");
});

export default connectDb;
