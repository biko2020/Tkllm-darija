-- Table for dataset-level aggregates
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY,
    size_records INT DEFAULT 0,
    size_hours DOUBLE PRECISION DEFAULT 0,
    quality_score DOUBLE PRECISION DEFAULT 0
);
