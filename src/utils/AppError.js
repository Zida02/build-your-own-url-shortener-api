// src/utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode, code, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.code = code; // Custom error code
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
