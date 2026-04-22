import { KafkaMessage } from "kafkajs";
import { logger } from "../shared/logger";
import { pool } from "../config/database";
import { ContributorMetrics } from "../types/analytics.types";

/**
 * Handles audio.uploaded events
 * Updates dataset growth metrics in TimescaleDB
 */
export async function handleDataEvent(message: KafkaMessage) {
  try {
    const payload = JSON.parse(message.value!.toString());
    const { userId, durationSeconds, datasetId } = payload;

    logger.info(`Data event received for user ${userId}, dataset ${datasetId}`);

    await pool.query(
      `INSERT INTO contributor_activity (contributor_id, hour, audio_seconds, tasks_submitted)
       VALUES ($1, date_trunc('hour', now()), $2, 1)
       ON CONFLICT (contributor_id, hour)
       DO UPDATE SET audio_seconds = contributor_activity.audio_seconds + $2,
                     tasks_submitted = contributor_activity.tasks_submitted + 1`,
      [userId, durationSeconds]
    );

    await pool.query(
      `UPDATE datasets SET size_hours = size_hours + $1 WHERE id = $2`,
      [durationSeconds / 3600, datasetId]
    );
  } catch (err) {
    logger.error("Failed to process data event", err);
  }
}
