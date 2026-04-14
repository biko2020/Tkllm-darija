output "eks_role_arn" {
  description = "ARN of the EKS cluster IAM role"
  value       = aws_iam_role.eks.arn
}

output "node_role_arn" {
  description = "ARN of the EKS node group IAM role"
  value       = aws_iam_role.node.arn
}

output "service_account_role_arn" {
  description = "ARN of the service account IAM role"
  value       = aws_iam_role.service_account.arn
}

output "node_instance_profile" {
  description = "Name of the node instance profile"
  value       = aws_iam_instance_profile.node.name
}
