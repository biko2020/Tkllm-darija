# =============================================================================
# Backend — dev
# infrastructure/terraform/environments/dev/backend.tf
#
# Remote state stored in S3 with DynamoDB locking.
# State key is isolated per environment — never shared with staging/prod.
#
# Bootstrap (one-time, before first `terraform init`):
#   See infrastructure/terraform/shared/backend.tf for full bootstrap commands.
#
# Init:
#   cd infrastructure/terraform/environments/dev
#   terraform init
# =============================================================================
terraform {
  backend "s3" {
    bucket         = "tkllm-darija-tfstate"
    key            = "environments/dev/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "tkllm-darija-tflock"
  }
}
