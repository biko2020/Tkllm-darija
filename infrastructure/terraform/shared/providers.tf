
# =============================================================================
# Shared Providers
# infrastructure/terraform/shared/providers.tf
# =============================================================================

provider "aws" {
	region = var.aws_region
}
