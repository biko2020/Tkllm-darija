-- Daily aggregates for contributor activity
CREATE MATERIALIZED VIEW contributor_activity_daily
WITH (timescaledb.continuous) AS
SELECT
    contributor_id,
    time_bucket('1 day', hour) AS bucket,
    SUM(tasks_submitted) AS tasks_submitted,
    SUM(tasks_approved) AS tasks_approved,
    SUM(audio_seconds) AS audio_seconds,
    SUM(earnings_mad) AS earnings_mad
FROM contributor_activity
GROUP BY contributor_id, bucket
WITH NO DATA;

CALL refresh_continuous_aggregate('contributor_activity_daily', NULL, NULL);
