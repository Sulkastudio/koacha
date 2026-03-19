import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Fallback for build-time when DATABASE_URL is not set (e.g. Netlify build before env inject)
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://build:build@build.placeholder.koacha/koacha?sslmode=require";
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
