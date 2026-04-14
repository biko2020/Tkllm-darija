output "parameter_names" {
  description = "Map of logical parameter names to SSM parameter names"
  value = { for k, p in aws_ssm_parameter.main : k => p.name }
}

output "parameter_arns" {
  description = "Map of logical parameter names to SSM parameter ARNs"
  value = { for k, p in aws_ssm_parameter.main : k => p.arn }
}
