#!/usr/bin/env bash
# =============================================================================
# Secret Rotation Helper
# infrastructure/scripts/rotate-secrets.sh
#
# Updates one or more secrets in AWS SSM Parameter Store, then triggers
# External Secrets Operator to refresh the Kubernetes secret immediately
# (instead of waiting for the 1h refreshInterval).
#
# Usage:
#   bash infrastructure/scripts/rotate-secrets.sh \
#     --env prod \
#     --key JWT_SECRET \
#     --value "$(openssl rand -hex 64)"
#
#   bash infrastructure/scripts/rotate-secrets.sh --env prod --key SENDGRID_API_KEY
#   # Prompts securely for value if --value not provided
#
#   bash infrastructure/scripts/rotate-secrets.sh --env prod --list
#   # Lists all managed SSM parameters
#
# Prerequisites:
#   - AWS CLI configured with SSM write access
#   - kubectl configured and pointing to the correct cluster
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'
RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

log()     { echo -e "${CYAN}[ssm]${RESET}   $*"; }
success() { echo -e "${GREEN}[ok]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[warn]${RESET}  $*"; }
error()   { echo -e "${RED}[error]${RESET} $*" >&2; }
die()     { error "$*"; exit 1; }

ENVIRONMENT=""
SECRET_KEY=""
SECRET_VALUE=""
LIST_MODE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)   ENVIRONMENT="$2"; shift 2 ;;
    --key)   SECRET_KEY="$2";  shift 2 ;;
    --value) SECRET_VALUE="$2"; shift 2 ;;
    --list)  LIST_MODE=true;   shift   ;;
    *)       shift ;;
  esac
done

[[ -z "$ENVIRONMENT" ]] && die "--env <dev|staging|prod> is required"

SSM_PREFIX="/tkllm-darija/${ENVIRONMENT}"

# ── Prerequisites ─────────────────────────────────────────────────────────────
command -v aws     &>/dev/null || die "AWS CLI not found. Install: https://aws.amazon.com/cli/"
command -v kubectl &>/dev/null || die "kubectl not found."

AWS_REGION="${AWS_REGION:-eu-west-1}"

# ── List mode ─────────────────────────────────────────────────────────────────
if [[ "$LIST_MODE" == true ]]; then
  echo -e "\n${BOLD}SSM parameters at ${SSM_PREFIX}/:${RESET}"
  aws ssm get-parameters-by-path \
    --path "${SSM_PREFIX}/" \
    --region "$AWS_REGION" \
    --query 'Parameters[*].{Name:Name,Version:Version,LastModified:LastModifiedDate}' \
    --output table
  exit 0
fi

[[ -z "$SECRET_KEY" ]] && die "--key <PARAMETER_NAME> is required"

# ── Prompt for value if not provided ─────────────────────────────────────────
if [[ -z "$SECRET_VALUE" ]]; then
  echo -n "  Enter value for ${SECRET_KEY} (input hidden): "
  read -rs SECRET_VALUE
  echo
  echo -n "  Confirm value: "
  read -rs confirm
  echo
  [[ "$SECRET_VALUE" == "$confirm" ]] || die "Values do not match."
fi

SSM_PATH="${SSM_PREFIX}/${SECRET_KEY}"

# ── Prod confirmation ─────────────────────────────────────────────────────────
if [[ "$ENVIRONMENT" == "prod" ]]; then
  warn "You are about to update a PRODUCTION secret."
  echo -e "  Parameter: ${SSM_PATH}"
  echo -n "  Type 'rotate' to confirm: "
  read -r confirm
  [[ "$confirm" == "rotate" ]] || die "Cancelled."
fi

# ── Write to SSM ──────────────────────────────────────────────────────────────
log "Writing ${SSM_PATH} to AWS SSM..."
aws ssm put-parameter \
  --name "$SSM_PATH" \
  --value "$SECRET_VALUE" \
  --type SecureString \
  --overwrite \
  --region "$AWS_REGION" \
  --query 'Version' \
  --output text | xargs -I{} echo "    Version: {}"

success "SSM parameter updated: ${SSM_PATH}"

# ── Trigger ESO refresh ───────────────────────────────────────────────────────
log "Triggering External Secrets Operator refresh..."

# Annotate the ExternalSecret to force immediate sync
kubectl annotate externalsecret tkllm-secrets \
  -n tkllm-darija \
  "force-sync=$(date +%s)" \
  --overwrite \
  && success "ESO refresh triggered" \
  || warn "Could not annotate ExternalSecret — K8s may not be configured for ${ENVIRONMENT}"

# Wait for ESO to sync
log "Waiting for secret sync..."
sleep 5

ESO_STATUS=$(kubectl get externalsecret tkllm-secrets \
  -n tkllm-darija \
  -o jsonpath='{.status.conditions[0].type}' 2>/dev/null || echo "unknown")

if [[ "$ESO_STATUS" == "Ready" ]]; then
  success "ExternalSecret is Ready — Kubernetes secret updated"
else
  warn "ExternalSecret status: ${ESO_STATUS} — check: kubectl describe externalsecret tkllm-secrets -n tkllm-darija"
fi

echo -e "\n${GREEN}${BOLD}Secret rotation complete.${RESET}"
echo -e "  Key:         ${SECRET_KEY}"
echo -e "  Environment: ${ENVIRONMENT}"
echo -e "  SSM path:    ${SSM_PATH}"