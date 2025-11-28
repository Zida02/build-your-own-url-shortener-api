import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redisClient from "../helper/redis.js";
dotenv.config();

const authenticateJWT = async (req, res, next) => {
  try {
    // Check multiple sources for token
    let token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.headers["x-token"] || // custom header
        req.cookies?.token; // cookie (requires cookie-parser)

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized: token not provided" });
    }

    const isBlacklisted = await redisClient.get(token);
    if (isBlacklisted) {
      return res
        .status(403)
        .json({
          error: "Token has been revoked. Please login again.",
          status: false,
        });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    //  console.log("Decoded JWT payload:", decoded); // { userId, role, tenantId, tenantName }

    next();
  } catch (err) {
    //console.error("JWT verification error:", err);

    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please login again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res
        .status(403)
        .json({ error: "Invalid token. Access forbidden." });
    }
    if (err.name === "NotBeforeError") {
      return res.status(403).json({ error: "Token not active yet." });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

export default authenticateJWT;
