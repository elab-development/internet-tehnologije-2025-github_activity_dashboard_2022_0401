import cors from "cors";
import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { dataSource } from "./database/data-src";

import authRoutes from "./modules/auth/auth.routes";
import repositoriesRoutes from "./modules/repositories/repositories.routes";
import githubRoutes from "./modules/github/github.routes";

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
}));

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

// 👇 OVO JE KLJUČNO
export default app;

// 👇 Server se pokreće SAMO ako nije test okruženje
if (process.env.NODE_ENV !== "test") {
  dataSource.initialize()
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