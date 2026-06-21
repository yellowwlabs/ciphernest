import { config } from "./config";
import app from "./app";

const start = async () => {
  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`Server listening on http://${config.host}:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

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
