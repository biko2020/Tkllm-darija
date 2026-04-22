-- Weekly quality trends
CREATE MATERIALIZED VIEW quality_trends_weekly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 week', hour) AS bucket,
    AVG(avg_quality_score) AS avg_quality_score,
    SUM(tasks_submitted) AS tasks_submitted,
    SUM(tasks_approved) AS tasks_approved
FROM platform_metrics
GROUP BY bucket
WITH NO DATA;

CALL refresh_continuous_aggregate('quality_trends_weekly', NULL, NULL);
