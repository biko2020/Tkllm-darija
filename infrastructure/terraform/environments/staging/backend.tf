
# =============================================================================
# Remote State Backend — staging
# infrastructure/terraform/environments/staging/backend.tf
# =============================================================================

terraform {
	backend "s3" {
		bucket         = "tkllm-darija-tfstate"
		key            = "staging/terraform.tfstate"
		region         = "eu-west-1"
		dynamodb_table = "tkllm-darija-tf-lock"
		encrypt        = true
	}
}
