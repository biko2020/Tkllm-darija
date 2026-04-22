import { pool } from "../config/database";
import { DatasetMetrics } from "../types/analytics.types";
import { logger } from "../shared/logger";

/**
 * Computes dataset growth metrics (records, hours, quality).
 */
export async function getDatasetGrowth(datasetId: string): Promise<DatasetMetrics | null> {
  try {
    const result = await pool.query(
      `SELECT id, size_records, size_hours, quality_score
       FROM datasets
       WHERE id = $1`,
      [datasetId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      datasetId: row.id,
      sizeRecords: row.size_records,
      sizeHours: parseFloat(row.size_hours),
      qualityScore: parseFloat(row.quality_score ?? 0),
    };
  } catch (err) {
    logger.error("Failed to fetch dataset growth metrics", err);
    return null;
  }
}
