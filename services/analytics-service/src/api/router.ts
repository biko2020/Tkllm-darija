import { Router } from "express";
import {
  datasetGrowthController,
  userPerformanceController,
  leaderboardController,
  qualityTrendsController,
  dailyReportController,
  weeklyReportController,
} from "./controllers";

const router = Router();

// Dataset metrics
router.get("/metrics/dataset/:datasetId", datasetGrowthController);

// User metrics
router.get("/metrics/user/:userId", userPerformanceController);

// Leaderboard
router.get("/metrics/leaderboard", leaderboardController);

// Quality trends
router.get("/metrics/quality-trends", qualityTrendsController);

// Reports
router.get("/reports/daily", dailyReportController);
router.get("/reports/weekly", weeklyReportController);

export default router;
