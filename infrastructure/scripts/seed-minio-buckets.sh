#!/usr/bin/env bash
# =============================================================================
# MinIO Bucket Seeder
# infrastructure/scripts/seed-minio-buckets.sh
#
# Creates all S3 buckets as defined in
# infrastructure/docker/minio/buckets.json.
#
# Usage:
#   bash infrastructure/scripts/seed-minio-buckets.sh
#   bash infrastructure/scripts/seed-minio-buckets.sh --list   # list buckets
#   MINIO_ENDPOINT=http://localhost:9000 bash ...
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'
RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

log()     { echo -e "${CYAN}[minio]${RESET} $*"; }
success() { echo -e "${GREEN}[ok]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[warn]${RESET}  $*"; }
error()   { echo -e "${RED}[error]${RESET} $*" >&2; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../../.env"

# Load env vars if available
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source <(grep -v '^#' "$ENV_FILE" | grep -v '^$' | sed 's/^/export /')
fi

ENDPOINT="${S3_ENDPOINT:-${MINIO_ENDPOINT:-http://localhost:9000}}"
ACCESS_KEY="${S3_ACCESS_KEY:-${MINIO_ROOT_USER:-minioadmin}}"
SECRET_KEY="${S3_SECRET_KEY:-${MINIO_ROOT_PASSWORD:-minioadmin}}"
ALIAS="tkllm-local"
LIST_MODE=false

for arg in "$@"; do
  case $arg in --list) LIST_MODE=true ;; esac
done

# ── Detect mc binary ──────────────────────────────────────────────────────────
if command -v mc &>/dev/null; then
  MC_CMD="mc"
elif docker ps --format '{{.Names}}' 2>/dev/null | grep -q tkllm-minio; then
  MC_CMD="docker exec tkllm-minio mc"
else
  error "MinIO client (mc) not found and tkllm-minio container not running."
  error "Install mc from https://min.io/docs/minio/linux/reference/minio-mc.html"
  exit 1
fi

log "Connecting to MinIO at ${ENDPOINT}"
$MC_CMD alias set "$ALIAS" "$ENDPOINT" "$ACCESS_KEY" "$SECRET_KEY" --api S3v4 &>/dev/null
success "Alias '${ALIAS}' configured"

if [[ "$LIST_MODE" == true ]]; then
  echo -e "\n${BOLD}Existing buckets:${RESET}"
  $MC_CMD ls "$ALIAS"
  exit 0
fi

# ── Bucket definitions ────────────────────────────────────────────────────────
# Format: "name:access_policy"   (public-read | private)
declare -a BUCKETS=(
  "tkllm-audio:download"      # public-read for processed/ prefix
  "tkllm-datasets:none"       # private
  "tkllm-exports:none"        # private
  "tkllm-models:none"         # private
)

echo -e "\n${BOLD}Creating MinIO buckets:${RESET}"
CREATED=0; EXISTING=0

for bucket_def in "${BUCKETS[@]}"; do
  IFS=':' read -r name policy <<< "$bucket_def"

  if $MC_CMD ls "${ALIAS}/${name}" &>/dev/null; then
    log "Already exists: ${name}"
    EXISTING=$((EXISTING + 1))
    continue
  fi

  $MC_CMD mb "${ALIAS}/${name}"
  success "Created bucket: ${name}"

  # Set access policy
  if [[ "$policy" == "download" ]]; then
    # Only processed/ is public — raw uploads are private
    $MC_CMD anonymous set download "${ALIAS}/${name}/processed/"
    log "Set public-read on ${name}/processed/"
  fi

  CREATED=$((CREATED + 1))
done

# ── Create folder structure ───────────────────────────────────────────────────
log "Creating folder structure..."

create_folder() {
  local bucket="$1" folder="$2"
  echo "" | $MC_CMD pipe "${ALIAS}/${bucket}/${folder}.keep" &>/dev/null || true
}

create_folder tkllm-audio    "uploads/raw/"
create_folder tkllm-audio    "uploads/tmp/"
create_folder tkllm-audio    "processed/"
create_folder tkllm-audio    "rejected/"
create_folder tkllm-datasets "v1/speech-to-text/"
create_folder tkllm-datasets "v1/parallel-corpora/"
create_folder tkllm-datasets "v1/annotated/"
create_folder tkllm-datasets "exports/"
create_folder tkllm-datasets "dvc/"
create_folder tkllm-exports  "pending/"
create_folder tkllm-exports  "ready/"
create_folder tkllm-models   "mlflow/"
create_folder tkllm-models   "whisper/"
create_folder tkllm-models   "production/"
create_folder tkllm-models   "checkpoints/"

success "Folder structure created"
echo -e "\n${BOLD}Summary:${RESET} created=${CREATED}, existing=${EXISTING}"
echo -e "\n${BOLD}Buckets:${RESET}"
$MC_CMD ls "$ALIAS"