# =============================================================================
# Backend — prod
# infrastructure/terraform/environments/prod/backend.tf
#
# Remote state stored in S3 with DynamoDB locking.
# State key is isolated per environment — never shared with dev/staging.
#
# Bootstrap (one-time, before first `terraform init`):
#   See infrastructure/terraform/shared/backend.tf for full bootstrap commands.
#
# Init:
#   cd infrastructure/terraform/environments/prod
#   terraform init
# =============================================================================
terraform {
  backend "s3" {
    bucket         = "tkllm-darija-tfstate"
    key            = "environments/prod/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "tkllm-darija-tflock"
  }
}
