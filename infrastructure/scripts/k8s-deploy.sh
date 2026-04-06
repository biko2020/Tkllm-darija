#!/usr/bin/env bash
# =============================================================================
# Database Reset
# infrastructure/scripts/db-reset.sh
#
# Drops and recreates the local development database,
# runs all Prisma migrations, and seeds with sample data.
#
# ⚠️  DESTRUCTIVE — dev environment only. Never run against staging/prod.
#
# Usage:
#   bash infrastructure/scripts/db-reset.sh
#   bash infrastructure/scripts/db-reset.sh --skip-seed
#   bash infrastructure/scripts/db-reset.sh --migrate-only
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()     { echo -e "${CYAN}[db]${RESET}    $*"; }
success() { echo -e "${GREEN}[ok]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[warn]${RESET}  $*"; }
error()   { echo -e "${RED}[error]${RESET} $*" >&2; }
die()     { error "$*"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env"
API_DIR="${REPO_ROOT}/apps/api"

SKIP_SEED=false
MIGRATE_ONLY=false

for arg in "$@"; do
  case $arg in
    --skip-seed)    SKIP_SEED=true    ;;
    --migrate-only) MIGRATE_ONLY=true ;;
  esac
done

# Load env
if [[ -f "$ENV_FILE" ]]; then
  set -o allexport
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +o allexport
fi

DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_USER="${POSTGRES_USER:-tkllm_user}"
DB_PASS="${POSTGRES_PASSWORD:-tkllm_password}"
DB_NAME="${POSTGRES_DB:-tkllm_darija}"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
export DATABASE_URL

# Confirm
if [[ "$MIGRATE_ONLY" == false ]]; then
  warn "This will DROP and RECREATE the '${DB_NAME}' database on ${DB_HOST}:${DB_PORT}"
  echo -n "  Type 'yes' to confirm: "
  read -r confirm
  [[ "$confirm" == "yes" ]] || die "Cancelled."
fi

# Check postgres is running
if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q tkllm-postgres; then
  die "tkllm-postgres container is not running. Run: npm run infra:up"
fi

if [[ "$MIGRATE_ONLY" == false ]]; then
  log "Dropping database '${DB_NAME}'..."
  docker exec tkllm-postgres \
    psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS ${DB_NAME};" postgres
  success "Database dropped"

  log "Recreating database '${DB_NAME}'..."
  docker exec tkllm-postgres \
    psql -U "$DB_USER" -c "CREATE DATABASE ${DB_NAME} ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8' TEMPLATE template0;" postgres
  success "Database created"
fi

# Prisma
if [[ ! -f "${API_DIR}/prisma/schema.prisma" ]]; then
  die "Prisma schema not found at ${API_DIR}/prisma/schema.prisma"
fi

cd "$API_DIR"

log "Generating Prisma client..."
npx prisma generate
success "Prisma client generated"

log "Running migrations..."
npx prisma migrate deploy
success "Migrations applied"

if [[ "$SKIP_SEED" == false ]]; then
  if [[ -f "${API_DIR}/prisma/seed.ts" || -f "${API_DIR}/prisma/seed.js" ]]; then
    log "Seeding database..."
    npx prisma db seed
    success "Database seeded"
  else
    warn "No seed file found at prisma/seed.ts — skipping seed"
  fi
fi

echo -e "\n${GREEN}${BOLD}Database reset complete.${RESET}"
echo -e "  Host:     ${DB_HOST}:${DB_PORT}"
echo -e "  Database: ${DB_NAME}"
echo -e "  User:     ${DB_USER}"
echo -e "\n  Prisma Studio: npm run db:studio"