import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Fallback for build-time when DATABASE_URL is not set (e.g. Netlify build before env inject)
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://build:build@build.placeholder.koacha/koacha?sslmode=require";

// TCP via `pg` avoids Neon's HTTP `fetch` path, which can fail on Netlify's patched global fetch.
const globalForPool = globalThis as typeof globalThis & {
  __koachaPgPool?: Pool;
};

function getPool(): Pool {
  if (!globalForPool.__koachaPgPool) {
    globalForPool.__koachaPgPool = new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
    });
  }
  return globalForPool.__koachaPgPool;
}

export const db = drizzle(getPool(), { schema });
