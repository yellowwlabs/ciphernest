import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// Prevent multiple connections during hot reloading in development
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Parse pool options from environment variables or use safe defaults
const maxConnections = process.env.DB_MAX_CONNECTIONS
  ? parseInt(process.env.DB_MAX_CONNECTIONS, 10)
  : 10;

const idleTimeout = process.env.DB_IDLE_TIMEOUT
  ? parseInt(process.env.DB_IDLE_TIMEOUT, 10)
  : 30;

const connectTimeout = process.env.DB_CONNECT_TIMEOUT
  ? parseInt(process.env.DB_CONNECT_TIMEOUT, 10)
  : 10;

// Enable prepared statements by default, disable if DB_PREPARE is "false"
// This is critical for PgBouncer/Supabase pooler in Transaction Mode
const usePrepared = process.env.DB_PREPARE !== "false";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const conn =
  globalForDb.conn ??
  postgres(connectionString, {
    max: maxConnections,
    idle_timeout: idleTimeout,
    connect_timeout: connectTimeout,
    prepare: usePrepared,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn);
