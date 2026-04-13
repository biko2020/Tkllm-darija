# =============================================================================
# Variables — prod
# infrastructure/terraform/environments/prod/variables.tf
# =============================================================================

variable "aws_region" {
  type        = string
  default     = "eu-west-1"
  description = "AWS region for the prod environment."
}

variable "aws_dr_region" {
  type        = string
  default     = "eu-south-1"
  description = "Disaster recovery region."
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "VPC CIDR block. Uses 10.0.x.x for prod."
}

variable "availability_zones" {
  type        = list(string)
  default     = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  description = "AZs for prod. Three AZs for high availability."
}

variable "eks_cluster_version" {
  type        = string
  default     = "1.31"
  description = "Kubernetes version for EKS cluster."
}

variable "eks_node_instance_types" {
  type        = list(string)
  default     = ["m6i.large"]
  description = "General node instance types. m6i.large for prod."
}

variable "eks_gpu_instance_types" {
  type        = list(string)
  default     = ["g5.xlarge"]
  description = "GPU instance type for ASR worker."
}

variable "eks_node_min" {
  type        = number
  default     = 3
  description = "Minimum nodes in general node group."
}

variable "eks_node_max" {
  type        = number
  default     = 10
  description = "Maximum nodes in general node group."
}

variable "eks_node_desired" {
  type        = number
  default     = 3
  description = "Desired nodes in general node group."
}

variable "eks_gpu_node_min" {
  type        = number
  default     = 0
  description = "Minimum GPU nodes."
}

variable "eks_gpu_node_max" {
  type        = number
  default     = 2
  description = "Maximum GPU nodes."
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "RDS database password."
}

variable "db_instance_class" {
  type        = string
  default     = "db.m6g.large"
  description = "RDS instance class for prod."
}

variable "db_allocated_storage" {
  type        = number
  default     = 100
  description = "RDS allocated storage (GB)."
}

variable "db_max_allocated_storage" {
  type        = number
  default     = 500
  description = "RDS max allocated storage (GB)."
}

variable "redis_node_type" {
  type        = string
  default     = "cache.m6g.large"
  description = "Redis node type for prod."
}

variable "redis_auth_token" {
  type        = string
  sensitive   = true
  description = "Redis AUTH token."
}

variable "msk_instance_type" {
  type        = string
  default     = "kafka.m6g.large"
  description = "MSK broker instance type for prod."
}

variable "msk_kafka_version" {
  type        = string
  default     = "3.6.0"
  description = "MSK Kafka version."
}

variable "alert_email" {
  type        = string
  description = "Email for critical/warning alerts."
}

variable "tags" {
  type        = map(string)
  default     = { Project = "tkllm-darija" }
  description = "Resource tags."
}
