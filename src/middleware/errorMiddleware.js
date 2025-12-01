import { ErrorCodes } from "../utils/errorType.js";
import logger from "../utils/logger.js";

import {
  handleCastErrorDB,
  handleJWTError,
  handleValidationErrorDB,
  handleDuplicateFieldsDB,
} from "../utils/errorHandler.js";

/** Send detailed error in dev */
const sendErrorDev = (err, req, res) => {
  // logger.error("DEV ERROR", {
  //   path: req.originalUrl,
  //   method: req.method,
  //   message: err.message,
  //   stack: err.stack,
  // });

  logger.error("DEV ERROR", {
    correlationId: req.correlationId,
    path: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: err.stack,
    code: err.code,
    statusCode: err.statusCode,
    user: req.user?.email || null,
  });
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    code: err.code || ErrorCodes.INTERNAL_ERROR,
    message: err.message || "An error occurred",
    stack: err.stack,
    error: err,
    user: req.user?.email || null,
  });
};

/** Send safe error in prod */
const sendErrorProd = (err, req, res) => {
  logger.error("PROD ERROR", {
    correlationId: req.correlationId,
    path: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    code: err.code,
    user: req.user?.userId || null,
  });
  const isOperational =
    err.isOperational !== undefined ? err.isOperational : false;

  if (!isOperational) console.error("UNEXPECTED ERROR 💥", err);

  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    code: err.code || ErrorCodes.INTERNAL_ERROR,
    message: isOperational ? err.message : "Something went very wrong!",
  });
};

/** Global error middleware */
export default (err, req, res, next) => {
  // Ensure err exists
  err = err || {};

  // Default properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.code = err.code || ErrorCodes.INTERNAL_ERROR;
  err.isOperational =
    err.isOperational !== undefined ? err.isOperational : false;

  // Handle known errors
  if (err.name === "CastError") err = handleCastErrorDB(err);
  else if (err.code === 11000) err = handleDuplicateFieldsDB(err);
  else if (err.name === "ValidationError") err = handleValidationErrorDB(err);
  err = handleJWTError(err);

  // Send error based on environment
  if (process.env.NODE_ENV === "development") sendErrorDev(err, req, res);
  else sendErrorProd(err, req, res);
};
