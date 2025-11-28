import Redis from "ioredis";

const redisClient = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

// Event when connected
redisClient.on("connect", () => {
  console.log("Redis client connected");
});

// Event when ready to receive commands
redisClient.on("ready", () => {
  console.log("Redis client ready");
});

// Event for errors
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// Event when disconnected
redisClient.on("end", () => {
  console.log("Redis client disconnected");
});


export default redisClient;
