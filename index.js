// ===============================================
// HANDLE UNCAUGHT EXCEPTIONS (must be at the top)
// ===============================================
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION", {
    message: err.message,
    stack: err.stack,
  });

  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err);

  process.exit(1); // Crash immediately
});

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
const env = process.env.NODE_ENV || "development";
dotenv.config({
  path: `.env.${env}`,
});
import userRouter from "./src/routes/authRoutes.js";
import urlRouter from "./src/routes/urlRoutes.js";
import connectDb from "./src/config/connectDb.js";
import notificationRouter from "./src/routes/notificationRoutes.js";
import cors from "cors";
import { advancedSecurityMiddleware } from "./src/middleware/secure.js";
import { swaggerUiServe, swaggerUiSetup } from "./src/swagger/swagger.js";
import errorMiddleware from "./src/middleware/errorMiddleware.js";
import logger from "./src/utils/logger.js";
import notFoundMiddleware from "./src/middleware/notFoundMiddleware.js";
import { redirectUrl} from "./src/controller/urlController.js";

connectDb();

const app = express();
app.use(cookieParser());

advancedSecurityMiddleware(app);

app.get("/:shortCode", redirectUrl);
app.use("/api/auth", userRouter);
app.use("/api/url", urlRouter);
app.use("/api/notifications", notificationRouter);

app.use("/api-docs", swaggerUiServe, swaggerUiSetup);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Welcome to URL  SHORTNERE API",
    enviroment: `You are on  ${process.env.NODE_ENV}  enviroment`,
  });
});

// app.use((req, res, next) => {
//   const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
//   res.status(404).json({
//     message: "Route not found",
//     path: fullUrl,
//   });
// });

app.use(notFoundMiddleware);

app.use(errorMiddleware);
/**
 * Editing this line below will cause your code to break and not build successfully. Except you know what you're doing.
 */

// =============DO NOT EDIT HERE===========================================

// const server = app.listen(
//   process.env.PORT || 5050,
//   process.env.HOST || "0.0.0.0",
//   () => {
//     console.log(
//       `Server running on http://${process.env.HOST || "0.0.0.0"}:${
//         process.env.PORT || 5050
//       }`
//     );
//     logger.info(
//       `🚀 Server started successfully on port ${process.env.PORT || 5050} in ${
//         process.env.NODE_ENV || "development"
//       } mode`
//     );
//   }
// );
// // =============DO NOT EDIT HERE===========================================

// Handle uncaught exceptions
process.on("unhandledRejection", (reason) => {
  logger.error("UNHANDLED REJECTION", {
    message: reason?.message,
    stack: reason?.stack,
  });

  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(reason);

  server.close(() => {
    process.exit(1);
  });
});

// ===============================================
// HANDLE SIGTERM (Docker / PM2)
// ===============================================
process.on("SIGTERM", () => {
  logger.warn("SIGTERM RECEIVED: Closing server gracefully...");

  server.close(() => {
    console.log("Process terminated.");
  });
});

const server = app.listen(process.env.PORT || 5050, () => {
  console.log(`Server running on port ${process.env.PORT || 5050}`);
  logger.info(
    `🚀 Server started successfully on port ${process.env.PORT || 5050} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});
