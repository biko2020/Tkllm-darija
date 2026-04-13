#!/bin/bash
# =============================================================================
# Terraform Destroy Script
# infrastructure/terraform/scripts/destroy.sh
#
# Usage: ./destroy.sh [env]
# Example: ./destroy.sh dev
# =============================================================================
set -euo pipefail

ENV=${1:-dev}
cd "$(dirname "$0")/../environments/$ENV"
echo "Destroying Terraform resources for environment: $ENV"
terraform destroy -var-file=terraform.tfvars
