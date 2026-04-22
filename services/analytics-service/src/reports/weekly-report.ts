import { pool } from "../config/database";
import { logger } from "../shared/logger";

/**
 * Generates a weekly summary of growth and quality trends.
 */
export async function generateWeeklyReport(weekStart: Date) {
  try {
    const result = await pool.query(
      `SELECT 
          COUNT(DISTINCT contributor_id) AS active_contributors,
          SUM(tasks_submitted) AS tasks_submitted,
          SUM(tasks_approved) AS tasks_approved,
          AVG(avg_quality_score) AS avg_quality_score,
          SUM(audio_seconds)/3600 AS audio_hours,
          SUM(earnings_mad) AS total_earnings
       FROM contributor_activity ca
       JOIN platform_metrics pm ON ca.hour = pm.hour
       WHERE date_trunc('week', ca.hour) = date_trunc('week', $1::timestamp)`,
      [weekStart]
    );

    const row = result.rows[0];
    return {
      weekStart: weekStart.toISOString().split("T")[0],
      activeContributors: parseInt(row.active_contributors, 10),
      tasksSubmitted: parseInt(row.tasks_submitted, 10),
      tasksApproved: parseInt(row.tasks_approved, 10),
      avgQualityScore: parseFloat(row.avg_quality_score),
      audioHours: parseFloat(row.audio_hours),
      totalEarningsMad: parseFloat(row.total_earnings),
    };
  } catch (err) {
    logger.error("Failed to generate weekly report", err);
    return null;
  }
}
