import Redis from "ioredis";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

const env = process.env.NODE_ENV || "development";
dotenv.config({
  path: `.env.${env}`,
});

console.log(process.env.REDIS_HOST);

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

// Event when connected
redisClient.on("connect", () => {
  console.log("Redis client connected");
});

// Event when ready to receive commands
redisClient.on("ready", () => {
  logger.info("Redis client connected", {
    host: process.env.REDIS_HOST,
    env: process.env.NODE_ENV,
  });
  console.log("Redis client ready");
});

// Event for errors
redisClient.on("error", (err) => {
  logger.error("Redis error", {
    message: err.message,
    stack: err.stack,
  });
  console.error("Redis error:", err);
});

// Event when disconnected
redisClient.on("end", () => {
  logger.info("Redis client disconnected", {
    host: process.env.REDIS_HOST,
    env: process.env.NODE_ENV,
  });
  console.log("Redis client disconnected");
});

export default redisClient;
