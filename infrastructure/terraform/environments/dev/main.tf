# =============================================================================
# Environment — dev
# infrastructure/terraform/environments/dev/main.tf
#
# Minimal, cost-optimised development environment.
# All modules are the same as staging/prod — only sizes differ.
#
# Key dev differences vs prod:
#   - Single NAT Gateway (saves ~$90/month)
#   - 2 AZs instead of 3
#   - t3/t4g instance classes throughout
#   - No Multi-AZ RDS
#   - No Redis replica / Auto-failover
#   - MSK single broker (not 3-broker cluster)
#   - GPU nodes cap at 1 (KEDA still scales to 0 when idle)
#   - No deletion protection on RDS
#   - CloudWatch log retention: 30 days (vs 90 in prod)
#   - R2 buckets named with -dev suffix
#   - DNS subdomains prefixed with dev. (dev.app, dev.api, etc.)
#
# Cost estimate (eu-west-1, ~730h/month):
#   EKS control plane   $73/month
#   2× t3.large nodes   ~$130/month
#   db.t4g.small RDS    ~$27/month
#   cache.t4g.micro     ~$12/month
#   kafka.t3.small MSK  ~$50/month
#   NAT Gateway         ~$35/month
#   Total estimate      ~$327/month
#   (GPU node adds ~$380/month when running — use KEDA scale-to-zero)
#
# Apply:
#   cd infrastructure/terraform/environments/dev
#   terraform init
#   terraform plan  -var-file=terraform.tfvars
#   terraform apply -var-file=terraform.tfvars
#
# Destroy (to avoid ongoing costs when not needed):
#   bash ../../../../infrastructure/scripts/destroy.sh dev
# =============================================================================

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws        = { source = "hashicorp/aws",       version = "~> 5.82" }
    cloudflare = { source = "cloudflare/cloudflare", version = "~> 4.48" }
    kubernetes = { source = "hashicorp/kubernetes", version = "~> 2.35" }
    helm       = { source = "hashicorp/helm",       version = "~> 2.17" }
    kubectl    = { source = "gavinbunney/kubectl",   version = "~> 1.19" }
    tls        = { source = "hashicorp/tls",         version = "~> 4.0" }
    random     = { source = "hashicorp/random",      version = "~> 3.6" }
  }
}

# ── Providers ─────────────────────────────────────────────────────────────────

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "tkllm-darija"
      Environment = "dev"
      ManagedBy   = "terraform"
      Owner       = "aitoufkirbrahimab@gmail.com"
      Repo        = "https://github.com/biko2020/Tkllm-darija"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Kubernetes + Helm providers are configured after EKS is created.
# They reference module.eks outputs — Terraform resolves this lazily.
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_ca_certificate)
  token                  = module.eks.cluster_auth_token
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_ca_certificate)
    token                  = module.eks.cluster_auth_token
  }
}

# ── Locals ────────────────────────────────────────────────────────────────────

locals {
  environment = "dev"
  name_prefix = "tkllm-darija-dev"

  common_tags = {
    Project     = "tkllm-darija"
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}

data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" { state = "available" }

# =============================================================================
# MODULES
# =============================================================================

# ── 1. VPC ────────────────────────────────────────────────────────────────────
module "vpc" {
  source = "../../modules/vpc"

  name_prefix        = local.name_prefix
  cidr               = var.vpc_cidr
  availability_zones = var.availability_zones
  environment        = local.environment
  tags               = local.common_tags
}

# ── 2. IAM ────────────────────────────────────────────────────────────────────
module "iam" {
  source = "../../modules/iam"

  name_prefix       = local.name_prefix
  environment       = local.environment
  eks_oidc_provider = module.eks.oidc_provider_arn
  aws_account_id    = data.aws_caller_identity.current.account_id
  aws_region        = var.aws_region
  tags              = local.common_tags

  depends_on = [module.eks]
}

# ── 3. EKS ────────────────────────────────────────────────────────────────────
module "eks" {
  source = "../../modules/eks"

  name_prefix         = local.name_prefix
  cluster_version     = var.eks_cluster_version
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnet_ids
  node_instance_types = var.eks_node_instance_types
  gpu_instance_types  = var.eks_gpu_instance_types
  node_min            = var.eks_node_min
  node_max            = var.eks_node_max
  node_desired        = var.eks_node_desired
  gpu_node_min        = var.eks_gpu_node_min
  gpu_node_max        = var.eks_gpu_node_max
  cluster_role_arn    = module.iam.eks_cluster_role_arn
  node_role_arn       = module.iam.eks_node_role_arn
  environment         = local.environment
  aws_region          = var.aws_region
  tags                = local.common_tags

  depends_on = [module.vpc, module.iam]
}

# ── 4. ECR ────────────────────────────────────────────────────────────────────
module "ecr" {
  source = "../../modules/ecr"

  name_prefix  = local.name_prefix
  environment  = local.environment
  repositories = [
    "api",
    "web-contributor",
    "web-b2b",
    "asr-worker",
    "quality-engine",
    "analytics-service",
    "financial-service",
    "data-pipeline",
  ]
  tags = local.common_tags
}

# ── 5. RDS — PostgreSQL 16 + TimescaleDB ──────────────────────────────────────
module "rds" {
  source = "../../modules/rds"

  name_prefix           = local.name_prefix
  environment           = local.environment
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids  # dev uses private, not isolated
  db_password           = var.db_password
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  eks_security_group_id = module.eks.node_security_group_id
  aws_region            = var.aws_region
  tags                  = local.common_tags

  depends_on = [module.vpc]
}

# ── 6. ElastiCache — Redis 7 ──────────────────────────────────────────────────
module "elasticache" {
  source = "../../modules/elasticache"

  name_prefix           = local.name_prefix
  environment           = local.environment
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids
  node_type             = var.redis_node_type
  auth_token            = var.redis_auth_token
  eks_security_group_id = module.eks.node_security_group_id
  tags                  = local.common_tags

  depends_on = [module.vpc]
}

# ── 7. MSK — Managed Kafka ────────────────────────────────────────────────────
module "msk" {
  source = "../../modules/msk"

  name_prefix           = local.name_prefix
  environment           = local.environment
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids
  instance_type         = var.msk_instance_type
  kafka_version         = var.msk_kafka_version
  eks_security_group_id = module.eks.node_security_group_id
  tags                  = local.common_tags

  depends_on = [module.vpc]
}

# ── 8. S3 — State + Backups ───────────────────────────────────────────────────
module "s3" {
  source = "../../modules/s3"

  name_prefix = local.name_prefix
  environment = local.environment
  aws_region  = var.aws_region
  tags        = local.common_tags
}

# ── 9. Cloudflare — R2 Buckets + DNS ─────────────────────────────────────────
module "cloudflare" {
  source = "../../modules/cloudflare"

  account_id      = var.cloudflare_account_id
  zone_id         = var.cloudflare_zone_id
  environment     = local.environment
  buckets = [
    "tkllm-audio-dev",
    "tkllm-datasets-dev",
    "tkllm-exports-dev",
    "tkllm-models-dev",
  ]
  eks_lb_hostname = module.eks.load_balancer_hostname
}

# ── 10. SSM — Parameter Store Bootstrap ──────────────────────────────────────
module "ssm" {
  source = "../../modules/ssm"

  name_prefix    = local.name_prefix
  environment    = local.environment
  rds_endpoint   = module.rds.endpoint
  redis_endpoint = module.elasticache.primary_endpoint
  msk_brokers    = module.msk.bootstrap_brokers
  tags           = local.common_tags

  depends_on = [module.rds, module.elasticache, module.msk]
}

# ── 11. Monitoring — CloudWatch + SNS ────────────────────────────────────────
module "monitoring" {
  source = "../../modules/monitoring"

  name_prefix = local.name_prefix
  environment = local.environment
  alert_email = var.alert_email   # optional in dev — leave empty to skip email
  tags        = local.common_tags
}
