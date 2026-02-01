import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { type Request, type Response, type Application } from "express";
import { StatusCodes } from "http-status-codes";
import { router } from "./src/routes/index.js";

import { env } from "./src/config/env.js";
import notFound from "./src/app/middleware/notFound.js";
import { globalErrorHandler } from "./src/app/middleware/globalErrorHandler.js";

// Swagger imports
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/config/swagger.config.js'; // Adjust path if necessary

const app: Application = express();

// Trust proxy - required for proper IP detection behind proxies/load balancers
app.set('trust proxy', true);

// Middleware
app.use(
  cors({
    origin: [env.FRONTEND_URL, env.FRONTEND_URL_PRODUCTION],
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1", router);

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Default route for testing
app.get("/", (_req: Request, res: Response) => {
  res
    .status(StatusCodes.OK)
    .json({ message: "welcome to the Inventory Management System API" });
});

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
