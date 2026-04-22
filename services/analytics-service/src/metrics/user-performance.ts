import { pool } from "../config/database";
import { ContributorMetrics } from "../types/analytics.types";
import { logger } from "../shared/logger";

/**
 * Computes contributor performance metrics (leaderboard, streaks, earnings).
 */
export async function getUserPerformance(userId: string): Promise<ContributorMetrics | null> {
  try {
    const result = await pool.query(
      `SELECT contributor_id, SUM(tasks_submitted) AS tasks_submitted,
              SUM(tasks_approved) AS tasks_approved,
              SUM(audio_seconds)/3600 AS audio_hours,
              SUM(earnings_mad) AS earnings_mad
       FROM contributor_activity
       WHERE contributor_id = $1
       GROUP BY contributor_id`,
      [userId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      userId: row.contributor_id,
      tasksSubmitted: parseInt(row.tasks_submitted, 10),
      tasksApproved: parseInt(row.tasks_approved, 10),
      audioHours: parseFloat(row.audio_hours),
      earningsMad: parseFloat(row.earnings_mad),
      streakDays: 0, // streak logic can be added separately
    };
  } catch (err) {
    logger.error("Failed to fetch user performance metrics", err);
    return null;
  }
}

/**
 * Leaderboard: top contributors by earnings or tasks.
 */
export async function getLeaderboard(limit = 10): Promise<ContributorMetrics[]> {
  try {
    const result = await pool.query(
      `SELECT contributor_id, SUM(tasks_submitted) AS tasks_submitted,
              SUM(tasks_approved) AS tasks_approved,
              SUM(audio_seconds)/3600 AS audio_hours,
              SUM(earnings_mad) AS earnings_mad
       FROM contributor_activity
       GROUP BY contributor_id
       ORDER BY SUM(earnings_mad) DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map((row: any) => ({
      userId: row.contributor_id,
      tasksSubmitted: parseInt(row.tasks_submitted, 10),
      tasksApproved: parseInt(row.tasks_approved, 10),
      audioHours: parseFloat(row.audio_hours),
      earningsMad: parseFloat(row.earnings_mad),
      streakDays: 0,
    }));
  } catch (err) {
    logger.error("Failed to fetch leaderboard", err);
    return [];
  }
}
