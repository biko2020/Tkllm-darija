import { KafkaMessage } from "kafkajs";
import { logger } from "../shared/logger";
import { pool } from "../config/database";

/**
 * Handles financial.payout.executed events
 * Updates contributor earnings and payout stats
 */
export async function handleFinanceEvent(message: KafkaMessage) {
  try {
    const payload = JSON.parse(message.value!.toString());
    const { userId, amountMad, transactionId } = payload;

    logger.info(`Finance event: payout ${transactionId} for user ${userId}, amount ${amountMad}`);

    await pool.query(
      `INSERT INTO contributor_activity (contributor_id, hour, earnings_mad)
       VALUES ($1, date_trunc('hour', now()), $2)
       ON CONFLICT (contributor_id, hour)
       DO UPDATE SET earnings_mad = contributor_activity.earnings_mad + $2`,
      [userId, amountMad]
    );

    await pool.query(
      `INSERT INTO platform_metrics (hour, total_payouts_mad)
       VALUES (date_trunc('hour', now()), $1)
       ON CONFLICT (hour)
       DO UPDATE SET total_payouts_mad = platform_metrics.total_payouts_mad + $1`,
      [amountMad]
    );
  } catch (err) {
    logger.error("Failed to process finance event", err);
  }
}
