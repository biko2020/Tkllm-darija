# =============================================================================
# Environment — prod
# infrastructure/terraform/environments/prod/main.tf
#
# Production environment: high-availability, secure, and scalable.
#
# Key prod differences vs staging/dev:
#   - 3 AZs, Multi-AZ RDS, deletion protection enabled
#   - Larger instance types, higher scaling limits
#   - CloudWatch log retention: 90 days
#   - Strictest security groups, IAM, and backup policies
#   - DNS subdomains prefixed with prod.
#
# Apply:
#   cd infrastructure/terraform/environments/prod
#   terraform init
#   terraform plan  -var-file=terraform.tfvars
#   terraform apply -var-file=terraform.tfvars
#
# Destroy:
#   bash ../../../../infrastructure/scripts/destroy.sh prod
# =============================================================================

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws        = { source = "hashicorp/aws",       version = "~> 5.82" }
    kubernetes = { source = "hashicorp/kubernetes", version = "~> 2.35" }
    helm       = { source = "hashicorp/helm",       version = "~> 2.17" }
    kubectl    = { source = "gavinbunney/kubectl",   version = "~> 1.19" }
    tls        = { source = "hashicorp/tls",         version = "~> 4.0" }
    random     = { source = "hashicorp/random",      version = "~> 3.6" }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = merge({
      Project     = "tkllm-darija"
      Environment = "prod"
      ManagedBy   = "terraform"
      Owner       = "aitoufkirbrahimab@gmail.com"
      Repo        = "https://github.com/biko2020/Tkllm-darija"
    }, var.tags)
  }
}

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

locals {
  environment = "prod"
  name_prefix = "tkllm-darija-prod"

  common_tags = merge({
    Project     = "tkllm-darija"
    Environment = local.environment
    ManagedBy   = "terraform"
  }, var.tags)
}

data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" { state = "available" }

# =============================================================================
# MODULES
# =============================================================================

module "vpc" {
  source = "../../modules/vpc"

  name_prefix        = local.name_prefix
  cidr               = var.vpc_cidr
  availability_zones = var.availability_zones
  environment        = local.environment
  tags               = local.common_tags
}

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

module "rds" {
  source = "../../modules/rds"

  name_prefix           = local.name_prefix
  environment           = local.environment
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids
  db_password           = var.db_password
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  eks_security_group_id = module.eks.node_security_group_id
  aws_region            = var.aws_region
  tags                  = local.common_tags

  depends_on = [module.vpc]
}

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

module "s3" {
  source = "../../modules/s3"

  name_prefix = local.name_prefix
  environment = local.environment
  aws_region  = var.aws_region
  tags        = local.common_tags
}

module "monitoring" {
  source = "../../modules/monitoring"

  name_prefix      = local.name_prefix
  environment      = local.environment
  alert_email      = var.alert_email
  tags             = local.common_tags
}
