import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    FRONTEND_URL_PRODUCTION: process.env.FRONTEND_URL_PRODUCTION || "https://your-production-url.com",
    BYCRYPT_SALT_ROUNDS: process.env.BYCRYPT_SALT_ROUNDS || "12",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin123",
    JWT_SECRET_KEY: process.env.JWT_ACCESS_TOKEN_SECRET || "your_access_token_secret",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET || "your_refresh_token_secret",
    JWT_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "15m",
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d",
};