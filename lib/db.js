import { Pool } from "pg";

let pool = null;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("WARNING: DATABASE_URL is not set. Database operations will be unavailable until it is configured.");
    return null;
  }

  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
  });
  return pool;
}

export async function query(text, params) {
  const activePool = getPool();
  if (!activePool) {
    throw new Error("Database not connected. Please set DATABASE_URL in .env");
  }
  return activePool.query(text, params);
}

export { getPool };
