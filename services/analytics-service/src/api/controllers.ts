import { Request, Response } from "express";
import { getDatasetGrowth } from "../metrics/dataset-growth";
import { getUserPerformance, getLeaderboard } from "../metrics/user-performance";
import { getQualityTrends } from "../metrics/quality-trends";
import { generateDailyReport } from "../reports/daily-report";
import { generateWeeklyReport } from "../reports/weekly-report";
import { logger } from "../shared/logger";

/**
 * Controller: Dataset growth metrics
 */
export async function datasetGrowthController(req: Request, res: Response) {
  try {
    const { datasetId } = req.params;
    const metrics = await getDatasetGrowth(datasetId);
    if (!metrics) return res.status(404).json({ error: "Dataset not found" });
    res.json(metrics);
  } catch (err) {
    logger.error("Dataset growth controller failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Controller: User performance metrics
 */
export async function userPerformanceController(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const metrics = await getUserPerformance(userId);
    if (!metrics) return res.status(404).json({ error: "User not found" });
    res.json(metrics);
  } catch (err) {
    logger.error("User performance controller failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Controller: Leaderboard
 */
export async function leaderboardController(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const leaderboard = await getLeaderboard(limit);
    res.json(leaderboard);
  } catch (err) {
    logger.error("Leaderboard controller failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Controller: Quality trends
 */
export async function qualityTrendsController(req: Request, res: Response) {
  try {
    const hoursBack = parseInt(req.query.hoursBack as string, 10) || 24;
    const trends = await getQualityTrends(hoursBack);
    res.json(trends);
  } catch (err) {
    logger.error("Quality trends controller failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Controller: Daily report
 */
export async function dailyReportController(req: Request, res: Response) {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const report = await generateDailyReport(date);
    res.json(report);
  } catch (err) {
    logger.error("Daily report controller failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Controller: Weekly report
 */
export async function weeklyReportController(req: Request, res: Response) {
  try {
    const weekStart = req.query.weekStart ? new Date(req.query.weekStart as string) : new Date();
    const report = await generateWeeklyReport(weekStart);
    res.json(report);
  } catch (err) {
    logger.error("Weekly report controller failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
