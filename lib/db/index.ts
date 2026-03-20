import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/** Decode env var name so Next.js cannot statically replace `process.env.DATABASE_URL` at build time. */
function envName(b64: string): string {
  return Buffer.from(b64, "base64").toString("utf8");
}

function firstDefinedEnv(namesB64: string[]): string | undefined {
  for (const b64 of namesB64) {
    const v = process.env[envName(b64)];
    if (v) return v;
  }
  return undefined;
}

// DATABASE_URL, NETLIFY_DATABASE_URL, POSTGRES_URL (some templates)
const CONNECTION_ENV_KEYS = [
  "REFUQUJBU0VfVVJM", // DATABASE_URL
  "TkVUTElGWV9EQVRBQkFTRV9VUkw=", // NETLIFY_DATABASE_URL
  "UE9TVEdSRVNfVVJM", // POSTGRES_URL
];

function getConnectionString(): string {
  const fromEnv = firstDefinedEnv(CONNECTION_ENV_KEYS);
  if (fromEnv) return fromEnv;

  // Netlify / AWS serverless runtime (not `next build` on CI) — require a real URL.
  const onLambda =
    typeof process.env.AWS_LAMBDA_FUNCTION_NAME === "string" ||
    typeof process.env.LAMBDA_TASK_ROOT === "string" ||
    process.cwd().startsWith("/var/task");

  if (onLambda) {
    throw new Error(
      "Database URL missing at runtime. In Netlify: Site configuration → Environment variables → " +
        "add DATABASE_URL (Neon connection string) and enable it for this deploy context " +
        '("Production" and the scopes that include serverless functions / runtime — not build-only).'
    );
  }

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
