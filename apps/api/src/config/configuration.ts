/**
 * configuration.ts
 *
 * Loads and structures environment variables for the entire NestJS API.
 * All values are made available via ConfigService throughout the application.
 */

import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  // Application
  app: {
    name: process.env.APP_NAME || 'Tkllm-darija API',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.API_PORT || '3000', 10),
    prefix: process.env.API_PREFIX || 'api/v1',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: process.env.DATABASE_SSL === 'true',
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Storage (MinIO / S3 compatible)
  storage: {
    endpoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION || 'auto',
    bucketAudio: process.env.S3_BUCKET_AUDIO || 'tkllm-audio',
    bucketDatasets: process.env.S3_BUCKET_DATASETS || 'tkllm-datasets',
    bucketExports: process.env.S3_BUCKET_EXPORTS || 'tkllm-exports',
    bucketModels: process.env.S3_BUCKET_MODELS || 'tkllm-models',
    publicUrl: process.env.S3_PUBLIC_URL,
  },

  // External Services
  external: {
    kafkaBroker: process.env.KAFKA_BROKER,
    redisUrl: process.env.REDIS_URL,
    pineconeApiKey: process.env.PINECONE_API_KEY,
    huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
  },

  // Security
  security: {
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || [],
    cookieSecret: process.env.COOKIE_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY,
  },

  // Feature Flags
  features: {
    gamification: process.env.FEATURE_GAMIFICATION !== 'false',
    aiTutor: process.env.FEATURE_AI_TUTOR !== 'false',
    b2bApiAccess: process.env.FEATURE_B2B_API_ACCESS !== 'false',
    realtimeFeed: process.env.FEATURE_REALTIME_FEED === 'true',
  },
}));