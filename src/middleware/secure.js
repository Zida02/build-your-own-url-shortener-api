import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import { JSDOM } from "jsdom";
import ipRangeCheck from "ip-range-check";
import createDOMPurify from "dompurify";

// Create DOMPurify instance
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const allowedIps = process.env.ALLOWED_IPS?.split(",") || ["127.0.0.1"];

export const advancedSecurityMiddleware = (app) => {
  // app.set("trust proxy", true);
  app.disable("x-powered-by");
  // Helmet + CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: [
            "'self'",
            "http://localhost:5050",
            "http://127.0.0.1:5050",
          ], //
        },
      },
    })
  );

  // Extra Helmet headers
  app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
  app.use(helmet.frameguard({ action: "deny" }));
  app.use(helmet.permittedCrossDomainPolicies());

  // CORS
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:5050",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );

  // Rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests from this IP" },
  });
  app.use(limiter);

  // Body parser (JSON + extended URL-encoded)
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // NoSQL injection
  app.use(mongoSanitize());

  // HPP
  app.use(hpp());

  // IP whitelist
  app.use((req, res, next) => {
    const clientIp = req.ip;
    if (ipRangeCheck(clientIp, allowedIps)) next();
    else res.status(403).json({ error: "Access denied: IP not allowed" });
  });

  // Deep XSS sanitization for JSON & URL-encoded payloads
  app.use((req, res, next) => {
    try {
      if (req.body) req.body = deepSanitize(req.body);
      if (req.query) req.query = deepSanitize(req.query);
      if (req.params) req.params = deepSanitize(req.params);
      next();
    } catch (err) {
      next(err);
    }
  });
};

// Recursive deep sanitization for strings inside objects/arrays
function deepSanitize(data) {
  if (typeof data === "string") {
    return DOMPurify.sanitize(data, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }

  if (Array.isArray(data)) return data.map(deepSanitize);

  if (typeof data === "object" && data !== null) {
    const sanitized = {};
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        sanitized[key] = deepSanitize(data[key]);
      }
    }
    return sanitized;
  }

  return data;
}
