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
├── apps/                              # All deployable applications
│   ├── mobile/                        # Flutter contributor app (iOS + Android)
│   │   ├── lib/
│   │   │   ├── features/              # Feature-first structure (auth, tasks, rewards)
│   │   │   ├── shared/               # Shared widgets, utilities, constants
│   │   │   └── main.dart
│   │   ├── assets/
│   │   └── pubspec.yaml
│   ├── web-contributor/               # Next.js — contributor-facing web app
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   ├── web-b2b/                       # Next.js — enterprise portal & admin dashboard
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   └── api/                           # NestJS — main application API (REST + GraphQL)
│       ├── src/
│       │   ├── modules/               # user, task, data, quality, auth
│       │   ├── common/                # guards, interceptors, filters, pipes
│       │   ├── config/
│       │   └── main.ts
│       ├── prisma/                    # Schema & migrations
│       └── Dockerfile
│
├── services/                          # Standalone background services & workers
│   ├── asr-worker/                    # Whisper / wav2vec transcription worker
│   │   ├── src/
│   │   ├── models/
│   │   └── Dockerfile
│   ├── data-pipeline/                 # ETL jobs (Prefect / Dagster)
│   │   ├── flows/
│   │   └── Dockerfile
│   ├── quality-engine/                # Scoring, validation & active learning
│   │   ├── src/
│   │   └── Dockerfile
│   ├── analytics-service/             # Contributor activity, data quality & growth metrics
│   │   ├── src/
│   │   └── Dockerfile
│   └── financial-service/             # Payouts, wallet system, fraud detection
│       ├── src/
│       │   ├── providers/             # CMI, Orange Money, Inwi Money adapters
│       │   ├── wallet/                # Contributor wallet & balance management
│       │   └── fraud/                 # Fraud detection rules & monitoring
│       └── Dockerfile
│
├── packages/                          # Shared internal libraries (monorepo)
│   ├── types/                         # Shared TypeScript types & interfaces
│   ├── ui/                            # Shared design system components
│   └── validators/                    # Shared validation schemas (Zod)
│
├── ml/                                # ML research & model development
│   ├── notebooks/                     # Jupyter notebooks for exploration & analysis
│   ├── training/                      # Training scripts & experiment configs
│   ├── evaluation/                    # Benchmark & evaluation scripts
│   ├── feature-store/                 # Reusable ML features (embeddings, speaker features, normalized text)
│   │   ├── embeddings/
│   │   ├── speaker/
│   │   └── text/
│   └── experiments/                   # Experiment tracking (MLflow / Weights & Biases)
│       ├── tracking/                  # Run configs, metrics, artifact pointers
│       └── mlflow.yaml                # or wandb config
│
├── data/                              # Dataset management & versioning
│   ├── ingestion/                     # Scripts to pull DODa, DVoice, AtlasIA, etc.
│   ├── schemas/                       # Annotation schemas & data contracts
│   ├── samples/                       # Anonymized samples for dev & testing
│   ├── registry/                      # Dataset versions, metadata & lineage tracking
│   │   ├── datasets.yaml              # Central registry of all published datasets
│   │   └── lineage/                   # Provenance records per dataset version
│   └── versions/                      # Versioned dataset snapshots (DVC / LakeFS managed)
│       ├── v1/
│       ├── v2/
│       └── .dvc/                      # DVC cache & remote pointers
│
├── infrastructure/
│   ├── terraform/                     # Infrastructure-as-Code (cloud resources)
│   ├── k8s/                           # Kubernetes manifests
│   ├── messaging/                     # Async communication layer between API & workers
│   │   ├── kafka/                     # Kafka topics & consumer group configs
│   │   └── queues/                    # BullMQ / Redis queue definitions & job schemas
│   └── docker/                        # Dockerfiles & Docker Compose files
│       └── docker-compose.yml         # Local development stack
│
├── docs/                              # Architecture decisions, API docs, guides
├── scripts/                           # Dev utilities & automation
├── .github/
│   └── workflows/                     # CI/CD pipelines
├── README.md
├── .gitignore
├── CONTRIBUTING.md
├── turbo.json                         # Turborepo monorepo config
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