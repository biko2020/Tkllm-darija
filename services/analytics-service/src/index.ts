import express from "express";
import { Kafka } from "kafkajs";
import router from "./api/router";
import { logger } from "./shared/logger";
import { pool } from "./config/database";
import { handleDataEvent } from "./ingestion/data-event.handler";
import { handleQualityEvent } from "./ingestion/quality-event.handler";
import { handleFinanceEvent } from "./ingestion/finance-event.handler";
import { config } from "./config/configuration";

async function bootstrap() {
  try {
    // Connect DB
    await pool.connect();
    logger.info("Connected to TimescaleDB");

    // Kafka setup
    const kafka = new Kafka({
      clientId: "analytics-service",
      brokers: config.kafkaBrokers.split(","),
    });
    const consumer = kafka.consumer({ groupId: "analytics-service-group" });

    await consumer.connect();
    await consumer.subscribe({ topic: "audio.uploaded", fromBeginning: false });
    await consumer.subscribe({ topic: "quality.review.completed", fromBeginning: false });
    await consumer.subscribe({ topic: "financial.payout.executed", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (topic === "audio.uploaded") await handleDataEvent(message);
        if (topic === "quality.review.completed") await handleQualityEvent(message);
        if (topic === "financial.payout.executed") await handleFinanceEvent(message);
      },
    });

    // REST API
    const app = express();
    app.use(express.json());
    app.use("/analytics", router);

    app.listen(config.port, () => {
      logger.info(`Analytics service running on port ${config.port}`);
    });
  } catch (err) {
    logger.error("Failed to bootstrap analytics-service", err);
    process.exit(1);
  }
}

bootstrap();
