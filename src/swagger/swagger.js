import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    servers: [
      {
        url: "http://127.0.0.1:5050",
        description: "Local server",
      },
    ],

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
