variable "name_prefix" {
  description = "Prefix for ECR repository names"
  type        = string
}

variable "repository_names" {
  description = "List of ECR repository names (without prefix)"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to ECR repositories"
  type        = map(string)
}
