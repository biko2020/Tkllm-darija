# =============================================================================
# Variables — dev
# infrastructure/terraform/environments/dev/variables.tf
# =============================================================================

# ── General ───────────────────────────────────────────────────────────────────
variable "aws_region" {
  type        = string
  default     = "eu-west-1"
  description = "AWS region for the dev environment."
}

variable "aws_dr_region" {
  type        = string
  default     = "eu-south-1"
  description = "Disaster recovery region (not used in dev — kept for parity with staging/prod)."
}

# ── Cloudflare ────────────────────────────────────────────────────────────────
variable "cloudflare_api_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare API token with R2 + DNS + Zone permissions."
}

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account ID."
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare DNS zone ID for tkllm-darija.ma."
}

# ── Networking ────────────────────────────────────────────────────────────────
variable "vpc_cidr" {
  type        = string
  default     = "10.10.0.0/16"
  description = "VPC CIDR block. Uses 10.10.x.x to avoid conflicts with staging (10.20.x.x) and prod (10.0.x.x)."
}

variable "availability_zones" {
  type        = list(string)
  default     = ["eu-west-1a", "eu-west-1b"]
  description = "AZs for dev. Two AZs sufficient — saves NAT Gateway cost vs three."
}

# ── EKS ───────────────────────────────────────────────────────────────────────
variable "eks_cluster_version" {
  type        = string
  default     = "1.31"
  description = "Kubernetes version for EKS cluster."
}

variable "eks_node_instance_types" {
  type        = list(string)
  default     = ["t3.large"]
  description = "General node instance types. t3.large (2 vCPU / 8 GB) is sufficient for dev."
}

variable "eks_gpu_instance_types" {
  type        = list(string)
  default     = ["g4dn.xlarge"]
  description = "GPU instance type for ASR worker. g4dn.xlarge has 1× T4 GPU (16 GB VRAM)."
}

variable "eks_node_min" {
  type        = number
  default     = 1
  description = "Minimum nodes in general node group."
}

variable "eks_node_max" {
  type        = number
  default     = 3
  description = "Maximum nodes in general node group."
}

variable "eks_node_desired" {
  type        = number
  default     = 2
  description = "Desired nodes in general node group."
}

variable "eks_gpu_node_min" {
  type        = number
  default     = 0
  description = "Minimum GPU nodes. 0 = KEDA scales to zero when no transcription work."
}

variable "eks_gpu_node_max" {
  type        = number
  default     = 1
  description = "Maximum GPU nodes in dev. Cap at 1 to control cost."
}

# ── RDS ───────────────────────────────────────────────────────────────────────
variable "db_instance_class" {
  type        = string
  default     = "db.t4g.small"
  description = "RDS instance class. t4g.small (2 vCPU / 2 GB) is sufficient for dev."
}

variable "db_allocated_storage" {
  type        = number
  default     = 20
  description = "Initial RDS storage in GB."
}

variable "db_max_allocated_storage" {
  type        = number
  default     = 100
  description = "Maximum auto-scaled RDS storage in GB."
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "PostgreSQL master password. Provide via terraform.tfvars or TF_VAR_db_password env var."
}

# ── ElastiCache ───────────────────────────────────────────────────────────────
variable "redis_node_type" {
  type        = string
  default     = "cache.t4g.micro"
  description = "ElastiCache node type. t4g.micro (0.5 GB) is sufficient for dev."
}

variable "redis_auth_token" {
  type        = string
  sensitive   = true
  description = "Redis AUTH token (password). Min 16 characters."
}

# ── MSK ───────────────────────────────────────────────────────────────────────
variable "msk_instance_type" {
  type        = string
  default     = "kafka.t3.small"
  description = "MSK broker instance type."
}

variable "msk_kafka_version" {
  type        = string
  default     = "3.6.0"
  description = "Apache Kafka version."
}

# ── Monitoring ────────────────────────────────────────────────────────────────
variable "alert_email" {
  type        = string
  default     = ""
  description = "Email for CloudWatch SNS alarm notifications. Optional in dev."
}
