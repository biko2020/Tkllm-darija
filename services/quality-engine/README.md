# Quality Engine Service
**Status:** Phase 00 — Scaffolded
**Runtime:** Node.js 20+ (TypeScript)

## Description
The Quality Engine acts as the automated gatekeeper for the Tkllm‑darija dataset.
It ensures that only high‑quality Moroccan Darija data enters the training pipeline by performing:

- Multi‑stage validation

- Linguistic and technical scoring

- Active learning queue management

## Expected Interface
**Trigger:** Consumes events from Kafka topic quality.review.requested

**Input:**

S3 Object Key (audio)

JSON Metadata (transcripts/tags)

**Output:** Publishes evaluation results and review status to quality.review.completed

**Logic:** Rule‑based schema validation combined with heuristic scoring for audio‑text alignment

## Core Features
 ### Data Contract Enforcement  
Validates incoming records against audio_annotation.json and quality_review.json schemas.

### Active Learning Integration  
Flags low‑confidence samples for human‑in‑the‑loop (HITL) review.

### Multi‑Stage Review  
Separates technical quality (bitrate, clipping, noise) from linguistic quality (dialectal accuracy, transcript alignment).

## Directory Structure
src/index.ts → Service bootstrap & Kafka client initialization

src/consumer.ts → Handles incoming review tasks from the message bus

src/scorer.ts → Central pipeline for calculating quality metrics

src/active-learning.ts → Priority queue for HITL samples

src/storage.ts → Integration layer for S3/MinIO asset retrieval

src/types.ts → Shared type definitions

## Deployment & Scaling
**Containerization:** Multi‑stage Dockerfile optimized for CPU‑heavy scoring

**Scaling:** Horizontal scaling via Kafka consumer groups

Performance bound by CPU (scoring) and I/O (S3 retrieval)

## Environment Configuration
- Required environment variables:

- KAFKA_BROKERS → Kafka cluster connection string

- S3_ENDPOINT / S3_BUCKET → Object storage configuration

- REDIS_URL (optional) → Deduplication & caching