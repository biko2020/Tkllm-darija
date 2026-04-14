variable "name_prefix" {
  description = "Prefix for S3 bucket names"
  type        = string
}

variable "bucket_names" {
  description = "List of S3 bucket names (without prefix)"
  type        = list(string)
}

variable "force_destroy" {
  description = "Allow destroy of non-empty buckets"
  type        = bool
  default     = false
}

variable "versioning_enabled" {
  description = "Enable versioning on buckets"
  type        = bool
  default     = true
}

variable "noncurrent_expiration_days" {
  description = "Days to retain noncurrent versions"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Tags to apply to S3 buckets"
  type        = map(string)
}
