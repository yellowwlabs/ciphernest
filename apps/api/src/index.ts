import app from "./app";
import { config } from "./config";

const start = async () => {
  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    app.log.info(`Server listening on http://${config.HOST}:${config.PORT}`);
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
