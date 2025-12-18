import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";
dotenv.config({
  path: `.env.${env}`,
});

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const servers = [
  {
    url: process.env.SERVER_URL || "http://127.0.0.1:5050",
    description: "Local development server",
  },
  // {
  //   url: process.env.STAGING_SERVER_URL || "https://staging.api.yourdomain.com",
  //   description: "Staging server",
  // },
  {
    url: process.env.PROD_SERVER_URL || "https://api.yourdomain.com",
    description: "Production server",
  },
];

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "URL SHORTNER API DOCUMENTATION",
      version: "1.0.0",
      description:
        "This API provides a comprehensive suite of services for User Authentication, Notification Management, and URL Shortening. It includes secure endpoints for creating and managing shortened URLs, handling user notifications (read, unread, count, delete), and performing protected actions with robust authentication and authorization mechanisms.",

      contact: {
        name: "Emmanuel Olabisi",
        email: "codarzida@gmail.com",
        url: "https://your-portfolio-or-github-link.com",
      },

      termsOfService: "https://your-domain.com/terms",
      license: {
        name: "MIT License",
        url: "https://opensource.org/licenses/MIT",
      },
    },

    servers,

    // servers: [
    //   {
    //     url: "http://127.0.0.1:5050",
    //     description: "Local server",
    //   },
    // ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  // Load ALL docs inside /docs folder
  apis: [path.join(__dirname, "../doc/*.js")],
};

export const swaggerSpec = swaggerJSDoc(options);
export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);
