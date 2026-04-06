# Terraform variables for Tkllm-darija

variable "project" {
  description = "Project name"
  type        = string
  default     = "tkllm-darija"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}
