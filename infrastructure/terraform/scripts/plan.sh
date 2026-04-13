#!/bin/bash
# =============================================================================
# Terraform Plan Script
# infrastructure/terraform/scripts/plan.sh
#
# Usage: ./plan.sh [env]
# Example: ./plan.sh staging
# =============================================================================
set -euo pipefail

ENV=${1:-dev}
cd "$(dirname "$0")/../environments/$ENV"
echo "Running terraform plan for environment: $ENV"
terraform plan -var-file=terraform.tfvars
