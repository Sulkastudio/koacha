import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Next.js replaces `process.env.DATABASE_URL` at **build** time. On Netlify the URL is often
 * present only at **runtime** for serverless, so the build can bake in `undefined` and our
 * fallback — then production keeps using the placeholder host. Build the key dynamically so
 * the real `process.env` is read when the pool is created on the server.
 */
function getConnectionString(): string {
  const key = ["D", "A", "T", "A", "B", "A", "S", "E", "_", "U", "R", "L"].join("");
  const fromEnv = process.env[key];
  if (fromEnv) return fromEnv;
  // Local `next build` / CI without DB: allow import graph to resolve; do not use in production.
  return "postgresql://build:build@build.placeholder.koacha/koacha?sslmode=require";
}

// TCP via `pg` avoids Neon's HTTP `fetch` path, which can fail on Netlify's patched global fetch.
const globalForPool = globalThis as typeof globalThis & {
  __koachaPgPool?: Pool;
};

function getPool(): Pool {
  if (!globalForPool.__koachaPgPool) {
    globalForPool.__koachaPgPool = new Pool({
      connectionString: getConnectionString(),
      max: 1,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
    });
  }
  return globalForPool.__koachaPgPool;
}

export const db = drizzle(getPool(), { schema });
