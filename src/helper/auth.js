

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const checkTokenStatus = (req) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");

  // Get token from Bearer, x-token header, or cookie
  let token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : req.headers["x-token"] || req.cookies?.token;

  // Token missing
  if (!token) {
    return {
      status: "missing",
      valid: false,
      expired: false,
      message: "Token not provided",
      user: null,
    };
  }

  try {
    const decoded = jwt.verify(token, secret);

    return {
      status: "valid",
      valid: true,
      expired: false,
      message: "Token is valid",
      user: decoded,
    };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return {
        status: "expired",
        valid: false,
        expired: true,
        message: "Token expired",
        user: null,
      };
    }

    return {
      status: "invalid",
      valid: false,
      expired: false,
      message: "Invalid token",
      user: null,
    };
  }
};
