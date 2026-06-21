import app from "./app";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const host = process.env.HOST || "0.0.0.0"; // Host 0.0.0.0 is critical for container environments

const start = async () => {
  try {
    await app.listen({ port, host });
    app.log.info(`Server listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown handler to release resources and wait for in-flight requests
const closeGracefully = async (signal: string) => {
  app.log.info(`Received ${signal}. Gracefully shutting down...`);
  try {
    await app.close();
    app.log.info("Server closed successfully.");
    process.exit(0);
  } catch (err) {
    app.log.error(err as Error, "Error occurred during graceful shutdown");
    process.exit(1);
  }
};

process.on("SIGINT", () => closeGracefully("SIGINT"));
process.on("SIGTERM", () => closeGracefully("SIGTERM"));

start();
