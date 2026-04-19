/**
 * validation.schema.ts
 *
 * Joi-based validation schema for environment variables.
 * Ensures all required configuration is present and valid at startup.
 */

import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),
  APP_NAME: Joi.string().default('Tkllm-darija API'),
  API_PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  // Database
  DATABASE_URL: Joi.string().required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_SSL: Joi.boolean().default(false),

  // Authentication
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),

  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),

  // Storage
  S3_ENDPOINT: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_BUCKET_AUDIO: Joi.string().default('tkllm-audio'),
  S3_BUCKET_DATASETS: Joi.string().default('tkllm-datasets'),

  // Messaging & Cache
  REDIS_URL: Joi.string().required(),
  KAFKA_BROKER: Joi.string().required(),

  // Security
  CORS_ORIGINS: Joi.string().default('http://localhost:3001,http://localhost:3002'),
  COOKIE_SECRET: Joi.string().required(),
  ENCRYPTION_KEY: Joi.string().required().min(32),

  // Feature Flags (optional)
  FEATURE_GAMIFICATION: Joi.boolean().default(true),
  FEATURE_AI_TUTOR: Joi.boolean().default(true),
  FEATURE_B2B_API_ACCESS: Joi.boolean().default(true),
  FEATURE_REALTIME_FEED: Joi.boolean().default(false),
}).unknown(true); // Allow extra env vars (e.g. from Docker)