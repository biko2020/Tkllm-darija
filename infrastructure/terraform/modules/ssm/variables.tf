variable "name_prefix" {
  description = "Prefix for SSM parameter names"
  type        = string
}

variable "parameters" {
  description = "Map of parameter names to objects with type, value, and description"
  type = map(object({
    type        = string
    value       = string
    description = string
  }))
}

variable "tags" {
  description = "Tags to apply to SSM parameters"
  type        = map(string)
}
