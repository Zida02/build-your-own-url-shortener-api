// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import redisClient from "../helper/redis.js";
// dotenv.config();

// const authenticateJWT = async (req, res, next) => {
//   try {
//     // Check multiple sources for token
//     let token = req.headers.authorization?.startsWith("Bearer ")
//       ? req.headers.authorization.split(" ")[1]
//       : req.headers["x-token"] || // custom header
//         req.cookies?.token; // cookie (requires cookie-parser)

//     if (!token) {
//       return res
//         .status(401)
//         .json({ error: "Unauthorized: token not provided" });
//     }

//     const isBlacklisted = await redisClient.get(token);
//     if (isBlacklisted) {
//       return res
//         .status(403)
//         .json({
//           error: "Token has been revoked. Please login again.",
//           status: false,
//         });
//     }

//     const secret = process.env.JWT_SECRET;
//     if (!secret) {
//       console.error("JWT_SECRET not configured");
//       return res.status(500).json({ error: "Server configuration error" });
//     }

//     const decoded = jwt.verify(token, secret);
//     req.user = decoded;
//     //  console.log("Decoded JWT payload:", decoded); // { userId, role, tenantId, tenantName }

//     next();
//   } catch (err) {
//     //console.error("JWT verification error:", err);

//     if (err.name === "TokenExpiredError") {
//       return res
//         .status(401)
//         .json({ error: "Token expired. Please login again." });
//     }
//     if (err.name === "JsonWebTokenError") {
//       return res
//         .status(403)
//         .json({ error: "Invalid token. Access forbidden." });
//     }
//     if (err.name === "NotBeforeError") {
//       return res.status(403).json({ error: "Token not active yet." });
//     }

//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export default authenticateJWT;



import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redisClient from "../helper/redis.js";
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorType.js";

dotenv.config();

const authenticateJWT = async (req, res, next) => {
  try {
    // Extract token (header → x-token → cookie)
    const token =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers["x-token"] || req.cookies?.token;

    if (!token) {
      return next(
        new AppError(
          "Unauthorized: token not provided",
          401,
          ErrorCodes.AUTH_REQUIRED
        )
      );
    }

    // Check blacklist
    const blacklisted = await redisClient.get(token);
    if (blacklisted) {
      return next(
        new AppError(
          "Token has been revoked. Please login again.",
          403,
          ErrorCodes.TOKEN_REVOKED
        )
      );
    }

    // Ensure secret exists
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(
        new AppError(
          "Server configuration error: missing JWT_SECRET",
          500,
          ErrorCodes.SERVER_CONFIG
        )
      );
    }

    // Verify token
    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    next();
  } catch (err) {
    // JWT-specific errors → map to custom errors
    if (err.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Token expired. Please login again.",
          401,
          ErrorCodes.TOKEN_EXPIRED
        )
      );
    }

    if (err.name === "JsonWebTokenError") {
      return next(
        new AppError(
          "Invalid token. Access forbidden.",
          403,
          ErrorCodes.INVALID_TOKEN
        )
      );
    }

    if (err.name === "NotBeforeError") {
      return next(
        new AppError(
          "Token not active yet.",
          403,
          ErrorCodes.TOKEN_NOT_ACTIVE
        )
      );
    }

    // Unknown error => internal error
    next(
      new AppError(
        "Internal authentication error",
        500,
        ErrorCodes.INTERNAL_ERROR
      )
    );
  }
};

export default authenticateJWT;
