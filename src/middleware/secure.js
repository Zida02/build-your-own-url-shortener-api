// advanced-security.js
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");

// Create DOMPurify instance
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const advancedSecurityMiddleware = (app) => {
  // Basic security setup (same as above)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    })
  );

  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:3000",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests from this IP" },
  });
  app.use(limiter);

  // Body parsing
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // NoSQL injection prevention
  app.use(mongoSanitize());

  // Advanced XSS protection with DOMPurify
  app.use((req, res, next) => {
    if (req.body) {
      req.body = deepSanitize(req.body);
    }
    if (req.query) {
      req.query = deepSanitize(req.query);
    }
    next();
  });

  // HPP prevention
  app.use(hpp());
};

// Advanced sanitization with DOMPurify
function deepSanitize(data) {
  if (typeof data === "string") {
    return DOMPurify.sanitize(data, {
      ALLOWED_TAGS: [], // Remove all HTML tags
      ALLOWED_ATTR: [], // Remove all attributes
      KEEP_CONTENT: true, // Keep text content
    });
  }

  if (Array.isArray(data)) {
    return data.map((item) => deepSanitize(item));
  }

  if (typeof data === "object" && data !== null) {
    const sanitized = {};
    for (const key in data) {
      sanitized[key] = deepSanitize(data[key]);
    }
    return sanitized;
  }

  return data;
}

module.exports = advancedSecurityMiddleware;
