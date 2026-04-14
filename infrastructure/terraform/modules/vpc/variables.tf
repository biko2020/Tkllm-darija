
variable "name_prefix" {
	description = "Prefix for all resource names"
	type        = string
}

variable "cidr" {
	description = "VPC CIDR block"
	type        = string
	default     = "10.0.0.0/16"
}

variable "availability_zones" {
	description = "List of availability zones to deploy into (min 2)"
	type        = list(string)
}

variable "environment" {
	description = "Deployment environment (dev, staging, prod)"
	type        = string
}

variable "tags" {
	description = "Tags applied to all resources"
	type        = map(string)
	default     = {}
}
