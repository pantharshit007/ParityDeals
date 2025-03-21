import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env_server as env } from "@/data/env/env-server";
import * as schema from "./schema";

const log = process.env.NODE_ENV === "development" ? true : false;
const sql = neon(env.DATABASE_URL, { fetchOptions: { debug: true } });
export const db = drizzle({ client: sql, schema, logger: log });

// Function to check database connection status
export async function checkStatus() {
  try {
    const result = await sql`SELECT 1`;
    console.log("> Database connection status: ✅ Connected successfully");
    return { status: "connected", result };
  } catch (error) {
    console.error("> Database connection status: ❌ Failed to connect", error);
    return { status: "disconnected", error };
  }
}
