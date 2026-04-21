import { z } from 'zod'; // Recommended for Type-safety

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  KAFKA_BROKERS: z.string().min(1),
  REDIS_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  
  // Moroccan Provider Keys
  CMI_MERCHANT_ID: z.string().min(1),
  CMI_SECRET_KEY: z.string().min(1),
  ORANGE_MONEY_API_KEY: z.string().optional(),
  INWI_MONEY_MERCHANT_ID: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;