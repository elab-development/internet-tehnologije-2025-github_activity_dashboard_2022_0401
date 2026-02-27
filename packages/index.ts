import cors from "cors";
import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { dataSource } from "./database/data-src";
import authRoutes from "./modules/auth/auth.routes";
import repositoriesRoutes from "./modules/repositories/repositories.routes";
import githubRoutes from "./modules/github/github.routes";

import helmet from "helmet";
import rateLimit from "express-rate-limit";

export const app = express(); // 👈 BITNO


app.use(helmet());
app.use(express.json());

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