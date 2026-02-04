import cors from "cors";
import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";

dotenv.config({ path: "packages/.env" });
import { dataSource } from "./database/data-src";
import authRoutes from "./modules/auth/auth.routes";

dotenv.config();

const port = process.env.PORT || 3999;

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
}));

app.use(express.json());
app.use("/auth", authRoutes);
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

dataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");

    app.listen(port, () => {
      console.log(`Auth Server is running on port: ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });




