import express from "express";
import dotenv  from "dotenv"
dotenv.config()
import userRouter from "./src/routes/authRoutes.js";
import connectDb from "./src/config/connectDb.js";
connectDb();

const app = express();

app.use(express.json());

app.use("/api/users", userRouter);


app.get("/", (req, res) => res.send("Hello From Your API"));


app.use((err, req, res, next) => {
  console.error(err); // Log for debugging
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});



/**
 * Editing this line below will cause your code to break and not build successfully. Except you know what you're doing.
 */

// =============DO NOT EDIT HERE===========================================

app.listen(process.env.PORT || 5050, process.env.HOST || "0.0.0.0", () => {
  console.log(
    `Server running on http://${process.env.HOST || "0.0.0.0"}:${
      process.env.PORT || 5050
    }`
  );
});
// =============DO NOT EDIT HERE===========================================




// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1); // Exit immediately
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(reason);
  server.close(() => {
    process.exit(1); // Close server before exiting
  });
});

// Optional: handle SIGTERM (for Docker or process manager)
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});