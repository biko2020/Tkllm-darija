-- Hypertable for contributor activity
CREATE TABLE IF NOT EXISTS contributor_activity (
    contributor_id UUID NOT NULL,
    hour TIMESTAMPTZ NOT NULL,
    tasks_submitted INT DEFAULT 0,
    tasks_approved INT DEFAULT 0,
    audio_seconds DOUBLE PRECISION DEFAULT 0,
    earnings_mad DOUBLE PRECISION DEFAULT 0,
    PRIMARY KEY (contributor_id, hour)
);

-- Convert to hypertable
SELECT create_hypertable('contributor_activity', 'hour', if_not_exists => TRUE);
