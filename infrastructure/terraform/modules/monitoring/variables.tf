# =============================================================================
# Module — monitoring — Variables
# =============================================================================

variable "name_prefix" {
  type        = string
  description = "Prefix for all resource names (e.g. 'tkllm-darija-prod')."
}

variable "environment" {
  type        = string
  description = "Deployment environment: dev | staging | prod. Controls log retention (30d vs 90d) and prod-only alarms (replica lag)."
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}

variable "alert_email" {
  type        = string
  default     = ""
  description = "Email address for SNS alarm notifications. Leave empty to skip email subscription (alerts still fire to SNS — wire to Slack/PagerDuty separately)."
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Tags applied to all resources created by this module."
}
