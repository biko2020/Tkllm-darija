# SSM Terraform Module — main.tf
# Provisions AWS SSM Parameter Store parameters.

resource "aws_ssm_parameter" "main" {
  for_each = var.parameters
  name        = "/${var.name_prefix}/${each.key}"
  type        = each.value.type
  value       = each.value.value
  description = each.value.description
  overwrite   = true
  tags        = var.tags
}
