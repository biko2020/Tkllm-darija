# =============================================================================
# Outputs — dev
# infrastructure/terraform/environments/dev/outputs.tf
#
# Run `terraform output` after apply to retrieve connection details.
# Sensitive outputs require `terraform output -raw <name>`.
# =============================================================================

# ── Cluster ───────────────────────────────────────────────────────────────────

output "eks_cluster_name" {
  description = "EKS cluster name. Use with: aws eks update-kubeconfig --name <value> --region eu-west-1"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS API server endpoint."
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "eks_kubeconfig_command" {
  description = "Command to update local kubeconfig for this dev cluster."
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.aws_region} --profile <your-aws-profile>"
}

# ── Networking ────────────────────────────────────────────────────────────────

output "vpc_id" {
  description = "VPC ID."
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs (EKS nodes, RDS, Redis)."
  value       = module.vpc.private_subnet_ids
}

# ── Database ──────────────────────────────────────────────────────────────────

output "rds_endpoint" {
  description = "PostgreSQL RDS endpoint (host:port). Use DATABASE_URL format: postgresql://tkllm_user:<password>@<endpoint>/tkllm_darija"
  value       = module.rds.endpoint
  sensitive   = true
}

output "rds_db_name" {
  description = "RDS database name."
  value       = module.rds.db_name
}

# ── Cache ─────────────────────────────────────────────────────────────────────

output "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint. Use REDIS_URL format: rediss://:<auth_token>@<endpoint>:6379"
  value       = module.elasticache.primary_endpoint
  sensitive   = true
}

output "redis_port" {
  description = "Redis port."
  value       = module.elasticache.port
}

# ── Messaging ─────────────────────────────────────────────────────────────────

output "kafka_bootstrap_brokers" {
  description = "MSK Kafka bootstrap broker string (TLS). Use as KAFKA_BROKER env var."
  value       = module.msk.bootstrap_brokers
  sensitive   = true
}

output "kafka_bootstrap_brokers_plaintext" {
  description = "MSK Kafka plaintext brokers (dev/staging only — no SASL)."
  value       = module.msk.bootstrap_brokers_plaintext
  sensitive   = true
}

output "kafka_cluster_arn" {
  description = "MSK cluster ARN."
  value       = module.msk.cluster_arn
}

# ── Container Registry ────────────────────────────────────────────────────────

output "ecr_repository_urls" {
  description = "Map of service name → ECR repository URL. Use in CI/CD for docker push."
  value       = module.ecr.repository_urls
}

output "ecr_registry_id" {
  description = "ECR registry ID (AWS account ID). Use for: aws ecr get-login-password"
  value       = module.ecr.registry_id
}

# ── Object Storage ────────────────────────────────────────────────────────────

output "r2_bucket_names" {
  description = "Cloudflare R2 bucket names provisioned for dev."
  value       = module.cloudflare.bucket_names
}

output "s3_tfstate_bucket" {
  description = "S3 bucket storing Terraform state."
  value       = module.s3.tfstate_bucket_name
}

# ── Secrets Management ────────────────────────────────────────────────────────

output "ssm_parameter_prefix" {
  description = "SSM Parameter Store path prefix. All secrets are at <prefix>/<KEY_NAME>."
  value       = module.ssm.parameter_prefix
}

output "ssm_parameter_names" {
  description = "List of all SSM parameter names managed by Terraform."
  value       = module.ssm.parameter_names
}

# ── Monitoring ────────────────────────────────────────────────────────────────

output "cloudwatch_dashboard_url" {
  description = "CloudWatch dashboard URL for dev infrastructure overview."
  value       = module.monitoring.dashboard_url
}

output "sns_critical_arn" {
  description = "SNS topic ARN for critical alerts."
  value       = module.monitoring.critical_sns_arn
}

output "cloudwatch_log_groups" {
  description = "Map of service → CloudWatch log group name."
  value       = module.monitoring.log_group_names
}

# ── Deploy Helper ─────────────────────────────────────────────────────────────

output "k8s_deploy_command" {
  description = "Command to apply the dev Kubernetes overlay."
  value       = "bash infrastructure/scripts/k8s-deploy.sh dev"
}

output "health_check_command" {
  description = "Command to check all service health after deployment."
  value       = "bash infrastructure/scripts/health-check.sh"
}
