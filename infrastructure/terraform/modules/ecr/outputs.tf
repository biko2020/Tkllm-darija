output "repository_urls" {
  description = "Map of ECR repository names to URLs"
  value = { for k, repo in aws_ecr_repository.main : k => repo.repository_url }
}

output "repository_arns" {
  description = "Map of ECR repository names to ARNs"
  value = { for k, repo in aws_ecr_repository.main : k => repo.arn }
}
