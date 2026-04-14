variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for MSK brokers"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs for MSK"
  type        = list(string)
}

variable "kafka_version" {
  description = "Kafka version"
  type        = string
  default     = "3.6.0"
}

variable "broker_count" {
  description = "Number of broker nodes"
  type        = number
  default     = 3
}

variable "broker_instance_type" {
  description = "Instance type for brokers"
  type        = string
  default     = "kafka.m5.large"
}

variable "broker_volume_size" {
  description = "EBS volume size for brokers (GiB)"
  type        = number
  default     = 100
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption at rest"
  type        = string
  default     = ""
}

variable "enhanced_monitoring" {
  description = "Enhanced monitoring level (DEFAULT, PER_BROKER, PER_TOPIC_PER_BROKER, PER_TOPIC_PER_PARTITION)"
  type        = string
  default     = "DEFAULT"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}
