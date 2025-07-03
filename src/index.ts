// src/index.ts
import "dotenv/config";
import { initializeDatabase, closeDatabase } from "./dbconfig";

// Initialize database before starting server
initializeDatabase()
  .then(() => {
    // Start Express server after DB is ready
    const server = app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("\n🔄 Shutting down gracefully...");
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    process.on("uncaughtException", async (err) => {
      console.error("Uncaught Exception:", err);
      await closeDatabase();
      process.exit(1);
    });
    process.on("unhandledRejection", async (err) => {
      console.error("Unhandled Rejection:", err);
      await closeDatabase();
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
  });