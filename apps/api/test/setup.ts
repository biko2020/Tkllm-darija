import { StartedPostgresContainer, PostgresContainer } from "@testcontainers/postgres";
import { StartedKafkaContainer, KafkaContainer } from "@testcontainers/kafka";
import { StartedRedisContainer, RedisContainer } from "@testcontainers/redis";
import dotenv from "dotenv";

let postgres: StartedPostgresContainer;
let kafka: StartedKafkaContainer;
let redis: StartedRedisContainer;

export default async function globalSetup() {
  dotenv.config();

  // Start Postgres
  postgres = await new PostgresContainer("postgres:15")
    .withDatabase("testdb")
    .withUsername("testuser")
    .withPassword("testpass")
    .start();

  process.env.DATABASE_URL = postgres.getConnectionUri();

  // Start Kafka
  kafka = await new KafkaContainer("confluentinc/cp-kafka:7.5.0").start();
  process.env.KAFKA_BROKERS = kafka.getBootstrapServers();

  // Start Redis
  redis = await new RedisContainer("redis:7").start();
  process.env.REDIS_URL = `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`;

  // Store container references globally for teardown
  (global as any).__POSTGRES__ = postgres;
  (global as any).__KAFKA__ = kafka;
  (global as any).__REDIS__ = redis;
}
