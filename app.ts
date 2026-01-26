import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { type Request, type Response, type Application } from "express";
import { StatusCodes } from "http-status-codes";
import { router } from "./src/routes/index";

import { env } from "./src/config/env";
import notFound from "./src/app/middleware/notFound";
import { globalErrorHandler } from "./src/app/middleware/globalErrorHandler";

const app: Application = express();

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
