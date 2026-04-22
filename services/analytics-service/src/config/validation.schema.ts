import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().optional(),
  DATABASE_URL: z.string().url(),
  KAFKA_BROKERS: z.string().min(1),
});
