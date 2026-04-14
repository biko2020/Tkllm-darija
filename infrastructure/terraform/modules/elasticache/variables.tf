variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for ElastiCache"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs for ElastiCache"
  type        = list(string)
}

variable "node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "num_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 2
}

variable "engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0"
}

variable "automatic_failover" {
  description = "Enable automatic failover (recommended for prod)"
  type        = bool
  default     = true
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "port" {
  description = "Redis port"
  type        = number
  default     = 6379
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}
