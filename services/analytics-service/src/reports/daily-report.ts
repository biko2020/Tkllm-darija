import { pool } from "../config/database";
import { logger } from "../shared/logger";

/**
 * Generates a daily summary of contributor activity and dataset growth.
 */
export async function generateDailyReport(date: Date = new Date()) {
  try {
    const result = await pool.query(
      `SELECT 
          COUNT(DISTINCT contributor_id) AS active_contributors,
          SUM(tasks_submitted) AS tasks_submitted,
          SUM(tasks_approved) AS tasks_approved,
          SUM(audio_seconds)/3600 AS audio_hours,
          SUM(earnings_mad) AS total_earnings
       FROM contributor_activity
       WHERE date_trunc('day', hour) = date_trunc('day', $1::timestamp)`,
      [date]
    );

    const row = result.rows[0];
    return {
      date: date.toISOString().split("T")[0],
      activeContributors: parseInt(row.active_contributors, 10),
      tasksSubmitted: parseInt(row.tasks_submitted, 10),
      tasksApproved: parseInt(row.tasks_approved, 10),
      audioHours: parseFloat(row.audio_hours),
      totalEarningsMad: parseFloat(row.total_earnings),
    };
  } catch (err) {
    logger.error("Failed to generate daily report", err);
    return null;
  }
}
