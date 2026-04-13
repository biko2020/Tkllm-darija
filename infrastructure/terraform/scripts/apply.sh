#!/bin/bash
# =============================================================================
# Terraform Apply Script
# infrastructure/terraform/scripts/apply.sh
#
# Usage: ./apply.sh [env]
# Example: ./apply.sh prod
# =============================================================================
set -euo pipefail

ENV=${1:-dev}
cd "$(dirname "$0")/../environments/$ENV"
echo "Applying Terraform for environment: $ENV"
terraform apply -var-file=terraform.tfvars
