import { z } from "zod";
import { envSchema } from "./validation.schema";

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration", parsed.error.format());
  process.exit(1);
}

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL!,
  kafkaBrokers: process.env.KAFKA_BROKERS!,
};
