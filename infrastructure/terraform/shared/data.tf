
# =============================================================================
# Shared Data Sources
# infrastructure/terraform/shared/data.tf
# =============================================================================

data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" { state = "available" }
