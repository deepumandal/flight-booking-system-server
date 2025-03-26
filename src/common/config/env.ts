import { config } from "dotenv";
config();

export type envKey =
  | "DB_NAME"
  | "DB_USERNAME"
  | "DB_PASSWORD"
  | "DB_HOST"
  | "DB_PORT"
  | "JWT_SECRET"
  | "PORT";

export const envConfig = <T>(key: envKey): T => {
  const env = process.env[key];

  if (typeof env === "undefined" && process.env.NODE_ENV === "development") {
    throw new Error(`${key} is not defined`);
  }

  return env as T;
};
