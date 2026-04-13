
# =============================================================================
# Variables — staging
# infrastructure/terraform/environments/staging/variables.tf
# =============================================================================

variable "environment" {
	description = "Deployment environment (e.g., staging)"
	type        = string
	default     = "staging"
}

variable "aws_region" {
	description = "AWS region to deploy resources"
	type        = string
	default     = "eu-west-1"
}

variable "vpc_cidr" {
	description = "VPC CIDR block"
	type        = string
	default     = "10.1.0.0/16"
}

variable "availability_zones" {
	description = "List of availability zones"
	type        = list(string)
	default     = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
}

variable "eks_cluster_version" {
	description = "EKS cluster version"
	type        = string
	default     = "1.29"
}

variable "eks_node_instance_types" {
	description = "EKS node instance types"
	type        = list(string)
	default     = ["t3.large"]
}

variable "eks_gpu_instance_types" {
	description = "EKS GPU node instance types"
	type        = list(string)
	default     = ["g4dn.xlarge"]
}

variable "eks_node_min" {
	description = "Minimum number of EKS nodes"
	type        = number
	default     = 2
}

variable "eks_node_max" {
	description = "Maximum number of EKS nodes"
	type        = number
	default     = 4
}

variable "eks_node_desired" {
	description = "Desired number of EKS nodes"
	type        = number
	default     = 2
}

variable "eks_gpu_node_min" {
	description = "Minimum number of GPU nodes"
	type        = number
	default     = 0
}

variable "eks_gpu_node_max" {
	description = "Maximum number of GPU nodes"
	type        = number
	default     = 1
}

variable "db_password" {
	description = "RDS database password"
	type        = string
	sensitive   = true
}

variable "db_instance_class" {
	description = "RDS instance class"
	type        = string
	default     = "db.t4g.medium"
}

variable "db_allocated_storage" {
	description = "RDS allocated storage (GB)"
	type        = number
	default     = 50
}

variable "db_max_allocated_storage" {
	description = "RDS max allocated storage (GB)"
	type        = number
	default     = 200
}

variable "redis_node_type" {
	description = "Redis node type"
	type        = string
	default     = "cache.t4g.small"
}

variable "redis_auth_token" {
	description = "Redis AUTH token"
	type        = string
	sensitive   = true
}

variable "msk_instance_type" {
	description = "MSK broker instance type"
	type        = string
	default     = "kafka.t3.small"
}

variable "msk_kafka_version" {
	description = "MSK Kafka version"
	type        = string
	default     = "3.6.0"
}

variable "alert_email" {
	description = "Email for critical/warning alerts"
	type        = string
}

variable "tags" {
	description = "Resource tags"
	type        = map(string)
	default     = { Project = "tkllm-darija" }
}
