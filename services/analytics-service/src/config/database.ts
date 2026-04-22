import { Pool } from "pg";
import { config } from "./configuration";

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
});
