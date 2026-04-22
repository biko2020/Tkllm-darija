import { pool } from "../config/database";
import { GrowthMetrics } from "../types/analytics.types";
import { logger } from "../shared/logger";

/**
 * Computes quality trends (confidence scores, pass rates).
 */
export async function getQualityTrends(hoursBack = 24): Promise<GrowthMetrics[]> {
  try {
    const result = await pool.query(
      `SELECT hour, AVG(avg_quality_score) AS avg_quality_score,
              SUM(tasks_submitted) AS tasks_submitted,
              SUM(tasks_approved) AS tasks_approved
       FROM platform_metrics
       WHERE hour >= now() - interval '${hoursBack} hours'
       GROUP BY hour
       ORDER BY hour ASC`
    );

    return result.rows.map((row: any) => ({
      timestamp: row.hour,
      activeContributors: 0, // can be joined from contributor_activity
      submissionsPerHour: parseInt(row.tasks_submitted, 10),
      payoutsMad: 0, // not tracked here
    }));
  } catch (err) {
    logger.error("Failed to fetch quality trends", err);
    return [];
  }
}
