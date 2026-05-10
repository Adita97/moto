const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const env = {
  PORT: parseInt(process.env.PORT, 10) || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_PATH: process.env.DB_PATH || "./server/data/moto.db",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 20,
  ALLOWED_FILE_TYPES: (
    process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp"
  ).split(","),
};

const required = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "ADMIN_PASSWORD_HASH",
];
for (const key of required) {
  if (!env[key] || env[key].includes("CHANGE_ME")) {
    console.error(`Missing or unchanged environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = env;
