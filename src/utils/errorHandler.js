// src/utils/errorHandlers.js
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorType.js";

/** Handle DB CastError (invalid IDs) */
export const handleCastErrorDB = (err) =>
  new AppError(
    `Invalid ${err.path}: ${err.value}`,
    400,
    ErrorCodes.INVALID_INPUT
  );

/** Handle duplicate key error (unique fields) */
export const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue).join(", ");
  return new AppError(
    `Duplicate field value: ${value}`,
    400,
    ErrorCodes.DUPLICATE_RESOURCE
  );
};

/** Handle Mongoose validation errors */
export const handleValidationErrorDB = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(messages.join(". "), 400, ErrorCodes.INVALID_INPUT);
};

/** Handle JWT errors */
export const handleJWTError = (err) => {
  if (err.name === "JsonWebTokenError")
    return new AppError("Invalid token", 401, ErrorCodes.INVALID_TOKEN);
  if (err.name === "TokenExpiredError")
    return new AppError("Token expired", 401, ErrorCodes.TOKEN_EXPIRED);
  return err;
};
