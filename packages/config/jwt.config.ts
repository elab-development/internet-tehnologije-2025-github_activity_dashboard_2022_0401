import * as dotenv from "dotenv";

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || "super_secret_key",
  expiresIn: "7d",
};