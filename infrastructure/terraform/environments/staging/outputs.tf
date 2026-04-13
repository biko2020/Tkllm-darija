
# =============================================================================
# Outputs — staging
# infrastructure/terraform/environments/staging/outputs.tf
# =============================================================================

output "vpc_id" {
	description = "VPC ID for the staging environment"
	value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
	description = "EKS cluster name"
	value       = module.eks.cluster_name
}

output "db_instance_endpoint" {
	description = "RDS database endpoint"
	value       = module.rds.db_instance_endpoint
}

output "redis_endpoint" {
	description = "Redis endpoint"
	value       = module.elasticache.redis_endpoint
}

output "msk_bootstrap_brokers" {
	description = "MSK bootstrap brokers"
	value       = module.msk.bootstrap_brokers
}

output "s3_bucket_names" {
	description = "S3 bucket names"
	value       = module.s3.bucket_names
}

output "monitoring_dashboard" {
	description = "CloudWatch monitoring dashboard name"
	value       = module.monitoring.dashboard_name
}
