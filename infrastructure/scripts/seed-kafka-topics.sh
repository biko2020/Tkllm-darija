#!/usr/bin/env bash
# =============================================================================
# Kafka Topic Seeder
# infrastructure/scripts/seed-kafka-topics.sh
#
# Creates all platform Kafka topics as defined in
# infrastructure/messaging/kafka/topics.yml.
#
# Usage:
#   bash infrastructure/scripts/seed-kafka-topics.sh
#   bash infrastructure/scripts/seed-kafka-topics.sh --list    # list existing topics
#   bash infrastructure/scripts/seed-kafka-topics.sh --delete  # delete + recreate (dev only)
#   KAFKA_BROKER=kafka:9092 bash ...                           # override broker
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()     { echo -e "${CYAN}[kafka]${RESET} $*"; }
success() { echo -e "${GREEN}[ok]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[warn]${RESET}  $*"; }
error()   { echo -e "${RED}[error]${RESET} $*" >&2; }

BROKER="${KAFKA_BROKER:-localhost:9092}"
REPLICATION="${KAFKA_REPLICATION_FACTOR:-1}"
DELETE_MODE=false
LIST_MODE=false

for arg in "$@"; do
  case $arg in
    --delete) DELETE_MODE=true ;;
    --list)   LIST_MODE=true   ;;
  esac
done

# ── Detect kafka-topics binary (local or via Docker) ─────────────────────────
if command -v kafka-topics &>/dev/null; then
  KAFKA_CMD="kafka-topics"
elif docker ps --format '{{.Names}}' 2>/dev/null | grep -q tkllm-kafka; then
  KAFKA_CMD="docker exec tkllm-kafka kafka-topics"
  BROKER="kafka:29092"  # internal Docker network address
else
  error "kafka-topics not found and tkllm-kafka container not running."
  error "Start the stack first: npm run infra:up"
  exit 1
fi

log "Using broker: ${BROKER}"

if [[ "$LIST_MODE" == true ]]; then
  echo -e "\n${BOLD}Existing topics:${RESET}"
  $KAFKA_CMD --bootstrap-server "$BROKER" --list
  exit 0
fi

# ── Topic definitions ─────────────────────────────────────────────────────────
# Format: "name:partitions:replication_factor:retention_ms"
declare -a TOPICS=(
  "audio.uploaded:3:${REPLICATION}:604800000"
  "transcription.requested:3:${REPLICATION}:604800000"
  "transcription.completed:3:${REPLICATION}:604800000"
  "annotation.task.created:3:${REPLICATION}:1209600000"
  "quality.review.requested:3:${REPLICATION}:1209600000"
  "quality.review.completed:3:${REPLICATION}:1209600000"
  "reward.issued:1:${REPLICATION}:2592000000"
  "payment.processed:1:${REPLICATION}:2592000000"
  "export.requested:2:${REPLICATION}:259200000"
)

if [[ "$DELETE_MODE" == true ]]; then
  warn "DELETE MODE — removing all platform topics..."
  for topic_def in "${TOPICS[@]}"; do
    topic="${topic_def%%:*}"
    $KAFKA_CMD --bootstrap-server "$BROKER" --delete --topic "$topic" 2>/dev/null \
      && log "Deleted: ${topic}" \
      || warn "Could not delete ${topic} (may not exist)"
  done
  log "Waiting 5s for deletion to propagate..."
  sleep 5
fi

# ── Create topics ─────────────────────────────────────────────────────────────
echo -e "\n${BOLD}Creating Kafka topics:${RESET}"
CREATED=0; EXISTING=0; FAILED=0

for topic_def in "${TOPICS[@]}"; do
  IFS=':' read -r name partitions replication retention <<< "$topic_def"

  if $KAFKA_CMD --bootstrap-server "$BROKER" --list 2>/dev/null | grep -q "^${name}$"; then
    log "Already exists: ${name}"
    EXISTING=$((EXISTING + 1))
    continue
  fi

  if $KAFKA_CMD \
    --bootstrap-server "$BROKER" \
    --create \
    --if-not-exists \
    --topic "$name" \
    --partitions "$partitions" \
    --replication-factor "$replication" \
    --config "retention.ms=${retention}" \
    --config "compression.type=lz4" \
    2>/dev/null; then
    success "Created: ${name} (partitions=${partitions}, replication=${replication}, retention=${retention}ms)"
    CREATED=$((CREATED + 1))
  else
    error "Failed to create: ${name}"
    FAILED=$((FAILED + 1))
  fi
done

echo -e "\n${BOLD}Summary:${RESET} created=${CREATED}, existing=${EXISTING}, failed=${FAILED}"

if [[ "$FAILED" -gt 0 ]]; then
  exit 1
fi