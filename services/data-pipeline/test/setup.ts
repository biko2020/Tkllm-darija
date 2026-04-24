import dotenv from "dotenv";

dotenv.config();

export async function initPipelineTestEnv() {
  // Load env vars, mock services, etc.
  return { env: process.env.NODE_ENV || "test" };
}
