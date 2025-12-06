// //   import winston from "winston";
// //   import "winston-daily-rotate-file";

// //   // === Daily Rotate File Transport ===
// //   const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
// //     filename: "logs/app-%DATE%.log",
// //     datePattern: "YYYY-MM-DD",
// //     zippedArchive: true,
// //     maxSize: "20m",
// //     maxFiles: "14d", // Keep logs for 14 days
// //   });

// //   // === Logger ===
// //   const logger = winston.createLogger({
// //     level: "info",
// //     format: winston.format.combine(
// //       winston.format.timestamp(),
// //       winston.format.json()
// //     ),
// //     transports: [
// //       dailyRotateFileTransport,
// //       new winston.transports.File({
// //         filename: "logs/errors.log",
// //         level: "error",
// //       }),
// //     ],
// //   });

// //   // === Console Logs Only In Dev Mode ===
// //   if (process.env.NODE_ENV !== "production") {
// //     logger.add(
// //       new winston.transports.Console({
// //         format: winston.format.simple(),
// //       })
// //     );
// //   }

// // export default logger;

// import winston from "winston";
// import "winston-daily-rotate-file";

// // ----------- DAILY ROTATE FOR INFO LOGS -----------
// const infoRotateTransport = new winston.transports.DailyRotateFile({
//   filename: "logs/info-%DATE%.log",
//   datePattern: "YYYY-MM-DD",
//   zippedArchive: true,
//   maxSize: "20m",
//   maxFiles: "30d",
//   level: "info",
// });

// // ----------- DAILY ROTATE FOR ERROR LOGS -----------
// const errorRotateTransport = new winston.transports.DailyRotateFile({
//   filename: "logs/errors-%DATE%.log",
//   datePattern: "YYYY-MM-DD",
//   zippedArchive: true,
//   maxSize: "20m",
//   maxFiles: "60d",
//   level: "error",
// });

// // ----------- MASTER LOG (ALL LEVELS) -----------
// const appRotateTransport = new winston.transports.DailyRotateFile({
//   filename: "logs/app-%DATE%.log",
//   datePattern: "YYYY-MM-DD",
//   zippedArchive: true,
//   maxSize: "20m",
//   maxFiles: "60d",
// });

// // ----------- LOGGER ----------------
// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [
//     infoRotateTransport,
//     errorRotateTransport,
//     appRotateTransport,
//     new winston.transports.File({
//       filename: "logs/errors.log",
//       level: "error",
//     }),
//     new winston.transports.File({
//       filename: "logs/info.log",
//       level: "info",
//     }),
//   ],
// });

// // ----------- CONSOLE LOGGING (DEV ONLY) ----------
// if (process.env.NODE_ENV !== "production") {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.simple()
//       ),
//     })
//   );
// }

// export default logger;

import winston from "winston";
import "winston-daily-rotate-file";
import {Logtail } from "@logtail/node"
import { LogtailTransport } from "@logtail/winston"
import dotenv from "dotenv";


const env = process.env.NODE_ENV || "development";
dotenv.config({
  path: `.env.${env}`,
});

//BETTERSTACK = nYBJ4NjNyjqPMjZqoUDooRuH;
const logtail = new Logtail(process.env.BETTERSTACK || "", {
  endpoint: process.env.BETTERSTACK_ENDPOINT || undefined,
});

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const appLogTransport = new winston.transports.DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
  level: "info",
});

const errorLogTransport = new winston.transports.DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "60d",
  level: "error",
});

const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    appLogTransport,
    errorLogTransport,
    new LogtailTransport(logtail),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
