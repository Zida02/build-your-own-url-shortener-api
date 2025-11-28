import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import userRouter from "./src/routes/authRoutes.js";
import urlRouter from "./src/routes/urlRoutes.js";
import connectDb from "./src/config/connectDb.js";
import notificationRouter from "./src/routes/notificationRoutes.js";
import cors from "cors";
import { advancedSecurityMiddleware } from "./src/middleware/secure.js";
import { swaggerUiServe, swaggerUiSetup } from "./src/swagger/swagger.js";

connectDb();

const app = express();
app.use(cookieParser());

advancedSecurityMiddleware(app);

app.use("/api-docs", swaggerUiServe, swaggerUiSetup);

app.use("/api/auth", userRouter);
app.use("/api/url", urlRouter);
app.use("/api/notifications", notificationRouter);

app.get("/", (req, res) => res.send("Hello From Your API"));

app.use((req, res, next) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  res.status(404).json({
    message: "Route not found",
    path: fullUrl,
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
