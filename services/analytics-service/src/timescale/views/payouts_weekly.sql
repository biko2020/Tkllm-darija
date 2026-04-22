-- Weekly payout totals
CREATE MATERIALIZED VIEW payouts_weekly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 week', hour) AS bucket,
    SUM(total_payouts_mad) AS total_payouts_mad
FROM platform_metrics
GROUP BY bucket
WITH NO DATA;

CALL refresh_continuous_aggregate('payouts_weekly', NULL, NULL);
