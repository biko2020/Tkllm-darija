# Root Terraform configuration for Tkllm-darija

terraform {
  required_version = ">= 1.6.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Foundation module (VPC)
module "vpc" {
  source  = "./modules/vpc"
  project = var.project
  region  = var.region
}

# EKS module
module "eks" {
  source  = "./modules/eks"
  project = var.project
  region  = var.region
  vpc_id  = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
}

# RDS module
module "rds" {
  source  = "./modules/rds"
  project = var.project
  region  = var.region
  vpc_id  = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
}

# S3 module
module "s3" {
  source  = "./modules/s3"
  project = var.project
  region  = var.region
}

# Redis module
module "redis" {
  source  = "./modules/redis"
  project = var.project
  region  = var.region
  subnet_ids = module.vpc.private_subnet_ids
}

# Kafka module
module "kafka" {
  source  = "./modules/kafka"
  project = var.project
  region  = var.region
  subnet_ids = module.vpc.private_subnet_ids
}

# Monitoring module
module "monitoring" {
  source  = "./modules/monitoring"
  project = var.project
  region  = var.region
}
