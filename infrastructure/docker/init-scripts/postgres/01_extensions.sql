-- Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
-- PostGIS for geo metadata (regional accent data)
CREATE EXTENSION IF NOT EXISTS postgis;
-- pg_trgm for fuzzy text search on transcripts
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- uuid-ossp for UUID primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pgcrypto for encryption helpers
CREATE EXTENSION IF NOT EXISTS pgcrypto;