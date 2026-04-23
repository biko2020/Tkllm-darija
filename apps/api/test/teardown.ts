export default async function globalTeardown() {
  const postgres = (global as any).__POSTGRES__;
  const kafka = (global as any).__KAFKA__;
  const redis = (global as any).__REDIS__;

  if (postgres) await postgres.stop();
  if (kafka) await kafka.stop();
  if (redis) await redis.stop();
}
