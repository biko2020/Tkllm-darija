-- Hypertable for platform-wide metrics
CREATE TABLE IF NOT EXISTS platform_metrics (
    hour TIMESTAMPTZ NOT NULL PRIMARY KEY,
    tasks_submitted INT DEFAULT 0,
    tasks_approved INT DEFAULT 0,
    avg_quality_score DOUBLE PRECISION DEFAULT 0,
    total_payouts_mad DOUBLE PRECISION DEFAULT 0
);

SELECT create_hypertable('platform_metrics', 'hour', if_not_exists => TRUE);
