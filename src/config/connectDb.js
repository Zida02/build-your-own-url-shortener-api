import mongoose from "mongoose";
import dotenv from "dotenv";
import argon2 from "argon2";

dotenv.config();

console.log("MongoDB URI:", process.env.MONGODB_URI);

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
    });
    console.log(" MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // exit the process if DB connection fails
  }
};

// Optional: handle disconnects gracefully
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected!");
});

export default connectDb;
