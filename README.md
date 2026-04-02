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
├── apps/                                              # All deployable applications
│   ├── mobile/                                        # Flutter contributor app (iOS + Android)
│   │   ├── lib/
│   │   │   ├── features/                              # Feature-first structure (auth, tasks, rewards)
│   │   │   ├── shared/                                # Shared widgets, utilities, constants
│   │   │   └── main.dart
│   │   ├── assets/
│   │   └── pubspec.yaml
│   ├── web-contributor/                               # Next.js — contributor-facing web app
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── components/
│   │   └── package.json
│   ├── web-b2b/                                       # Next.js — enterprise portal & admin dashboard
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   └── api/                                           # NestJS — main application API (REST + GraphQL)
│       ├── .env
│       ├── .env.example
│       ├── package.json
│       ├── src/
│       │   ├── modules/                               # user, task, data, quality, auth
│       │   ├── common/                                # guards, interceptors, filters, pipes
│       │   ├── config/
│       │   └── main.ts
│       ├── prisma/                                    # Schema & migrations
│       └── Dockerfile
│
├── services/                                          # Standalone background services & workers
│   ├── asr-worker/                                    # Whisper / wav2vec transcription worker
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── src/
│   │   ├── models/
│   │   └── Dockerfile
│   ├── data-pipeline/                                 # ETL jobs (Prefect / Dagster)
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── flows/
│   │   └── Dockerfile
│   ├── quality-engine/                                # Scoring, validation & active learning
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── src/
│   │   └── Dockerfile
│   ├── analytics-service/                            # Contributor activity, data quality & growth metrics
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── src/
│   │   └── Dockerfile
│   └── financial-service/                            # Payouts, wallet system, fraud detection
│       ├── .env
│       ├── .env.example
│       ├── package.json
│       ├── src/
│       │   ├── providers/                            # CMI, Orange Money, Inwi Money adapters
│       │   ├── wallet/                               # Contributor wallet & balance management
│       │   └── fraud/                                # Fraud detection rules & monitoring
│       └── Dockerfile
│
├── packages/                                         # Shared internal libraries (monorepo)
│   ├── types/                                        # Shared TypeScript types & interfaces
│   │   └── package.json
│   ├── ui/                                           # Shared design system components
│   │   └── package.json
│   └── validators/                                   # Shared validation schemas (Zod)
│       └── package.json
│
├── ml/                                               # ML research & model development
│   ├── notebooks/                                    # Jupyter notebooks for exploration & analysis
│   ├── training/                                     # Training scripts & experiment configs
│   ├── package.json                                  # Python/Conda or Node-based ML orchestration
│   ├── evaluation/                                   # Benchmark & evaluation scripts
│   ├── feature-store/                                # Reusable ML features (embeddings, speaker features, normalized text)
│   │   ├── embeddings/
│   │   ├── speaker/
│   │   └── text/
│   └── experiments/                                  # Experiment tracking (MLflow / Weights & Biases)
│       ├── tracking/                                 # Run configs, metrics, artifact pointers
│       └── mlflow.yaml                               # or wandb config
│
├── data/                                             # Dataset management & versioning
│   ├── ingestion/                                    # Scripts to pull DODa, DVoice, AtlasIA, etc.
│   ├── schemas/                                      # Annotation schemas & data contracts
│   ├── samples/                                      # Anonymized samples for dev & testing
│   ├── registry/                                     # Dataset versions, metadata & lineage tracking
│   │   ├── datasets.yaml                             # Central registry of all published datasets
│   │   └── lineage/                                  # Provenance records per dataset version
│   └── versions/                                     # Versioned dataset snapshots (DVC / LakeFS managed)
│       ├── v1/
│       ├── v2/
│       └── .dvc/                                     # DVC cache & remote pointers
│
├── infrastructure/
│   ├── terraform/                                    # Infrastructure-as-Code for cloud (AWS/GCP/DO/etc.)
│   │   ├── modules/                                  # Reusable Terraform modules for infrastructure components
│   │   │   ├── vpc/                                  # VPC, subnets, internet gateways, NAT gateways
│   │   │   │   ├── main.tf                           # VPC module definition
│   │   │   │   ├── variables.tf                      # Input variables for VPC configuration
│   │   │   │   ├── outputs.tf                        # Output values from VPC module
│   │   │   │   └── README.md                         # Documentation for VPC module
│   │   │   ├── eks/                                  # Amazon EKS cluster and node groups
│   │   │   │   ├── main.tf                           # EKS cluster configuration
│   │   │   │   ├── variables.tf                      # EKS-specific variables
│   │   │   │   ├── outputs.tf                        # EKS outputs (cluster endpoint, etc.)
│   │   │   │   └── README.md                         # EKS module documentation
│   │   │   ├── rds/                                  # Amazon RDS PostgreSQL instance
│   │   │   │   ├── main.tf                           # RDS instance and parameter groups
│   │   │   │   ├── variables.tf                      # Database configuration variables
│   │   │   │   ├── outputs.tf                        # Database connection outputs
│   │   │   │   └── README.md                         # RDS module docs
│   │   │   ├── s3/                                   # S3 buckets for object storage
│   │   │   │   ├── main.tf                           # Bucket creation and policies
│   │   │   │   ├── variables.tf                      # Bucket configuration variables
│   │   │   │   ├── outputs.tf                        # Bucket names and ARNs
│   │   │   │   └── README.md                         # S3 module documentation
│   │   │   ├── redis/                                # ElastiCache Redis cluster
│   │   │   │   ├── main.tf                           # Redis cluster configuration
│   │   │   │   ├── variables.tf                      # Redis settings
│   │   │   │   ├── outputs.tf                        # Redis endpoints
│   │   │   │   └── README.md                         # Redis module docs
│   │   │   ├── kafka/                                # Amazon MSK Kafka cluster
│   │   │   │   ├── main.tf                           # MSK cluster setup
│   │   │   │   ├── variables.tf                      # Kafka configuration
│   │   │   │   ├── outputs.tf                        # Bootstrap servers
│   │   │   │   └── README.md                         # Kafka module documentation
│   │   │   └── monitoring/                           # CloudWatch, Prometheus, and alerting
│   │   │       ├── main.tf                           # Monitoring resources
│   │   │       ├── variables.tf                      # Monitoring variables
│   │   │       ├── outputs.tf                        # Monitoring outputs
│   │   │       └── README.md                         # Monitoring module docs
│   │   ├── environments/                             # Environment-specific Terraform configurations
│   │   │   ├── dev/                                  # Development environment setup
│   │   │   │   ├── main.tf                           # Root module for dev environment
│   │   │   │   ├── variables.tf                      # Dev-specific variables
│   │   │   │   ├── terraform.tfvars                  # Variable values for development
│   │   │   │   ├── outputs.tf                        # Outputs for dev environment
│   │   │   │   └── backend.tf                        # State backend for dev
│   │   │   ├── staging/                              # Staging environment configuration
│   │   │   │   ├── main.tf                           # Root module for staging
│   │   │   │   ├── variables.tf                      # Staging variables
│   │   │   │   ├── terraform.tfvars                  # Staging variable values
│   │   │   │   ├── outputs.tf                        # Staging outputs
│   │   │   │   └── backend.tf                        # Staging state backend
│   │   │   └── prod/                                 # Production environment setup
│   │   │       ├── main.tf                           # Root module for production
│   │   │       ├── variables.tf                      # Production variables
│   │   │       ├── terraform.tfvars                  # Production variable values
│   │   │       ├── outputs.tf                        # Production outputs
│   │   │       └── backend.tf                        # Production state backend
│   │   ├── shared/                                   # Shared Terraform configurations
│   │   │   ├── providers.tf                          # AWS provider and version constraints
│   │   │   ├── backend.tf                            # Remote state backend configuration
│   │   │   ├── data.tf                               # Data sources for existing resources
│   │   │   └── versions.tf                           # Terraform and provider version requirements
│   │   └── scripts/                                  # Helper scripts for Terraform operations
│   │       ├── init.sh                               # Terraform initialization script
│   │       ├── plan.sh                               # Script to run terraform plan
│   │       ├── apply.sh                              # Script to run terraform apply
│   │       └── destroy.sh                            # Script to destroy resources
│   │
│   ├── k8s/                                          # Kubernetes manifests (deployment, scaling, networking, security)                             
│   │   ├── base/                                     # Environment-agnostic base resources (shared across all environments)
│   │   │   ├── kustomization.yaml                    # Root Kustomize file aggregating all base resources
│   │   │   ├── namespace.yaml                        # Defines the tkllm-darija namespace
│   │   │   ├── rbac/                                 # Role-Based Access Control (security & permissions)
│   │   │   │   └── rbac.yaml                         # ServiceAccounts, Roles, ClusterRoles, IRSA bindings (AWS IAM integration)
│   │   │   │
│   │   │   ├── network-policies/                     # Zero-trust networking rules
│   │   │   │   └── default-deny.yaml                 # Deny all traffic by default, allow only explicit service communication
│   │   │   │
│   │   │   ├── storage/                              # Persistent storage configuration
│   │   │   │   └── pvcs.yaml                         # PersistentVolumeClaims for databases, caches, and ML storage
│   │   │   │
│   │   │   ├── configmaps/                           # Non-sensitive configuration shared across services
│   │   │   │   ├── common.yaml                       # Shared configs (Kafka topics, feature flags, thresholds)
│   │   │   │   ├── api.yaml                          # API-specific settings (CORS, rate limits, feature toggles)
│   │   │   │   └── ml.yaml                           # ML configs (ASR models, MLflow, Prefect, DVC settings)
│   │   │   │
│   │   │   ├── secrets/                              # Sensitive configuration management
│   │   │   │   ├── secret-template.yaml              # Template with placeholder values (for documentation/reference)
│   │   │   │   └── external-secrets.yaml             # ExternalSecret CRs (pull secrets from AWS SSM / Secrets Manager)
│   │   │   │
│   │   │   ├── statefulsets/                         # Stateful infrastructure services (require persistent storage)
│   │   │   │   ├── postgres/                         # PostgreSQL / TimescaleDB database
│   │   │   │   │   ├── infrastructure.yaml           # Database StatefulSet (persistent identity + storage)
│   │   │   │   │   ├── service.yaml                  # Internal service for database access
│   │   │   │   │   └── kustomization.yaml            # Kustomize config for PostgreSQL resources                                            
│   │   │   │   ├── redis/                            # Redis (cache + queue backend)
│   │   │   │   │   ├── infrastructure.yaml           # Redis StatefulSet with resource limits and persistence
│   │   │   │   │   ├── service.yaml                  # ClusterIP Service exposing Redis on port 6379
│   │   │   │   │   ├── kustomization.yaml            # Kustomize file to combine resources and inject secrets
│   │   │   │   ├── kafka/                            # Kafka (event streaming platform)
│   │   │   │   │   ├── infrastructure.yaml           # Kafka StatefulSet with broker configuration
│   │   │   │   │   ├── service.yaml                  # Headless Service for Kafka brokers
│   │   │   │   │   ├── kustomization.yaml            # Kustomize configuration for Kafka
│   │   │   │   └── weaviate/                         # Vector database for embeddings / semantic search
│   │   │   │       ├── infrastructure.yaml           # Weaviate StatefulSet with persistent storage
│   │   │   │       ├── service.yaml                  # ClusterIP Service exposing Weaviate (HTTP + gRPC)
│   │   │   │       └── kustomization.yaml            # Kustomize file for Weaviate resources
│   │   │   │
│   │   │   ├── deployments/                          # Stateless application and worker services
│   │   │   │   ├── api/                              # Main backend API (NestJS)
│   │   │   │   │   ├── apps.yaml                     # API deployment (pods, containers, env config)
│   │   │   │   │   ├── service.yaml                  # ClusterIP service exposing API internally
│   │   │   │   │   ├── hpa.yaml                      # Horizontal Pod Autoscaler (CPU/memory-based scaling)
│   │   │   │   │   └── pdb.yaml                      # PodDisruptionBudget (ensures minimum availability during updates)
│   │   │   │   │
│   │   │   │   ├── asr-worker/                       # Speech-to-text worker (GPU-enabled if needed)
│   │   │   │   │   ├── deployment.yaml               # Worker deployment (batch/queue processing)
│   │   │   │   │   └── keda.yaml                     # KEDA autoscaling based on Kafka lag or queue size
│   │   │   │   │
│   │   │   │   ├── web-contributor/                  # Contributor-facing web app (Next.js)
│   │   │   │   │   ├── deployment.yaml               # Kubernetes Deployment for the Next.js contributor web application (.. requests/limits) 
│   │   │   │   │   ├── service.yaml                  # ClusterIP Service to expose the contributor web app internally within the cluster
│   │   │   │   │   ├── hpa.yaml                      # Horizontal Pod Autoscaler (HPA) to automatically scale based on CPU/memory usage
│   │   │   │   │   └── pdb.yaml                      # PodDisruptionBudget to ensure minimum availability during voluntary disruptions
│   │   │   │   │
│   │   │   │   ├── web-b2b/                          # Enterprise dashboard (Next.js)
│   │   │   │   │   └── deployment.yaml     
│   │   │   │   │
│   │   │   │   ├── quality-engine/                   # Data validation and scoring service
│   │   │   │   │   ├── deployment.yaml               # K.D for the quality engine (data validation, scoring, and active learning logic)
│   │   │   │   │   ├── service.yaml                  # C.S to expose the quality engine internally for other services to submit validation tasks
│   │   │   │   │   └── hpa.yaml                      # Ho.Pod.Auto to scale based on CPU/memory or custom metrics (e.g., task queue length)
│   │   │   │   │
│   │   │   │   ├── data-pipeline/                    # ETL and dataset processing service
│   │   │   │   │   ├── deployment.yaml               # Kubernetes Deployment for the data pipeline service
│   │   │   │   │   └── service.yaml                  # ClusterIP Service for internal communication with the pipeline
│   │   │   │   │
│   │   │   │   ├── financial-service/                # Payments, wallet, and fraud detection
│   │   │   │   │   ├── deployment.yaml               # Kubernetes Deployment for the financial service
│   │   │   │   │   ├── service.yaml                  # ClusterIP Service exposing the financial service
│   │   │   │   │   ├── hpa.yaml                      # Horizontal Pod Autoscaler for the financial service
│   │   │   │   │   └── pdb.yaml                      # Payments must survive node drains
│   │   │   │   │
│   │   │   │   └── analytics-service/                # Metrics, user activity, and data insights
│   │   │   │       ├── deployment.yaml               # Kubernetes Deployment for the financial service
│   │   │   │       └── service.yaml                  # ClusterIP Service exposing the financial service
│   │   │   │       
│   │   │   │
│   │   │   └── ingress/                              # External access configuration
│   │   │       └── ingress.yaml                      # NGINX ingress with TLS (cert-manager / Let's Encrypt)
│   │   │   
│   │   │   
│   │   │
│   │   ├── overlays/                                 # Environment-specific overrides and customizations
│   │   │   ├── dev/                                  # Development environment (local / testing)
│   │   │   │   ├── kustomization.yaml                # Extends base + applies dev-specific patches
│   │   │   │   ├── patch-configmap.yaml              # 
│   │   │   │   ├── patch-image.yaml                  # Use dev/latest image tags
│   │   │   │   ├── patch-replicas.yaml
│   │   │   │   ├── patch-resources.yaml              # Lower CPU/memory limits for dev
│   │   │   │   ├── patch-secrets.yaml
│   │   │   │   └── keda/                             # Optional autoscaling config for development
│   │   │   │       └── scaledobject-dev.yaml  
│   │   │   │   
│   │   │   ├── staging/                              # Pre-production environment
│   │   │   │   ├── kustomization.yaml                # Extends base with staging configs
│   │   │   │   ├── patch-configmap.yaml 
│   │   │   │   ├── patch-resources.yaml 
│   │   │   │   └── patch-replicas.yaml               # Adjust replica counts for staging validation
│   │   │   │ 
│   │   │   └── prod/                                 # Production environment
│   │   │       ├── kustomization.yaml                # Extends base with production-ready configs
│   │   │       ├── patch-configmap.yaml 
│   │   │       ├── patch-resources.yaml              # Higher resource limits and stricter constraints
│   │   │       ├── patch-hpa.yaml                    # Production autoscaling rules
│   │   │       └── network-policies/                 # Enhanced security rules (restricted traffic)
│   │   │           ├── egress-api.yaml
│   │   │           ├── egress-financial.yaml
│   │   │           └── ingress-strict.yaml 
│   │   │     
│   │   └── components/                               # Reusable Kustomize components (advanced DRY configuration)
│   │       ├── kustomization.yaml                    # Root Kustomize file that aggregates all reusable components
│   │       │
│   │       ├── common-limits/                        # Common resource limits and requests for containers, pods, and PVCs
│   │       │   ├── kustomization.yaml                # Kustomize config to export the common limits component
│   │       │   └── common-limits.yaml                # LimitRange definition (default/min/max requests & limits for CPU, memory, storage)
│   │       │
│   │       ├── quota-dev/                            # ResourceQuota tailored for development environment (relaxed limits)
│   │       │   ├── kustomization.yaml                # Kustomize config for dev quota component
│   │       │   └── quota.yaml                        # ResourceQuota for dev (compute, GPU, storage, and object counts)
│   │       │
│   │       ├── quota-staging/                        # ResourceQuota tailored for staging environment
│   │       │   ├── kustomization.yaml                # Kustomize config for staging quota component
│   │       │   └── quota.yaml                        # ResourceQuota for staging (moderate limits)
│   │       │
│   │       ├── quota-prod/                           # ResourceQuota tailored for production environment (strict + high availability)
│   │       │   ├── kustomization.yaml                # Kustomize config for production quota component
│   │       │   └── quota.yaml                        # ResourceQuota for prod (compute, GPU, storage, services, and pods)
│   │       │
│   │       └── pod-security/                         # Pod Security Standards and security policies
│   │           ├── kustomization.yaml                # Kustomize config to export pod security policies
│   │           └── pod-security.yaml                 # PodSecurityPolicy / Pod Security Admission configuration (restricted, baseline, privileged)
│   │
│   ├── docker/                                       # Local development environment
│   │   ├── docker-compose.yml                        # Main local stack (PostgreSQL, Redis, MinIO, Kafka, MailHog, pgAdmin, etc.)
│   │   ├── .env                                      # Local environment variables
│   │   ├── .env.example                              # Template for all environment variables
│   │   │
│   │   ├── init-scripts/                             # Initialization scripts executed automatically on container startup
│   │   │   ├── postgres/
│   │   │   │   └── 01_extensions.sql                 # Enables pg_trgm, uuid-ossp, pgcrypto, TimescaleDB, etc.
│   │   │   │
│   │   │   └── pgadmin/
│   │   │       └── servers.json                      # Pre-configures pgAdmin to connect to local DB
│   │   │
│   │   ├── minio/
│   │   │   └── buckets.json                          # Auto-creates buckets on startup (tkllm-audio, tkllm-datasets, etc.)
│   │   │
│   │   └── nginx/                                    # Optional local reverse proxy configuration
│   │       ├── nginx.conf                            # Main NGINX configuration file for local routing and SSL termination
│   │       ├── docker-compose.nginx.yml              # Additional Docker Compose override file for NGINX service
│   │       └── README.md                             # Instructions on how to enable and use the local NGINX proxy   
│   │
│   ├── monitoring/                                   # Observability stack configuration
│   │   ├── prometheus/
│   │   │   └── prometheus.yml                        # Scraping configuration for all services
│   │   │
│   │   └── grafana/
│   │       └── provisioning/
│   │           ├── datasources/
│   │           │   └── prometheus.yml                # Auto-connects Grafana to Prometheus
│   │           │
│   │           └── dashboards/
│   │               └── default.yml                   # Preloaded dashboards for API, ASR, quality, etc.
│   │
│   ├── messaging/                                    # Async communication & event-driven setup
│   │   ├── kafka/
│   │   │   ├── topics.yml                            # Definition of all Kafka topics
│   │   │   └── consumer-groups.yml                   # Consumer group configurations
│   │   │
│   │   └── queues/
│   │       └── schemas/                              # Job schemas and BullMQ/Redis queue definitions
│   │
│   └── scripts/                                      # Infrastructure-related helper scripts
│        └── setup-local.sh                           # One-command setup for local environment 
│
├── docs/                                             # Architecture decisions, API docs, guides
├── scripts/                                          # Dev utilities & automation
├── .github/
│   └── workflows/                                    # CI/CD pipelines
├── README.md
├── .gitignore
├──.env.example
├──.env
├── CONTRIBUTING.md
├── package.json                                    # Root workspace configuration
├── turbo.json                                      # Turborepo monorepo config
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