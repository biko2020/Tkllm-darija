# =============================================================================
# Outputs — prod
# infrastructure/terraform/environments/prod/outputs.tf
# =============================================================================

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
  description = "Command to update local kubeconfig for this prod cluster."
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.aws_region} --profile <your-aws-profile>"
}

output "vpc_id" {
  description = "VPC ID."
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs (EKS nodes, RDS, Redis)."
  value       = module.vpc.private_subnet_ids
}

output "db_instance_endpoint" {
  description = "RDS database endpoint."
  value       = module.rds.db_instance_endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint."
  value       = module.elasticache.redis_endpoint
}

output "msk_bootstrap_brokers" {
  description = "MSK bootstrap brokers."
  value       = module.msk.bootstrap_brokers
}

output "s3_bucket_names" {
  description = "S3 bucket names."
  value       = module.s3.bucket_names
}

output "monitoring_dashboard" {
  description = "CloudWatch monitoring dashboard name."
  value       = module.monitoring.dashboard_name
}
