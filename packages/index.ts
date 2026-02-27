import cors from "cors";
import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { dataSource } from "./database/data-src";
import authRoutes from "./modules/auth/auth.routes";
import repositoriesRoutes from "./modules/repositories/repositories.routes";
import githubRoutes from "./modules/github/github.routes";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import helmet from "helmet";
import rateLimit from "express-rate-limit";

export const app = express(); // 👈 BITNO


app.use(helmet());
app.use(express.json());



const swaggerOptions = {
  tags: [
  { name: "Auth", description: "Authentication operations" },
  { name: "GitHub", description: "GitHub analytics" },
  { name: "Repositories", description: "User repository management" },
  { name: "System", description: "System health and monitoring" }
],
  info: {
  title: "GitHub Activity Dashboard API",
  version: "1.0.0",
  description: `
  Backend service for GitHub Activity Dashboard.

  Features:
  - JWT authentication
  - Role-based access control
  - GitHub GraphQL integration
  - Repository analytics
  - Rate limiting & security protection
  `,
  contact: {
    name: "Mila Matic",
    email: "tvojemail@gmail.com"
  }
},
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GitHub Activity Dashboard API",
      version: "1.0.0",
      description:
        "Backend API for GitHub Activity Dashboard application. Provides authentication, repository analytics and GitHub statistics.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
   components: {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Enter JWT token obtained from login endpoint"
    }
  },
      schemas: {
        RegisterInput: {
          type: "object",
          required: ["email", "username", "password"],
          properties: {
            email: { type: "string", example: "test@gmail.com" },
            username: { type: "string", example: "bajola" },
            password: { type: "string", example: "123456" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "test@gmail.com" },
            password: { type: "string", example: "123456" },
          },
        },
        AuthResponse: {
          
          type: "object",
          properties: {
            email: { type: "string" },
            token: { type: "string" },

          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./packages/modules/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);



dotenv.config({ path: "packages/.env" });
dotenv.config();


const port = process.env.PORT || 5000;


app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/github", githubRoutes);
app.use("/auth", authRoutes);
app.use("/repositories", repositoriesRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check server health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});



if (process.env.NODE_ENV !== "test") {
  dataSource
    .initialize()
    .then(() => {
      console.log("Database connected successfully");

      app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
      });
    })
    .catch((error) => {
      console.error("Database connection error:", error);
    });
}