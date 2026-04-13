
# =============================================================================
# Shared Remote State Backend
# infrastructure/terraform/shared/backend.tf
#
# This file is used to bootstrap the S3 bucket and DynamoDB table for remote state.
# Run this once before initializing any environment.
#
# Usage:
#   terraform init
#   terraform apply
# =============================================================================

resource "aws_s3_bucket" "tfstate" {
	bucket = "tkllm-darija-tfstate"
	force_destroy = false
	versioning {
		enabled = true
	}
	server_side_encryption_configuration {
		rule {
			apply_server_side_encryption_by_default {
				sse_algorithm = "AES256"
			}
		}
	}
	lifecycle {
		prevent_destroy = true
	}
	tags = {
		Name = "tkllm-darija-tfstate"
		Project = "tkllm-darija"
		ManagedBy = "terraform"
	}
}

resource "aws_dynamodb_table" "tflock" {
	name         = "tkllm-darija-tflock"
	billing_mode = "PAY_PER_REQUEST"
	hash_key     = "LockID"
	attribute {
		name = "LockID"
		type = "S"
	}
	tags = {
		Name = "tkllm-darija-tflock"
		Project = "tkllm-darija"
		ManagedBy = "terraform"
	}
}
