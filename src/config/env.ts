import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    FRONTEND_URL_PRODUCTION: process.env.FRONTEND_URL_PRODUCTION || "https://your-production-url.com",
};