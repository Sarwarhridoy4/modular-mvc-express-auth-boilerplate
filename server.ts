import http, { Server } from "http";
import { prisma } from "./src/config/db.js";
import app from "./app.js";
import { env } from "./src/config/env.js";

let server: Server | null = null;

async function connectToDB() {
  try {
    await prisma.$connect();
    console.log("*** DB connection successfull!!");
  } catch (error) {
    console.log("*** DB connection failed!");
    process.exit(1);
  }
}

async function startServer() {
  try {
    await connectToDB();
    server = http.createServer(app);
    server.listen(env.PORT, () => {
      console.log(
        `🚀 Server is running on ${env.NODE_ENV} environment on port ${env.PORT}`
      );
    });

    handleProcessEvents();
  } catch (error) {
    console.error("❌ Error during server startup:", error);
    process.exit(1);
  }
}

/**
 * Gracefully shutdown the server and close database connections.
 * @param {string} signal - The termination signal received.
 */
async function gracefulShutdown(signal: string) {
  console.warn(`🔄 Received ${signal}, shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log("✅ HTTP server closed.");

      try {
        await prisma.$disconnect();
        console.log("Server shutdown complete.");
      } catch (error) {
        console.error("❌ Error during shutdown:", error);
      }

      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

/**
 * Handle system signals and unexpected errors.
 */
function handleProcessEvents() {
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("uncaughtException", (error) => {
    console.error("💥 Uncaught Exception:", error);
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    console.error("💥 Unhandled Rejection:", reason);
    gracefulShutdown("unhandledRejection");
  });
}

// Start the application
startServer();
