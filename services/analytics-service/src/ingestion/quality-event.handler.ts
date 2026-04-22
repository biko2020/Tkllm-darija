import { KafkaMessage } from "kafkajs";
import { logger } from "../shared/logger";
import { pool } from "../config/database";

/**
 * Handles quality.review.completed events
 * Updates quality trends in TimescaleDB
 */
export async function handleQualityEvent(message: KafkaMessage) {
  try {
    const payload = JSON.parse(message.value!.toString());
    const { submissionId, outcome, confidenceScore } = payload;

    logger.info(`Quality event for submission ${submissionId}, outcome ${outcome}`);

    await pool.query(
      `INSERT INTO platform_metrics (hour, tasks_approved, tasks_submitted, avg_quality_score)
       VALUES (date_trunc('hour', now()), 
               CASE WHEN $1 = 'APPROVED' THEN 1 ELSE 0 END, 
               1, $2)
       ON CONFLICT (hour)
       DO UPDATE SET tasks_approved = platform_metrics.tasks_approved + CASE WHEN $1 = 'APPROVED' THEN 1 ELSE 0 END,
                     tasks_submitted = platform_metrics.tasks_submitted + 1,
                     avg_quality_score = (platform_metrics.avg_quality_score + $2) / 2`,
      [outcome, confidenceScore]
    );
  } catch (err) {
    logger.error("Failed to process quality event", err);
  }
}
