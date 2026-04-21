# Tkllm-darija — Moroccan Darija Data Factory

> **A crowdsourced, production-grade platform for collecting, processing, and delivering high-quality Moroccan Arabic (Darija) datasets as a premium Data-as-a-Service (DaaS) for AI companies.**

Tkllm-darija bridges the critical gap between Moroccan dialect data and modern AI systems. The platform delivers ethically sourced, culturally authentic, and continuously refreshed datasets to AI labs, enterprises, and governments building production-grade models for speech recognition, machine translation, virtual assistants, customer service automation, and more.

Built with a focus on **scale**, **quality**, **cultural authenticity**, and **full regulatory compliance** (Morocco Law 09-08 / CNDP + GDPR-aligned practices).

---

## Table of Contents

- [Key Features](#-key-features)
- [Platform Overview](#-platform-overview)
- [Technical Architecture](#️-technical-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Tech Stack](#-tech-stack)
- [License](#-license)
- [Contributing](#-contributing)
- [Author](#-author)

---

## ✨ Key Features

### For Contributors (Mobile-First App)
- **Voice Recording** — Real-life scenario prompts: taxi orders, souk negotiations, medical consultations, code-switched conversations, and more
- **AI-Assisted Transcription** — Automated first pass + human correction in Arabizi/Latin or Arabic script
- **Rich Annotation Tasks** — Text labeling, translation, sentiment analysis, named-entity recognition, image/video description
- **Built-in Darija AI Tutor** — Free chatbot for language practice and contributor onboarding
- **Gamification & Rewards** — Streaks, leaderboards, and instant payouts via Orange Money, Inwi Money, or international transfer options
- **Demographic Metadata** — Regional, age, gender, and accent data collected with explicit, granular consent

### For AI Companies (B2B Portal)
- **Curated Datasets** — Speech-to-text pairs, parallel corpora, and fully annotated data packages
- **Custom Collection Campaigns** — On-demand data collection tailored to specific domains or use cases
- **Real-Time API Access** — Live data feed for continuous model improvement
- **Domain-Specific Packs** — Banking, healthcare, e-commerce, tourism, and legal verticals
- **Quality Assurance** — Human-in-the-loop validation with transparent quality scoring
- **Benchmark Suites** — Standardized evaluation tools for Darija NLP and ASR models

---

## 🚀 Platform Overview

Tkllm-darija consists of three tightly integrated layers:

| Layer | Description |
|---|---|
| **Contributor App** | Mobile (Flutter) and web (`web-contributor`) interface for data collection and annotation |
| **B2B Portal** | Dedicated enterprise portal (`web-b2b`) for dataset access, custom campaigns, and API management |
| **Data Pipeline** | Backend processing, ML-assisted transcription, quality scoring, and dataset versioning |
| **Core API** | Unified REST + GraphQL API (`apps/api`) serving both contributor and B2B surfaces |

---

## 🏗️ Technical Architecture

Tkllm-darija follows a **scalable, cloud-native, microservices-oriented** architecture designed for high-concurrency voice uploads, low-latency mobile experience, and secure, auditable data pipelines.

```
Clients (Mobile / Web)
        │
        ▼
API Gateway  (Kong / Traefik)
        │
        ▼
Backend Services  (Kubernetes)
  ├── User & Contributor Service
  ├── Task & Data Service
  └── Payment & Reward Service
        │
        ▼
Data Pipeline Layer
  ├── Audio Processing Worker
  ├── ML Annotation & Training
  └── Data Export & API
        │
        ▼
Storage & Databases
  ├── PostgreSQL + TimescaleDB
  ├── Cloud Object Storage (S3-compatible)
  └── Vector Store (Pinecone / Weaviate)
```

### Core Components

#### 1. Frontend
| Component | App | Technology |
|---|---|---|
| Mobile App (iOS + Android) | `apps/mobile` | Flutter 3.24+ — single codebase, offline support, native audio recording |
| Contributor Web App | `apps/web-contributor` | Next.js 15 + TypeScript + Tailwind CSS |
| B2B Enterprise Portal | `apps/web-b2b` | Next.js 15 + TypeScript + Tailwind CSS — role-based access control |

#### 2. Backend
| Component | App / Service | Technology |
|---|---|---|
| Main API | `apps/api` | NestJS (TypeScript) — REST + GraphQL |
| Authentication | `apps/api` | Supabase Auth / Keycloak — OAuth2 + JWT, phone/email, Moroccan number support |
| User & Contributor Service | `apps/api` | Profile management, consent tracking, metadata storage |
| Task Engine | `apps/api` | Dynamic prompt distribution and contributor matching |
| Quality Control Workflow | `services/quality-engine` | Multi-stage human + automated validation |
| Payment & Reward System | `services/payment-service` | Integration with Moroccan mobile money APIs |

#### 3. ML & Data Layer
| Component | Technology |
|---|---|
| ASR Bootstrap | Fine-tuned Whisper / wav2vec 2.0 on DVoice, DODa, AtlasIA datasets |
| Transcription Workers | Whisper-large-v3 / SpeechBrain — GPU workers on RunPod / Vast.ai / AWS SageMaker |
| Annotation Pipeline | Human-in-the-loop with active learning queue |
| Vector Store | Pinecone / Weaviate for semantic data search |
| Dataset Management | Hugging Face Datasets + DVC for versioning |

#### 4. Storage
| Data Type | Solution |
|---|---|
| Audio Files | Supabase Storage / AWS S3 / Cloudflare R2 — AES-256 encryption at rest |
| Metadata & Transcripts | PostgreSQL + PostGIS (geo) + TimescaleDB (time-series analytics) |
| Processed Datasets | MinIO (S3-compatible) in Parquet / JSONL format |

#### 5. Infrastructure & DevOps
| Concern | Technology |
|---|---|
| Orchestration | Kubernetes (EKS / GKE / DigitalOcean) or Serverless (Vercel + Cloud Run) |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana + Sentry |
| Logging | ELK Stack or Loki |
| Background Jobs | Celery (Python) / BullMQ (Node) + Redis |
| Caching | Redis |

#### 6. Security & Compliance
- **Encryption** — TLS 1.3 in transit; AES-256 at rest for all audio and personal data
- **Consent Management** — Explicit, granular, revocable consent per data category
- **Anonymization** — Automated pseudonymization and anonymization pipelines
- **Audit Logging** — Full audit trail for all data access and exports
- **Regulatory Compliance** — Morocco Law 09-08 (CNDP) + GDPR-aligned practices

---

## 📁 Project Structure

```
Tkllm-darija/
├── apps/                                             # All deployable applications
│   ├── mobile/                                       # Flutter contributor app (iOS + Android)
│   │   ├── lib/
│   │   │   ├── features/                             # Feature-first structure (auth, tasks, rewards)
│   │   │   ├── shared/                               # Shared widgets, utilities, constants
│   │   │   └── main.dart
│   │   ├── assets/
│   │   └── pubspec.yaml
│   ├── web-contributor/                              # Next.js — contributor-facing web app
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── components/
│   │   └── package.json
│   ├── web-b2b/                                      # Next.js — enterprise portal & admin dashboard
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   └── api/                                          # NestJS — main application API (REST + GraphQL)
│       ├── .env
│       ├── .env.example
│       ├── package.json                              # API dependencies and scripts
│       ├── Dockerfile                                # Docker image definition for the NestJS API
│       ├── prisma/                                   # Prisma ORM schema and migrations
│       │   ├── prisma.service.ts                     # Reusable Prisma client with lifecycle hooks
│       │   ├── prisma.module.ts                      # Global Prisma module
│       │   ├── schema.prisma                         # Main database schema definition
│       │   ├── seed.ts                               # Prisma database seeder — creates realistic sample data for local development and testing
│       │   └── migrations/                           # Auto-generated Prisma migration files
│       │
│       └── src/                                      # Source code for the NestJS backend
│           ├── main.ts                               # Application bootstrap, module initialization, and global setup
│           ├── app.module.ts                         # Root module wiring all feature modules
│           ├── config/                               # Configuration files and environment validation
│           │   ├── configuration.ts                  # Global config service (using @nestjs/config)
│           │   ├── validation.schema.ts              # Joi/Zod schema for environment variables
│           │   └── swagger.ts                        # Swagger/OpenAPI configuration
│           │
│           ├── common/                               # Shared cross-cutting concerns (used globally across the API)
│           │   ├── index.ts                          # Barrel export file for all common utilities, guards, filters, interceptors, and pipes, utils
│           │   │
│           │   ├── decorators/                       # Custom decorators for controllers and handlers
│           │   │   ├── roles.decorator.ts            # Custom @Roles decorator for role-based access control (RBAC)
│           │   │   └── current-user.decorator.ts     # Extracts the authenticated user from the request context (@CurrentUser())
│           │   │   
│           │   │
│           │   ├── filters/                          # Global exception filters for consistent error handling
│           │   │   ├── all-exceptions.filter.ts      # Catches all exceptions (including runtime errors) and returns standardized error responses
│           │   │   └── http-exception.filter.ts      # Specialized filter for HttpException instances with clean formatting
│           │   │
│           │   ├── guards/                           # Authentication and authorization guards
│           │   │   ├── jwt-auth.guard.ts             # JWT authentication guard — validates Bearer token and attaches user to request
│           │   │   └── roles.guard.ts                # Role-based authorization guard — works with @Roles decorator
│           │   │   
│           │   │
│           │   ├── interceptors/                     # Request/response interceptors for cross-cutting logic
│           │   │   ├── logging.interceptor.ts        # Logs incoming requests and outgoing responses with timing and user context
│           │   │   └── audit.interceptor.ts          # Automatically creates audit log entries for mutating operations (POST, PUT, DELETE)
│           │   │
│           │   ├── pipes/                            # Custom validation and transformation pipes
│           │   │   ├── parse-uuid.pipe.ts            # Reusable pipe to validate and parse UUID strings
│           │   │   └── validation.pipe.ts            # Enhanced global ValidationPipe with whitelist, transformation, and strict settings
│           │   │   
│           │   │
│           │   └── utils/                            # Common utility functions and helpers
│           │       ├── password.utils.ts             # Password hashing and comparison utilities
│           │       └── date.utils.ts                 # Date/time helper functions (daysAgo, hoursAgo, etc.)
│           │
│           └── modules/                              # Feature-based modules (Domain-Driven Design structure)
│               ├── health/                           # Health monitoring and readiness probes
│               │   ├── health.module.ts              # Health module configuration with Terminus
│               │   └── health.controller.ts          # /health endpoint with DB, HTTP, and system health checks
│               │
│               ├── auth/                             # Authentication and authorization logic
│               │   ├── auth.module.ts                # Auth module with strategies and JWT configuration
│               │   ├── auth.service.ts               # Core auth logic (register, login, refresh, logout)
│               │   ├── auth.controller.ts            # Auth endpoints (POST /auth/register, /login, /refresh, /logout)
│               │   ├── strategies/                   # Passport.js authentication strategies
│               │   │   ├── jwt.strategy.ts           # JWT token validation strategy
│               │   │   └── local.strategy.ts         # Local (email/phone + password) strategy
│               │   └── dto/                          # Data Transfer Objects for auth operations
│               │       ├── register.dto.ts
│               │       ├── login.dto.ts
│               │       └── refresh-token.dto.ts
│               │
│               ├── user/                             # User management and profiles
│               │   ├── user.module.ts                # User module configuration
│               │   ├── user.service.ts               # User CRUD and profile management logic
│               │   ├── user.controller.ts            # User endpoints (GET /users/me, profile management)
│               │   └── dto/                          # User-related DTOs
│               │       └── update-profile.dto.ts
│               │
│               ├── task/                             # Task engine and contributor assignments
│               │   ├── task.module.ts                # Task module with assignment logic
│               │   ├── task.service.ts               # Task creation, assignment, and status management
│               │   ├── task.controller.ts            # Task endpoints (list, assign, submit)
│               │   ├── upload/
│               │   │   └── upload.controller.ts
│               │   └── dto/                          # Task-related DTOs
│               │       └── generate-upload-url.dto.ts
│               │
│               ├── quality/                          # Quality scoring, validation, and review system
│               │   ├── quality.module.ts             # Quality module configuration
│               │   ├── quality.service.ts            # Scoring engine and review workflows
│               │   ├── quality.controller.ts         # Quality review and scoring endpoints
│               │   └── dto/
│               │
│               │
│               ├── data/                             # Dataset management and ingestion
│               │   ├── data.module.ts                # Data module configuration
│               │   ├── data.service.ts               # Dataset CRUD and ingestion orchestration
│               │   ├── data.controller.ts            # Dataset endpoints and export management
│               │   └── dto/
│               │
│               └── payment/                          # Financial system: wallets, payouts, and transactions
│                   ├── payment.module.ts             # Payment and wallet module
│                   ├── payment.service.ts            # Wallet operations, payout processing, and fraud checks
│                   ├── payment.controller.ts         # Payment endpoints (balance, payout requests)
│                   └── dto/                          # Payment-related DTOs
│
├── services/                                         # Standalone background services & workers
│   ├── asr-worker/                                   # Whisper-based speech-to-text transcription worker
│   │   ├── README.md                                 # Documentation for the ASR worker service (architecture, scaling, and usage)
│   │   ├── .env                                      # Local environment variables (gitignored)
│   │   ├── .env.example                              # Template for all required environment variables
│   │   ├── package.json                              # Service dependencies and scripts (Node.js wrapper + Python worker)
│   │   ├── Dockerfile                                # Multi-stage Docker build with CUDA 12.1 support for GPU inference
│   │   ├── src/                                      # Main source code for the worker
│   │   │   ├── index.ts                              # Entry point - Kafka consumer bootstrap
│   │   │   ├── consumer.ts                           # Kafka consumer for transcription.requested topic
│   │   │   ├── processor.ts                          # Core transcription logic using Whisper
│   │   │   ├── storage.ts                            # S3/MinIO download and upload utilities
│   │   │   └── types.ts                              # Internal TypeScript interfaces
│   │   └── models/                                   # ML model management and inference layer
│   │       ├── README.md                             # Documentation for model loading, caching, and inference
│   │       ├── whisper/                              # Whisper model integration (primary ASR engine)
│   │       │   ├── loader.py                         # Python script to load and run Whisper model (supports small/large)
│   │       │   ├── requirements.txt                  # Python dependencies (faster-whisper, torch, etc.)
│   │       │   └── model_cache.py                    # Model caching and lazy loading logic
│   │       │
│   │       └── cache/                                # Local model cache directory (gitignored)
│   │           └── .gitkeep                          # Placeholder to keep directory in git
│   │
│   ├── quality-engine/                               # Quality scoring, validation, and active learning service
│   │   ├── README.md                                 # Documentation for the quality engine architecture and scaling
│   │   ├── .env                                      # Local environment variables (gitignored)
│   │   ├── .env.example                              # Template for all required environment variables
│   │   ├── package.json                              # Service dependencies and scripts
│   │   ├── Dockerfile                                # Multi-stage Docker build optimized for CPU-heavy scoring
│   │   └── src/                                      # Main source code for the quality engine
│   │       ├── index.ts                              # Entry point - Kafka consumer bootstrap
│   │       ├── consumer.ts                           # Kafka consumer for quality.review.requested topic
│   │       ├── scorer.ts                             # Core scoring logic and multi-stage review pipeline
│   │       ├── active-learning.ts                    # Active learning queue and sample selection logic
│   │       ├── storage.ts                            # S3/MinIO integration for audio and metadata
│   │       └── types.ts
│   │
│   ├── data-pipeline/                                # ETL jobs (Prefect / Dagster)
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── flows/
│   │   └── Dockerfile
│   │
│   ├── analytics-service/                           # Contributor activity, data quality & growth metrics
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── src/
│   │   └── Dockerfile
│   │
│   └── financial-service/                          # Standalone async microservice: Payouts, Contributor Wallet, Fraud Detection
│       ├── .env                                    # Environment variables (not committed)
│       ├── .env.example                            # Template for environment variables
│       ├── package.json                            # NPM package definition and scripts
│       ├── src/
│       │   ├── index.ts                            # Main entry point – bootstraps Kafka consumer and starts the orchestrator
│       │   ├── config/                             # Configuration management
│       │   │   ├── configuration.ts                # Centralized typed configuration loader
│       │   │   └── validation.schema.ts            # Schema validation (Zod) for environment variables
│       │   ├── types/                              # Core TypeScript interfaces and types
│       │   │   └── financial.types.ts              # Domain types: Payout, Transaction, FraudResult, etc.
│       │   ├── providers/                          # Payment gateway adapters for Moroccan providers
│       │   │   ├── base-provider.ts                # Abstract PaymentProvider interface
│       │   │   ├── cmi-provider.ts                 # CMI (Interbank Monetary Center) payout adapter
│       │   │   ├── orange-money-provider.ts        # Orange Money – OAuth2 + payout API
│       │   │   └── inwi-money-provider.ts          # Inwi Money adapter
│       │   ├── wallet/                             # Wallet domain logic
│       │   │   ├── wallet.service.ts               # Balance management (credit/debit/getBalance)
│       │   │   ├── ledger.service.ts               # Immutable double-entry accounting ledger
│       │   │   └── index.ts                        # Module barrel exports
│       │   ├── fraud/                              # Anti-fraud protection layer
│       │   │   ├── fraud.service.ts                # Fraud detection service (orchestrates rules)
│       │   │   ├── rules/                          # Pluggable fraud detection rules
│       │   │   │   ├── velocity.rule.ts            # Rate limiting & velocity checks
│       │   │   │   └── geo-anomaly.rule.ts         # Geo-location anomaly detection
│       │   │   └── index.ts                        # Fraud module exports
│       │   ├── events/                             # Event-driven communication via Kafka
│       │   │   ├── consumer.ts                     # Consumes payout requests and wallet events
│       │   │   └── producer.ts                     # Produces financial outcome events
│       │   └── shared/                             # Cross-cutting utilities
│       │       ├── idempotency.ts                  # Idempotent operation handling
│       │       ├── logger.ts                       # Configured Winston logger instance
│       │       └── retry.ts                        # Retry logic with exponential backoff
│       └── Dockerfile                              # Multi-stage Docker build for production deployment
│
│
├── packages/                                        # Shared internal libraries (Turborepo monorepo packages)
│   ├── types/                                       # Shared TypeScript types and interfaces used across the entire project
│   │   ├── package.json                             # Package configuration for @tkllm/types
│   │   ├── tsconfig.json                            # TypeScript configuration for the types package
│   │   └── src/
│   │       ├── index.ts                             # Main export file
│   │       ├── user.types.ts                        # User-related types and interfaces
│   │       ├── task.types.ts                        # Task and annotation related types
│   │       ├── audio.types.ts                       # Audio, transcription, and ASR-related types
│   │       ├── common.types.ts                      # Common utility types (Pagination, APIResponse, etc.)
│   │       └── index.ts                             # Barrel export file
│   │
│   ├── ui/                                          # Shared design system and reusable UI components
│   │   ├── package.json                             # Package configuration for @tkllm/ui
│   │   ├── tsconfig.json                            # TypeScript configuration
│   │   ├── src/
│   │   │   ├── index.ts                             # Main export barrel
│   │   │   ├── components/                          # Reusable React components
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   ├── DataTable/
│   │   │   │   └── DashboardLayout/
│   │   │   ├── theme/                               # Shared theme, colors, and Tailwind config
│   │   │   └── hooks/                               # Shared custom React hooks
│   │   └── README.md                                # Usage guide for the design system
│   │
│   └── validators/                                  # Shared validation schemas using Zod
│       ├── package.json                             # Package configuration for @tkllm/validators
│       ├── tsconfig.json                            # TypeScript configuration
│       ├── src/
│       │   ├── index.ts                             # Main export file
│       │   ├── auth.schema.ts                       # Validation schemas for authentication
│       │   ├── task.schema.ts                       # Task creation / submission validation
│       │   ├── audio.schema.ts                      # Audio upload and metadata validation
│       │   ├── quality.schema.ts                    # Quality review and scoring validation
│       │   └── common.schema.ts                     # Reusable common schemas (pagination, id, etc.)
│       └── README.md                                # Documentation and usage examples
│
├── ml/                                              # Machine Learning research, training, and experimentation workspace
│   ├── requirements.txt                             # Python dependencies for ML training and evaluation
│   ├── pyproject.toml                               # Project configuration (Poetry / dependency management)
│   │
│   ├── notebooks/                                   # Jupyter notebooks for interactive exploration and analysis
│   │   ├── 01_data_exploration.ipynb                # Initial data analysis, statistics, and Darija-specific insights
│   │   └── 02_asr_baseline.ipynb                    # Baseline ASR model experiments and performance analysis
│   │
│   ├── training/                                    # Training scripts and experiment configuration files
│   │   ├── train_whisper.py                         # Main training script for fine-tuning Whisper models on Darija
│   │   └── configs/                                 # Hyperparameter and model configuration files
│   │       ├── whisper_small.yaml                   # Configuration for Whisper Small model
│   │       └── whisper_large.yaml                   # Configuration for Whisper Large model
│   │
│   ├── package.json                                 # Scripts for ML orchestration and tooling (optional Node.js utilities)
│   │
│   ├── evaluation/                                  # Model evaluation and benchmarking scripts
│   │   └── evaluate_asr.py                          # ASR model evaluation (WER, CER, real-time factor, etc.)
│   │
│   ├── feature-store/                               # Reusable feature engineering components for Darija
│   │   ├── embeddings/                              # Embedding generation and storage
│   │   │   └── compute_embeddings.py
│   │   ├── speaker/                                 # Speaker identification and diarization features
│   │   │   └── speaker_features.py
│   │   └── text/                                    # Text normalization and preprocessing for Darija
│   │       └── normalize_darija.py
│   │
│   └── experiments/                                 # Experiment tracking and versioning (MLflow / Weights & Biases)
│       ├── mlflow.yaml                              # MLflow tracking server and experiment configuration
│       └── tracking/                                # Experiment run configurations and metadata
│           └── experiment_config.yaml               # Default experiment settings and tracking parameters
│
├── data/                                            # Dataset management, versioning, and ingestion pipeline
│   ├── ingestion/                                   # Scripts to ingest and process public and internal Darija datasets
│   │   ├── README.md
│   │   ├── doda_ingest.py                           # Ingestor for DODa dataset
│   │   ├── dvoice_ingest.py                         # Ingestor for DVoice speech corpus
│   │   ├── atlasia_ingest.py                        # Ingestor for AtlasIA resources
│   │   ├── config.yaml                              # Configuration for sources, paths, and processing
│   │   ├── common.py                                # Shared utilities for data downloading, cleaning, and preprocessing
│   │   └── update_summary.py                        # Updates dataset_summary.json and registry metadata after new ingestion or changes 
│   │                                                  (version tracking, statistics, lineage)
│   │
│   ├── schemas/                                     # Data contracts and annotation schemas
│   │   ├── audio_annotation.json                    # JSON Schema for audio + transcription annotation format
│   │   ├── quality_review.json                      # Schema for quality scoring and human review metadata
│   │   └── dataset_metadata.json                    # Standard metadata schema for all published datasets
│   │
│   ├── samples/                                     # Anonymized sample files for development and testing
│   │   ├── README.md                                # Documentation for sample data usage and structure
│   │   ├── audio_samples/                           # Short anonymized audio clips in Darija
│   │   │   ├── sample_001.wav                       # 8-second casual conversation sample (Casablanca accent)
│   │   │   ├── sample_002.wav                       # 12-second market negotiation sample (Marrakech accent)
│   │   │   ├── sample_003.wav                       # 6-second medical symptom description
│   │   │   └── sample_004.wav                       # Code-switched French-Darija example
│   │   │
│   │   ├── transcripts/                             # Corresponding gold-standard transcriptions
│   │   │   ├── sample_001.txt                       # Plain text transcription
│   │   │   ├── sample_002.txt
│   │   │   ├── sample_003.txt
│   │   │   └── sample_004.txt
│   │   │
│   │   ├── metadata/                                # Rich metadata for each sample
│   │   │   ├── sample_001.json                      # Speaker info, region, gender, duration, quality score, etc.
│   │   │   ├── sample_002.json
│   │   │   ├── sample_003.json
│   │   │   └── sample_004.json
│   │   │
│   │   └── dataset_summary.json                     # Overview of all samples (total count, accent distribution, domains)
│   │
│   ├── registry/                                    # Central registry and lineage tracking for datasets
│   │   ├── datasets.yaml                            # Central registry of all published datasets with version information
│   │   └── lineage/                                 # Provenance and lineage records for each dataset version
│   │       └── v1.yaml                              # Lineage metadata for version 1 (source, transformations, contributors, etc.)
│   │
│   └── versions/                                    # Versioned dataset snapshots (managed by DVC)
│       ├── v1/                                      # Version 1 snapshot (initial public datasets)
│       ├── v2/                                      # Version 2 snapshot (with additional cleaned/annotated data)
│       └── .dvc/                                    # DVC cache directory and remote pointers (tracks dataset versions)
│
├── infrastructure/
│   ├── terraform/                                   # Infrastructure-as-Code using Terraform (AWS)
│   │   ├── backend.tf                               # Remote state backend configuration (S3 + DynamoDB)
│   │   ├── main.tf                                  # Root entry point - calls shared config and environment-specific modules
│   │   ├── outputs.tf                               # Root-level outputs (cluster endpoint, database URLs, bucket names, etc.)
│   │   ├── providers.tf                             # AWS provider configuration (can be moved to shared/ later)
│   │   ├── terraform.tfvars.example                 # Example variable file (never commit real values)
│   │   ├── variables.tf                             # Global input variables (project_name, region, environment, etc.)
│   │   ├── versions.tf                              # Terraform and provider version constraints
│   │   │
│   │   ├── modules/                                 # Reusable Terraform modules (core building blocks of the infrastructure)
│   │   │   ├── vpc/
│   │   │   │   ├── main.tf                          # Main VPC configuration (subnets, route tables, Internet Gateway, NAT Gateways)
│   │   │   │   ├── variables.tf                     # Input variables for VPC (CIDR, AZs, environment, etc.)
│   │   │   │   ├── outputs.tf                       # VPC ID, subnet IDs, NAT Gateway IDs, and other useful outputs
│   │   │   │   └── README.md                        # Module documentation and usage examples
│   │   │   │
│   │   │   ├── iam/
│   │   │   │   ├── main.tf                          # IAM roles, policies, and IRSA (IAM Roles for Service Accounts) setup
│   │   │   │   ├── variables.tf                     # Variables for IAM role configuration
│   │   │   │   ├── outputs.tf                       # Output IAM role ARNs for EKS, S3, Secrets Manager, etc.
│   │   │   │   └── README.md                        # IAM module documentation
│   │   │   │
│   │   │   ├── eks/
│   │   │   │   ├── main.tf                          # EKS cluster, node groups (including GPU nodes for ASR), and addons
│   │   │   │   ├── variables.tf                     # EKS-specific variables (cluster version, node size, GPU settings, etc.)
│   │   │   │   ├── outputs.tf                       # EKS cluster endpoint, security group IDs, OIDC provider, etc.
│   │   │   │   └── README.md                        # EKS module documentation
│   │   │   │
│   │   │   ├── ecr/                                 # ECR repositories for Docker images (API, workers, etc.)
│   │   │   │   ├── main.tf                          # Creates and configures ECR repositories for API, ASR worker, data-pipeline, other services
│   │   │   │   ├── variables.tf                     # Input variables for repository names, image scanning, lifecycle policies,encryption settings
│   │   │   │   ├── outputs.tf                       # Outputs repository URLs, ARNs, and repository names for use in CI/CD pipelines
│   │   │   │   └── README.md                        # Documentation for the ECR module
│   │   │   │
│   │   │   ├── rds/
│   │   │   │   ├── main.tf                          # RDS PostgreSQL instance with TimescaleDB extension
│   │   │   │   ├── variables.tf                     # Database configuration variables (instance class, storage, multi-AZ, etc.)
│   │   │   │   ├── outputs.tf                       # Database endpoint, connection string, security group ID
│   │   │   │   └── README.md                        # RDS module documentation
│   │   │   │
│   │   │   ├── elasticache/                         # Redis cluster via AWS ElastiCache
│   │   │   │   ├── main.tf                          # ElastiCache Redis cluster and replication group configuration
│   │   │   │   ├── variables.tf                     # Redis settings (node type, engine version, replication, etc.)
│   │   │   │   ├── outputs.tf                       # Redis endpoint and connection details
│   │   │   │   └── README.md                        # ElastiCache module documentation
│   │   │   │
│   │   │   ├── msk/                                 # Kafka cluster via Amazon MSK
│   │   │   │   ├── main.tf                          # MSK cluster, broker configuration, and security settings
│   │   │   │   ├── variables.tf                     # Kafka configuration variables
│   │   │   │   ├── outputs.tf                       # Bootstrap brokers and MSK connection details
│   │   │   │   └── README.md                        # MSK (Kafka) module documentation
│   │   │   │
│   │   │   ├── s3/
│   │   │   │   ├── main.tf                          # S3 buckets for audio, datasets, models, exports, and backups
│   │   │   │   ├── variables.tf                     # Bucket configuration and lifecycle policies
│   │   │   │   ├── outputs.tf                       # Bucket names and ARNs
│   │   │   │   └── README.md                        # S3 module documentation
│   │   │   │
│   │   │   ├── ssm/
│   │   │   │   ├── main.tf                          # Manages AWS Systems Manager (SSM) Parameter Store resources 
│   │   │   │   ├── variables.tf                     # Input variables for SSM parameters (naming convention, parameter types, and values)
│   │   │   │   ├── outputs.tf                       # Outputs SSM parameter ARNs and names for use in other modules
│   │   │   │   └── README.md                        # Documentation for the SSM module (usage, parameter hierarchy, and security recommendations)
│   │   │   │
│   │   │   ├── cloudflare/
│   │   │   │   ├── main.tf                          # Configures Cloudflare resources (DNS records, zones, SSL/TLS settings, and page rules)
│   │   │   │   ├── variables.tf                     # Variables for Cloudflare zone, domain, DNS records, and security settings
│   │   │   │   ├── outputs.tf                       # Outputs Cloudflare zone ID, DNS record details, and other useful values
│   │   │   │   └── README.md                        # Documentation for the Cloudflare module (DNS management and CDN configuration)
│   │   │   │
│   │   │   └── monitoring/                          # CloudWatch alarms, log groups, and SNS topics for alerting
│   │   │       ├── main.tf                          # Creates CloudWatch metric alarms, log groups,SNS topics for monitoring and notifications	
│   │   │       ├── variables.tf                     # Input variables for alarm thresholds, SNS topics, and notification settings
│   │   │       ├── outputs.tf                       # Outputs SNS topic ARNs, alarm names, and monitoring resources
│   │   │       └── README.md
│   │   │
│   │   ├── shared/                                  # Shared configurations (recommended for maintainability)
│   │   │   ├── providers.tf                         # Common provider blocks
│   │   │   ├── backend.tf                           # Remote state backend (S3 + DynamoDB locking)
│   │   │   ├── versions.tf                          # Terraform + provider versions
│   │   │   └── data.tf                              # Common data sources
│   │   │
│   │   ├── environments/                            # Environment-specific configurations
│   │   │   ├── dev/
│   │   │   │   ├── main.tf                          # Calls root modules with dev-specific values
│   │   │   │   ├── variables.tf
│   │   │   │   ├── terraform.tfvars                 # Dev variable values (smaller instances, etc.)
│   │   │   │   ├── outputs.tf
│   │   │   │   └── backend.tf                       # Dev-specific state backend
│   │   │   │
│   │   │   ├── staging/
│   │   │   │   ├── main.tf                          # calls shared modules with staging-specific values
│   │   │   │   ├── variables.tf                     # Variable definitions specific to the staging environment
│   │   │   │   ├── terraform.tfvars                 # Actual variable values for staging (medium-sized resources, etc)
│   │   │   │   ├── outputs.tf                       # Staging-specific outputs (endpoints, resource ARNs,etc.)
│   │   │   │   └── backend.tf                       # Remote state backend configuration for the staging environment.
│   │   │   │
│   │   │   └── prod/
│   │   │       ├── main.tf                          # Orchestrates all Terraform modules with production-grade
│   │   │       ├── variables.tf                     # Variable definitions specific to the production environment
│   │   │       ├── terraform.tfvars                 # Production values (larger resources,stricter security)
│   │   │       ├── outputs.tf                       # Production environment outputs
│   │   │       └── backend.tf                       # Remote state backend configuration
│   │   │
│   │   └── scripts/                                 # Helper scripts for common Terraform workflows
│   │       ├── init.sh                              # Wrapper for terraform init
│   │       ├── plan.sh                              # Wrapper for terraform plan with proper workspace
│   │       ├── apply.sh                             # Wrapper for terraform apply
│   │       └── destroy.sh                           # Wrapper for terraform destroy (with confirmation)
│   │
│   ├── k8s/                                         # Kubernetes manifests (deployment, scaling, networking, security)                             
│   │   ├── base/                                    # Environment-agnostic base resources (shared across all environments)
│   │   │   ├── kustomization.yaml                   # Root Kustomize file aggregating all base resources
│   │   │   ├── namespace.yaml                       # Defines the tkllm-darija namespace
│   │   │   ├── rbac/                                # Role-Based Access Control (security & permissions)
│   │   │   │   └── rbac.yaml                        # ServiceAccounts, Roles, ClusterRoles, IRSA bindings (AWS IAM integration)
│   │   │   │
│   │   │   ├── network-policies/                    # Zero-trust networking rules
│   │   │   │   └── default-deny.yaml                # Deny all traffic by default, allow only explicit service communication
│   │   │   │
│   │   │   ├── storage/                             # Persistent storage configuration
│   │   │   │   └── pvcs.yaml                        # PersistentVolumeClaims for databases, caches, and ML storage
│   │   │   │
│   │   │   ├── configmaps/                          # Non-sensitive configuration shared across services
│   │   │   │   ├── common.yaml                      # Shared configs (Kafka topics, feature flags, thresholds)
│   │   │   │   ├── api.yaml                         # API-specific settings (CORS, rate limits, feature toggles)
│   │   │   │   └── ml.yaml                          # ML configs (ASR models, MLflow, Prefect, DVC settings)
│   │   │   │
│   │   │   ├── secrets/                             # Sensitive configuration management
│   │   │   │   ├── secret-template.yaml             # Template with placeholder values (for documentation/reference)
│   │   │   │   └── external-secrets.yaml            # ExternalSecret CRs (pull secrets from AWS SSM / Secrets Manager)
│   │   │   │
│   │   │   ├── statefulsets/                        # Stateful infrastructure services (require persistent storage)
│   │   │   │   ├── postgres/                        # PostgreSQL / TimescaleDB database
│   │   │   │   │   ├── infrastructure.yaml          # Database StatefulSet (persistent identity + storage)
│   │   │   │   │   ├── service.yaml                 # Internal service for database access
│   │   │   │   │   └── kustomization.yaml           # Kustomize config for PostgreSQL resources                                            
│   │   │   │   ├── redis/                           # Redis (cache + queue backend)
│   │   │   │   │   ├── infrastructure.yaml          # Redis StatefulSet with resource limits and persistence
│   │   │   │   │   ├── service.yaml                 # ClusterIP Service exposing Redis on port 6379
│   │   │   │   │   ├── kustomization.yaml           # Kustomize file to combine resources and inject secrets
│   │   │   │   ├── kafka/                           # Kafka (event streaming platform)
│   │   │   │   │   ├── infrastructure.yaml          # Kafka StatefulSet with broker configuration
│   │   │   │   │   ├── service.yaml                 # Headless Service for Kafka brokers
│   │   │   │   │   ├── kustomization.yaml           # Kustomize configuration for Kafka
│   │   │   │   └── weaviate/                        # Vector database for embeddings / semantic search
│   │   │   │       ├── infrastructure.yaml          # Weaviate StatefulSet with persistent storage
│   │   │   │       ├── service.yaml                 # ClusterIP Service exposing Weaviate (HTTP + gRPC)
│   │   │   │       └── kustomization.yaml           # Kustomize file for Weaviate resources
│   │   │   │
│   │   │   ├── deployments/                         # Stateless application and worker services
│   │   │   │   ├── api/                             # Main backend API (NestJS)
│   │   │   │   │   ├── apps.yaml                    # API deployment (pods, containers, env config)
│   │   │   │   │   ├── service.yaml                 # ClusterIP service exposing API internally
│   │   │   │   │   ├── hpa.yaml                     # Horizontal Pod Autoscaler (CPU/memory-based scaling)
│   │   │   │   │   └── pdb.yaml                     # PodDisruptionBudget (ensures minimum availability during updates)
│   │   │   │   │
│   │   │   │   ├── asr-worker/                      # Speech-to-text worker (GPU-enabled if needed)
│   │   │   │   │   ├── deployment.yaml              # Worker deployment (batch/queue processing)
│   │   │   │   │   └── keda.yaml                    # KEDA autoscaling based on Kafka lag or queue size
│   │   │   │   │
│   │   │   │   ├── web-contributor/                 # Contributor-facing web app (Next.js)
│   │   │   │   │   ├── deployment.yaml              # Kubernetes Deployment for the Next.js contributor web application (.. requests/limits) 
│   │   │   │   │   ├── service.yaml                 # ClusterIP Service to expose the contributor web app internally within the cluster
│   │   │   │   │   ├── hpa.yaml                     # Horizontal Pod Autoscaler (HPA) to automatically scale based on CPU/memory usage
│   │   │   │   │   └── pdb.yaml                     # PodDisruptionBudget to ensure minimum availability during voluntary disruptions
│   │   │   │   │
│   │   │   │   ├── web-b2b/                         # Enterprise dashboard (Next.js)
│   │   │   │   │   └── deployment.yaml     
│   │   │   │   │
│   │   │   │   ├── quality-engine/                  # Data validation and scoring service
│   │   │   │   │   ├── deployment.yaml              # K.D for the quality engine (data validation, scoring, and active learning logic)
│   │   │   │   │   ├── service.yaml                 # C.S to expose the quality engine internally for other services to submit validation tasks
│   │   │   │   │   └── hpa.yaml                     # Ho.Pod.Auto to scale based on CPU/memory or custom metrics (e.g., task queue length)
│   │   │   │   │
│   │   │   │   ├── data-pipeline/                   # ETL and dataset processing service
│   │   │   │   │   ├── deployment.yaml              # Kubernetes Deployment for the data pipeline service
│   │   │   │   │   └── service.yaml                 # ClusterIP Service for internal communication with the pipeline
│   │   │   │   │
│   │   │   │   ├── financial-service/               # Payments, wallet, and fraud detection
│   │   │   │   │   ├── deployment.yaml              # Kubernetes Deployment for the financial service
│   │   │   │   │   ├── service.yaml                 # ClusterIP Service exposing the financial service
│   │   │   │   │   ├── hpa.yaml                     # Horizontal Pod Autoscaler for the financial service
│   │   │   │   │   └── pdb.yaml                     # Payments must survive node drains
│   │   │   │   │
│   │   │   │   └── analytics-service/               # Metrics, user activity, and data insights
│   │   │   │       ├── deployment.yaml              # Kubernetes Deployment for the financial service
│   │   │   │       └── service.yaml                 # ClusterIP Service exposing the financial service
│   │   │   │       
│   │   │   │
│   │   │   └── ingress/                             # External access configuration
│   │   │       └── ingress.yaml                     # NGINX ingress with TLS (cert-manager / Let's Encrypt)
│   │   │   
│   │   │   
│   │   │
│   │   ├── overlays/                                # Environment-specific overrides and customizations
│   │   │   ├── dev/                                 # Development environment (local / testing)
│   │   │   │   ├── kustomization.yaml               # Extends base + applies dev-specific patches
│   │   │   │   ├── patch-configmap.yaml             # 
│   │   │   │   ├── patch-image.yaml                 # Use dev/latest image tags
│   │   │   │   ├── patch-replicas.yaml
│   │   │   │   ├── patch-resources.yaml             # Lower CPU/memory limits for dev
│   │   │   │   ├── patch-secrets.yaml
│   │   │   │   └── keda/                            # Optional autoscaling config for development
│   │   │   │       └── scaledobject-dev.yaml  
│   │   │   │   
│   │   │   ├── staging/                             # Pre-production environment
│   │   │   │   ├── kustomization.yaml               # Extends base with staging configs
│   │   │   │   ├── patch-configmap.yaml 
│   │   │   │   ├── patch-resources.yaml 
│   │   │   │   └── patch-replicas.yaml              # Adjust replica counts for staging validation
│   │   │   │ 
│   │   │   └── prod/                                # Production environment
│   │   │       ├── kustomization.yaml               # Extends base with production-ready configs
│   │   │       ├── patch-configmap.yaml 
│   │   │       ├── patch-resources.yaml             # Higher resource limits and stricter constraints
│   │   │       ├── patch-hpa.yaml                   # Production autoscaling rules
│   │   │       └── network-policies/                # Enhanced security rules (restricted traffic)
│   │   │           ├── egress-api.yaml
│   │   │           ├── egress-financial.yaml
│   │   │           └── ingress-strict.yaml 
│   │   │     
│   │   └── components/                              # Reusable Kustomize components (advanced DRY configuration)
│   │       ├── kustomization.yaml                   # Root Kustomize file that aggregates all reusable components
│   │       │
│   │       ├── common-limits/                       # Common resource limits and requests for containers, pods, and PVCs
│   │       │   ├── kustomization.yaml               # Kustomize config to export the common limits component
│   │       │   └── common-limits.yaml               # LimitRange definition (default/min/max requests & limits for CPU, memory, storage)
│   │       │
│   │       ├── quota-dev/                           # ResourceQuota tailored for development environment (relaxed limits)
│   │       │   ├── kustomization.yaml               # Kustomize config for dev quota component
│   │       │   └── quota.yaml                       # ResourceQuota for dev (compute, GPU, storage, and object counts)
│   │       │
│   │       ├── quota-staging/                       # ResourceQuota tailored for staging environment
│   │       │   ├── kustomization.yaml               # Kustomize config for staging quota component
│   │       │   └── quota.yaml                       # ResourceQuota for staging (moderate limits)
│   │       │
│   │       ├── quota-prod/                          # ResourceQuota tailored for production environment (strict + high availability)
│   │       │   ├── kustomization.yaml               # Kustomize config for production quota component
│   │       │   └── quota.yaml                       # ResourceQuota for prod (compute, GPU, storage, services, and pods)
│   │       │
│   │       └── pod-security/                        # Pod Security Standards and security policies
│   │           ├── kustomization.yaml               # Kustomize config to export pod security policies
│   │           └── pod-security.yaml                # PodSecurityPolicy / Pod Security Admission configuration (restricted, baseline, privileged)
│   │
│   ├── docker/                                      # Local development environment
│   │   ├── docker-compose.yml                       # Main local stack (PostgreSQL, Redis, MinIO, Kafka, MailHog, pgAdmin, etc.)
│   │   ├── .env                                     # Local environment variables
│   │   ├── .env.example                             # Template for all environment variables
│   │   │
│   │   ├── init-scripts/                            # Initialization scripts executed automatically on container startup
│   │   │   ├── postgres/
│   │   │   │   └── 01_extensions.sql                # Enables pg_trgm, uuid-ossp, pgcrypto, TimescaleDB, etc.
│   │   │   │
│   │   │   └── pgadmin/
│   │   │       └── servers.json                     # Pre-configures pgAdmin to connect to local DB
│   │   │
│   │   ├── minio/
│   │   │   └── buckets.json                         # Auto-creates buckets on startup (tkllm-audio, tkllm-datasets, etc.)
│   │   │
│   │   └── nginx/                                   # Optional local reverse proxy configuration
│   │       ├── nginx.conf                           # Main NGINX configuration file for local routing and SSL termination
│   │       ├── docker-compose.nginx.yml             # Additional Docker Compose override file for NGINX service
│   │       └── README.md                            # Instructions on how to enable and use the local NGINX proxy   
│   │
│   ├── monitoring/                                  # Observability stack configuration (Prometheus + Grafana)
│   │   ├── prometheus/
│   │   │   ├── prometheus.yml                       # Scraping configuration for all services
│   │   │   │
│   │   │   └── rules/                               # Prometheus alerting and recording rules
│   │   │       ├── api.yml                          # Alerting rules for the main NestJS API (error rates, latency, request volume, etc.)
│   │   │       ├── infrastructure.yml               # Rules for core infrastructure (Postgres, Redis, Kafka, MinIO health & performance)
│   │   │       ├── ml.yml                           # Rules for ML/ASR worker (transcription queue depth, model inference latency, GPU utilization)
│   │   │       ├── financial.yml                    # Rules for financial service (payment success rate, payout failures, fraud detection alerts)
│   │   │       └── slo.yml                          # Service Level Objective (SLO) rules and burn rate calculations for reliability monitoring
│   │   │
│   │   └── grafana/
│   │       ├── provisioning/                        # Auto-provisioning configuration (applied on Grafana startup)
│   │       │   ├── datasources/
│   │       │   │   └── prometheus.yml               # Data source configuration that automatically connects Grafana to Prometheus
│   │       │   │
│   │       │   └── dashboards/
│   │       │       └── default.yml                  # Dashboard provisioning manifest - defines which dashboards to load automatically
│   │       │
│   │       └── dashboards/                          # Actual Grafana dashboard definitions (JSON files)
│   │           ├── api-overview.json                # Main dashboard for NestJS API metrics (requests, latency, errors, throughput)
│   │           ├── infrastructure.json              # Infrastructure overview (PostgreSQL, Redis, Kafka, MinIO health and performance)
│   │           ├── ml-pipeline.json                 # ML & ASR pipeline dashboard (transcription jobs, GPU usage, model latency, queue depth)
│   │           └── business.json                    # Business & financial metrics (contributor activity, payouts, data quality, growth KPIs)
│   │
│   ├── messaging/                                   # Async communication & event-driven setup
│   │   ├── kafka/
│   │   │   ├── topics.yml                           # Definition of all Kafka topics
│   │   │   └── consumer-groups.yml                  # Consumer group configurations
│   │   │
│   │   └── queues/                                  # Job queue definitions (BullMQ / Redis-based queues)
│   │       └── schemas/                             # JSON schemas for queue job payloads (used for validation and documentation)
│   │           ├── audio-upload.schema.json         # Schema for audio upload jobs (file metadata, contributor info, etc.)
│   │           ├── quality-review.schema.json       # Schema for data quality review and validation tasks
│   │           └── transcription.schema.json        # Schema for speech-to-text transcription jobs (audio reference, model settings, etc.)
│   │
│   └── scripts/                                     # Infrastructure-related helper scripts
│        ├── db-reset.sh                             # Reset and clean the local PostgreSQL database (drops and recreates schema + runs migrations)
│        ├── health-check.sh                         # Perform health checks on all local services (API, Postgres, Redis, Kafka, MinIO, etc.)
│        ├── k8s-deploy.sh                           # Deploy Kubernetes resources using Kustomize (supports dev/staging/prod environments)
│        ├── rotate-secrets.sh                       # Rotate sensitive secrets and regenerate environment-specific credentials
│        ├── seed-kafka-topics.sh                    # Create and configure all required Kafka topics with proper partitions and replication
│        ├── seed-minio-buckets.sh                   # Create and configure all necessary MinIO/S3 buckets with correct policies
│        └── setup-local.sh                          # One-command setup for local environment 
│
├── docs/                                            # Architecture decisions, API docs, guides
├── scripts/                                         # Dev utilities & automation
├── .github/
│   └── workflows/                                   # CI/CD pipelines
│        └── ml.yml    
├── README.md
├── .gitignore
├── .gitattributes
├──.env.example
├──.env
├── CONTRIBUTING.md
├── tsconfig.json
├── package.json                                     # Root workspace configuration
├── turbo.json                                       # Turborepo monorepo config
└── LICENSE
```

---

## 🏁 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20+ |
| Flutter | 3.24+ |
| Python | 3.12+ |
| Docker & Docker Compose | Latest stable |
| Turborepo | Latest (`npm i -g turbo`) |
| PostgreSQL, Redis, MinIO | Via Docker (recommended) |

### 1. Clone the Repository

```bash
git clone https://github.com/biko2020/Tkllm-darija
cd Tkllm-darija
```

### 2. Start the Local Development Stack

The recommended approach uses Docker Compose to spin up all services:

```bash
docker-compose up -d
```

### 3. Mobile App Setup

```bash
cd apps/mobile
flutter pub get
flutter run
```

### 4. Web Apps & API Setup

```bash
# Install dependencies across all apps (requires Turborepo)
npx turbo install

# Run contributor web app
cd apps/web-contributor && npm run dev

# Run B2B portal
cd apps/web-b2b && npm run dev

# Run API
cd apps/api && npm run start:dev
```

See [`docs/local-setup.md`](docs/local-setup.md) for detailed instructions, environment variable configuration, and database seeding.

---

## 🤖 ML Workspace Setup (`ml/`)

The `ml/` directory contains all Machine Learning research, training, and experiment code for ASR and NLP.

### ML Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.12+ |
| CUDA | 12.1+ (for GPU training) |
| Node.js | 20+ (for optional tooling) |

### 1. Install Python Dependencies

```bash
cd ml
python -m pip install --upgrade pip
pip install -r requirements.txt
# For GPU: pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cu121
```

### 2. (Optional) Install Node.js Tooling

For code formatting and orchestration scripts:

```bash
cd ml
npm install
# Run Prettier
npx prettier --check .
```

### 3. Run ML Scripts

Common scripts are defined in `ml/package.json`:

```bash
# Lint, format, and type-check Python code
npm run lint

# Run all tests
npm test

# Train Whisper model
npm run train:whisper

# Evaluate ASR model
npm run evaluate:asr

# Compute audio/text embeddings
npm run embeddings:audio
npm run embeddings:text
```

### 4. ML CI/CD

ML code is automatically linted, tested, and trained on every push/PR via GitHub Actions:

- See `.github/workflows/ml.yml` for details.

---

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Flutter 3.24+ |
| Contributor Web App | Next.js 15 + TypeScript + Tailwind CSS |
| B2B Enterprise Portal | Next.js 15 + TypeScript + Tailwind CSS |
| Backend API | NestJS (TypeScript) — REST + GraphQL |
| Shared Libraries | Turborepo monorepo — types, UI, validators |
| Database | PostgreSQL + TimescaleDB + Redis |
| Object Storage | S3-compatible (Cloudflare R2 / MinIO / AWS S3) |
| ML / ASR | Hugging Face Transformers, Whisper, wav2vec 2.0 |
| ML Experimentation | Jupyter, MLflow / Weights & Biases |
| Feature Store | Custom (embeddings, speaker features, normalized text) |
| Dataset Versioning | DVC + LakeFS — registry, lineage, versioned snapshots |
| Async Messaging | Kafka + BullMQ / Redis queues |
| Analytics | Custom analytics service — contributor & data quality metrics |
| Financial | CMI, Orange Money, Inwi Money — wallet + fraud detection |
| Orchestration | Kubernetes / Docker Compose |
| Monitoring | Prometheus + Grafana + Sentry |

---

## 📜 License

The open-source community edition of Tkllm-darija is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

Commercial B2B data service features and enterprise deployments are available under a **separate commercial license**. Please contact the author for details.

---

## 🤝 Contributing

Contributions from the Moroccan developer and AI community are warmly welcome.

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines on submitting issues, pull requests, and dataset contributions. Join the conversation on the project's GitHub repository.

---

*Made with ❤️ for Morocco's linguistic heritage and the future of inclusive AI.*

---

## 👤 Author

**Brahim Ait Oufkir**
*Data Engineer · Big Data Developer · Full Stack Developer*

[![Email](https://img.shields.io/badge/Email-aitoufkirbrahimab%40gmail.com-red?logo=gmail)](mailto:aitoufkirbrahimab@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-brahim--ait--oufkir-blue?logo=linkedin)](https://linkedin.com/in/brahim-ait-oufkir)
[![GitHub](https://img.shields.io/badge/GitHub-biko2020-black?logo=github)](https://github.com/biko2020)

---

> 📌 **Note:** This README is designed to serve developers, contributors, and potential B2B partners. It positions Tkllm-darija as both a community-driven initiative and a serious commercial data platform.