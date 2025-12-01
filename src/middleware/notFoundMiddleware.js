// src/middleware/notFoundMiddleware.js
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorType.js"; // Make sure file name matches exactly

export default (req, res, next) => {
  next(
    new AppError(
      `Cannot find ${req.originalUrl} on  ${req.method}  Method`,
      404,
      ErrorCodes.INVALID_INPUT
    )
  );
};
