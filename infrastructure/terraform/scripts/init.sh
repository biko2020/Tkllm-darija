#!/bin/bash
# =============================================================================
# Terraform Init Script
# infrastructure/terraform/scripts/init.sh
#
# Usage: ./init.sh [env]
# Example: ./init.sh dev
# =============================================================================
set -euo pipefail

ENV=${1:-dev}
cd "$(dirname "$0")/../environments/$ENV"
echo "Initializing Terraform for environment: $ENV"
terraform init
