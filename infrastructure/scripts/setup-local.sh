#!/usr/bin/env bash
# =============================================================================
# TKLLM-DARIJA — Local Development Environment Setup
# infrastructure/scripts/setup-local.sh
#
# Usage:
#   bash infrastructure/scripts/setup-local.sh           # full setup
#   bash infrastructure/scripts/setup-local.sh --infra   # infra only (no npm)
#   bash infrastructure/scripts/setup-local.sh --apps    # apps + infra
#   bash infrastructure/scripts/setup-local.sh --reset   # destroy + rebuild
#   bash infrastructure/scripts/setup-local.sh --check   # prerequisites only
#
# What this script does:
#   1.  Check prerequisites (Node, Docker, Python, Flutter)
#   2.  Copy .env.example → .env (if not present)
#   3.  Install npm workspace dependencies (turbo install)
#   4.  Start Docker Compose infrastructure stack
#   5.  Wait for all services to be healthy
#   6.  Run Prisma migrations + seed
#   7.  Create MinIO buckets (via minio-init sidecar)
#   8.  Create Kafka topics (via kafka-init sidecar)
#   9.  Optionally start app services (--apps flag)
#   10. Print access URLs
#
# Requirements:
#   - Node.js >= 20
#   - Docker Desktop (running)
#   - Python >= 3.12 (optional — for ML services)
#   - Flutter >= 3.24 (optional — for mobile app)
# =============================================================================

set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Helpers ───────────────────────────────────────────────────────────────────
log()     { echo -e "${BLUE}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }
step()    { echo -e "\n${BOLD}${CYAN}━━━ $* ━━━${RESET}"; }
die()     { error "$*"; exit 1; }

# ── Resolve repo root (script may be run from anywhere) ───────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DOCKER_DIR="${REPO_ROOT}/infrastructure/docker"
COMPOSE_FILE="${DOCKER_DIR}/docker-compose.yml"
ENV_FILE="${REPO_ROOT}/.env"
ENV_EXAMPLE="${REPO_ROOT}/.env.example"

# ── Parse flags ───────────────────────────────────────────────────────────────
MODE="full"
RESET_MODE=false
START_APPS=false
START_ML=false
START_MONITORING=false
START_TOOLS=false

for arg in "$@"; do
  case $arg in
    --infra)      MODE="infra"       ;;
    --apps)       MODE="apps"; START_APPS=true ;;
    --ml)         START_ML=true      ;;
    --monitoring) START_MONITORING=true ;;
    --tools)      START_TOOLS=true   ;;
    --reset)      RESET_MODE=true    ;;
    --check)      MODE="check"       ;;
    --help|-h)
      grep '^# ' "$0" | head -30 | sed 's/^# //'
      exit 0
      ;;
    *) warn "Unknown flag: $arg (ignored)" ;;
  esac
done

# =============================================================================
# BANNER
# =============================================================================
echo -e "
${BOLD}${CYAN}
  ████████╗██╗  ██╗██╗     ██╗     ███╗   ███╗      ██████╗  █████╗ ██████╗ ██╗     ██╗ █████╗
  ╚══██╔══╝██║ ██╔╝██║     ██║     ████╗ ████║      ██╔══██╗██╔══██╗██╔══██╗██║     ██║██╔══██╗
     ██║   █████╔╝ ██║     ██║     ██╔████╔██║█████╗██║  ██║███████║██████╔╝██║     ██║███████║
     ██║   ██╔═██╗ ██║     ██║     ██║╚██╔╝██║╚════╝██║  ██║██╔══██║██╔══██╗██║██   ██║██╔══██║
     ██║   ██║  ██╗███████╗███████╗██║ ╚═╝ ██║      ██████╔╝██║  ██║██║  ██║███████╗██║██║  ██║
     ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝
${RESET}
  ${BOLD}Local Dev Setup${RESET} — mode: ${CYAN}${MODE}${RESET}
  Repo: ${REPO_ROOT}
"

# =============================================================================
# STEP 1 — Prerequisites
# =============================================================================
step "Checking prerequisites"

check_command() {
  local cmd="$1" min_version="$2" friendly="$3"
  if ! command -v "$cmd" &>/dev/null; then
    if [[ "${4:-required}" == "optional" ]]; then
      warn "${friendly} not found — some features will be unavailable"
      return 1
    else
      die "${friendly} is required but not installed. See README.md."
    fi
  fi
  success "${friendly} found: $(${cmd} --version 2>&1 | head -1)"
  return 0
}

check_node_version() {
  local version
  version=$(node --version | sed 's/v//')
  local major="${version%%.*}"
  if [[ "$major" -lt 20 ]]; then
    die "Node.js >= 20 is required (found v${version}). Install via nvm or nodejs.org."
  fi
  success "Node.js v${version} (>= 20 required)"
}

check_docker() {
  if ! command -v docker &>/dev/null; then
    die "Docker is required. Install Docker Desktop from https://docker.com"
  fi
  if ! docker info &>/dev/null; then
    die "Docker daemon is not running. Start Docker Desktop and try again."
  fi
  success "Docker $(docker --version | awk '{print $3}' | tr -d ',')"
}

check_docker_compose() {
  if docker compose version &>/dev/null; then
    success "Docker Compose $(docker compose version --short)"
  elif command -v docker-compose &>/dev/null; then
    warn "Using legacy docker-compose — upgrade to Docker Compose V2 for best results."
  else
    die "Docker Compose is required. Update Docker Desktop."
  fi
}

PYTHON_AVAILABLE=false
FLUTTER_AVAILABLE=false

check_node_version
check_command npm  ""  "npm"
check_docker
check_docker_compose
check_command git  ""  "git"

if check_command python3 "" "Python 3" "optional"; then
  python_ver=$(python3 --version | awk '{print $2}')
  python_major="${python_ver%%.*}"
  python_minor="${python_ver#*.}"; python_minor="${python_minor%%.*}"
  if [[ "$python_major" -ge 3 && "$python_minor" -ge 12 ]]; then
    success "Python ${python_ver} (>= 3.12 for ML services)"
    PYTHON_AVAILABLE=true
  else
    warn "Python ${python_ver} found but 3.12+ recommended for ML services"
  fi
fi

if check_command flutter "" "Flutter" "optional"; then
  FLUTTER_AVAILABLE=true
fi

if [[ "$MODE" == "check" ]]; then
  echo -e "\n${GREEN}${BOLD}All required prerequisites satisfied.${RESET}"
  exit 0
fi

# =============================================================================
# STEP 2 — Environment file
# =============================================================================
step "Environment configuration"

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ ! -f "$ENV_EXAMPLE" ]]; then
    die ".env.example not found at ${ENV_EXAMPLE}. Run from repo root or check git status."
  fi
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  success "Created .env from .env.example"
  warn "Review ${ENV_FILE} and fill in any REPLACE_ME values before proceeding."
  echo -e "\n  ${YELLOW}Press ENTER to continue or Ctrl+C to edit .env first...${RESET}"
  read -r
else
  success ".env already exists — skipping copy"
fi

# Check for un-filled placeholder values
UNFILLED=$(grep -c "REPLACE_ME\|CHANGE_ME\|<.*>" "$ENV_FILE" 2>/dev/null || true)
if [[ "$UNFILLED" -gt 0 ]]; then
  warn "${UNFILLED} placeholder value(s) found in .env — some services may not start correctly."
  warn "Run: grep -n 'REPLACE_ME\|CHANGE_ME' ${ENV_FILE}"
fi

# Source the env file for use in this script
set -o allexport
# shellcheck disable=SC1090
source "$ENV_FILE"
set +o allexport

# =============================================================================
# STEP 3 — npm workspace dependencies
# =============================================================================
step "Installing npm workspace dependencies"

cd "$REPO_ROOT"

if [[ ! -f "package.json" ]]; then
  die "package.json not found at repo root. Are you running from ${REPO_ROOT}?"
fi

if command -v turbo &>/dev/null; then
  log "Running: npm install (Turborepo monorepo)"
  npm install
  success "npm workspaces installed"
else
  warn "Turborepo not found globally — installing..."
  npm install -g turbo
  npm install
  success "npm workspaces installed"
fi

# =============================================================================
# STEP 4 — Docker infrastructure stack
# =============================================================================
step "Starting Docker infrastructure"

COMPOSE_CMD="docker compose -f ${COMPOSE_FILE}"

if [[ "$RESET_MODE" == true ]]; then
  warn "RESET MODE — destroying all containers and volumes..."
  echo -e "${RED}This will DELETE all local data (postgres, redis, minio, kafka).${RESET}"
  echo -n "  Type 'yes' to confirm: "
  read -r confirm
  if [[ "$confirm" != "yes" ]]; then
    die "Reset cancelled."
  fi
  $COMPOSE_CMD down -v --remove-orphans
  success "Stack destroyed — rebuilding from scratch"
fi

# Build compose profile list
PROFILES="--profile default"
if [[ "$START_APPS"       == true ]]; then PROFILES="$PROFILES --profile apps";       fi
if [[ "$START_ML"         == true ]]; then PROFILES="$PROFILES --profile ml";         fi
if [[ "$START_MONITORING" == true ]]; then PROFILES="$PROFILES --profile monitoring"; fi
if [[ "$START_TOOLS"      == true ]]; then PROFILES="$PROFILES --profile tools";      fi

log "Starting infrastructure services (postgres, redis, minio, kafka, weaviate)..."
$COMPOSE_CMD up -d \
  postgres redis minio minio-init \
  zookeeper kafka kafka-init \
  weaviate

success "Core infrastructure containers started"

# =============================================================================
# STEP 5 — Wait for services to be healthy
# =============================================================================
step "Waiting for services to be healthy"

wait_healthy() {
  local service="$1" max_wait="${2:-120}" interval=5 elapsed=0
  log "Waiting for ${service} to be healthy (max ${max_wait}s)..."

  while true; do
    local status
    status=$(docker inspect --format='{{.State.Health.Status}}' "tkllm-${service}" 2>/dev/null || echo "not-found")

    case "$status" in
      healthy)
        success "${service} is healthy"
        return 0
        ;;
      unhealthy)
        error "${service} is unhealthy — check logs: docker logs tkllm-${service}"
        return 1
        ;;
      not-found)
        error "Container tkllm-${service} not found"
        return 1
        ;;
    esac

    if [[ $elapsed -ge $max_wait ]]; then
      error "${service} did not become healthy within ${max_wait}s"
      log "Last logs:"
      docker logs --tail=20 "tkllm-${service}" 2>&1 || true
      return 1
    fi

    printf "  ⏳ %s — waiting... (%ds/%ds)\r" "$service" "$elapsed" "$max_wait"
    sleep $interval
    elapsed=$((elapsed + interval))
  done
}

wait_healthy postgres 120
wait_healthy redis    60
wait_healthy minio    60
wait_healthy kafka    120
wait_healthy weaviate 90

# Wait for init sidecars (they run once and exit — check exit code)
wait_sidecar() {
  local container="$1" max_wait="${2:-60}" elapsed=0 interval=5
  log "Waiting for ${container} to complete..."
  while true; do
    local status
    status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "not-found")
    local exit_code
    exit_code=$(docker inspect --format='{{.State.ExitCode}}' "$container" 2>/dev/null || echo "1")

    if [[ "$status" == "exited" && "$exit_code" == "0" ]]; then
      success "${container} completed successfully"
      return 0
    elif [[ "$status" == "exited" && "$exit_code" != "0" ]]; then
      warn "${container} exited with code ${exit_code} — check: docker logs ${container}"
      return 1
    fi

    if [[ $elapsed -ge $max_wait ]]; then
      warn "${container} did not complete within ${max_wait}s — it may still be running"
      return 0
    fi

    printf "  ⏳ %s — running... (%ds/%ds)\r" "$container" "$elapsed" "$max_wait"
    sleep $interval
    elapsed=$((elapsed + interval))
  done
}

wait_sidecar "tkllm-minio-init" 60
wait_sidecar "tkllm-kafka-init" 120

# =============================================================================
# STEP 6 — Prisma database migrations + seed
# =============================================================================
step "Running Prisma migrations"

API_DIR="${REPO_ROOT}/apps/api"

if [[ ! -f "${API_DIR}/prisma/schema.prisma" ]]; then
  warn "Prisma schema not found at ${API_DIR}/prisma/schema.prisma"
  warn "Skipping migrations — create the schema first and re-run setup."
else
  log "Generating Prisma client..."
  cd "$API_DIR"
  npx prisma generate
  success "Prisma client generated"

  log "Running database migrations..."
  DATABASE_URL="postgresql://${POSTGRES_USER:-tkllm_user}:${POSTGRES_PASSWORD:-tkllm_password}@localhost:${DATABASE_PORT:-5432}/${POSTGRES_DB:-tkllm_darija}"
  export DATABASE_URL

  npx prisma migrate deploy
  success "Migrations applied"

  if [[ -f "${API_DIR}/prisma/seed.ts" || -f "${API_DIR}/prisma/seed.js" ]]; then
    log "Running database seed..."
    npm run db:seed 2>/dev/null || warn "Seed script failed or not configured — skipping"
  fi

  cd "$REPO_ROOT"
fi

# =============================================================================
# STEP 7 — Optional: Start ML stack
# =============================================================================
if [[ "$START_ML" == true ]]; then
  step "Starting ML stack (MLflow + Prefect)"
  $COMPOSE_CMD --profile ml up -d mlflow prefect
  wait_healthy mlflow  60
  success "ML stack started"
fi

# =============================================================================
# STEP 8 — Optional: Start monitoring stack
# =============================================================================
if [[ "$START_MONITORING" == true ]]; then
  step "Starting monitoring stack (Prometheus + Grafana)"
  $COMPOSE_CMD --profile monitoring up -d prometheus grafana
  wait_healthy prometheus 30
  success "Monitoring stack started"
fi

# =============================================================================
# STEP 9 — Optional: Start dev tools
# =============================================================================
if [[ "$START_TOOLS" == true ]]; then
  step "Starting dev tools (Kafka UI, pgAdmin, MailHog, Redis Commander)"
  $COMPOSE_CMD --profile tools up -d kafka-ui pgadmin mailhog redis-commander
  success "Dev tools started"
fi

# =============================================================================
# STEP 10 — Optional: Start app services
# =============================================================================
if [[ "$START_APPS" == true ]]; then
  step "Starting application services"

  # Check that source directories exist
  for app in api web-contributor web-b2b; do
    if [[ ! -d "${REPO_ROOT}/apps/${app}/src" ]]; then
      warn "apps/${app}/src not found — skipping (run: turbo run build --filter=@tkllm/${app})"
    fi
  done

  $COMPOSE_CMD --profile apps up -d api web-contributor web-b2b \
    quality-engine analytics-service financial-service
  success "App services started"
fi

# =============================================================================
# STEP 11 — Flutter setup (optional)
# =============================================================================
if [[ "$FLUTTER_AVAILABLE" == true && -d "${REPO_ROOT}/apps/mobile" ]]; then
  step "Flutter mobile app setup"
  cd "${REPO_ROOT}/apps/mobile"
  flutter pub get
  success "Flutter dependencies installed"
  log "Run the mobile app with: cd apps/mobile && flutter run"
  cd "$REPO_ROOT"
fi

# =============================================================================
# STEP 12 — Verify
# =============================================================================
step "Verifying stack"

check_endpoint() {
  local name="$1" url="$2" expected_code="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "$url" 2>/dev/null || echo "000")
  if [[ "$code" == "$expected_code" || "$code" == "200" || "$code" == "301" || "$code" == "302" ]]; then
    success "${name}: ${url} (HTTP ${code})"
  else
    warn "${name}: ${url} — HTTP ${code} (may still be starting)"
  fi
}

check_endpoint "PostgreSQL"  "http://localhost:${DATABASE_PORT:-5432}" "000"  # TCP only, curl will fail — just indicator
check_endpoint "MinIO API"   "http://localhost:9000/minio/health/live"
check_endpoint "MinIO UI"    "http://localhost:${MINIO_CONSOLE_PORT:-9001}"
check_endpoint "Weaviate"    "http://localhost:8085/v1/.well-known/ready"

if [[ "$START_ML"         == true ]]; then check_endpoint "MLflow"     "http://localhost:${MLFLOW_PORT:-5000}/health"; fi
if [[ "$START_ML"         == true ]]; then check_endpoint "Prefect"    "http://localhost:${PREFECT_PORT:-4200}/api/health"; fi
if [[ "$START_MONITORING" == true ]]; then check_endpoint "Prometheus" "http://localhost:9090/-/healthy"; fi
if [[ "$START_MONITORING" == true ]]; then check_endpoint "Grafana"    "http://localhost:3001/api/health"; fi
if [[ "$START_TOOLS"      == true ]]; then check_endpoint "Kafka UI"   "http://localhost:8090/actuator/health"; fi
if [[ "$START_TOOLS"      == true ]]; then check_endpoint "pgAdmin"    "http://localhost:5050"; fi
if [[ "$START_TOOLS"      == true ]]; then check_endpoint "MailHog"    "http://localhost:8025"; fi
if [[ "$START_APPS"       == true ]]; then check_endpoint "API"        "http://localhost:${API_PORT:-3000}/api/v1/health"; fi
if [[ "$START_APPS"       == true ]]; then check_endpoint "Web Contributor" "http://localhost:3002"; fi
if [[ "$START_APPS"       == true ]]; then check_endpoint "Web B2B"    "http://localhost:3003"; fi

# =============================================================================
# DONE — Print access URLs
# =============================================================================
echo -e "
${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}
${BOLD}${GREEN}  ✅  Tkllm-darija local dev stack is ready!${RESET}
${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}

${BOLD}Infrastructure${RESET}
  PostgreSQL     → localhost:${DATABASE_PORT:-5432}  (${POSTGRES_USER:-tkllm_user} / ${POSTGRES_PASSWORD:-tkllm_password})
  Redis          → localhost:${REDIS_PORT:-6379}
  MinIO API      → http://localhost:9000
  MinIO Console  → http://localhost:${MINIO_CONSOLE_PORT:-9001}  (minioadmin / minioadmin)
  Kafka          → localhost:9092
  Weaviate       → http://localhost:8085
"

if [[ "$START_ML" == true ]]; then
echo -e "${BOLD}ML Stack${RESET}
  MLflow         → http://localhost:${MLFLOW_PORT:-5000}
  Prefect        → http://localhost:${PREFECT_PORT:-4200}
"
fi

if [[ "$START_MONITORING" == true ]]; then
echo -e "${BOLD}Monitoring${RESET}
  Prometheus     → http://localhost:9090
  Grafana        → http://localhost:3001  (admin / admin)
"
fi

if [[ "$START_TOOLS" == true ]]; then
echo -e "${BOLD}Dev Tools${RESET}
  Kafka UI       → http://localhost:8090
  pgAdmin        → http://localhost:5050  (admin@tkllm.ma / admin)
  MailHog        → http://localhost:8025
  Redis Commander→ http://localhost:8081
"
fi

if [[ "$START_APPS" == true ]]; then
echo -e "${BOLD}Applications${RESET}
  API REST       → http://localhost:${API_PORT:-3000}/api/v1
  API GraphQL    → http://localhost:${API_PORT:-3000}/graphql
  Contributor    → http://localhost:3002
  B2B Portal     → http://localhost:3003
"
fi

echo -e "${BOLD}Useful commands${RESET}
  Start all apps:     npm run infra:up && turbo run dev
  Stop everything:    npm run infra:down
  Reset (wipe data):  bash infrastructure/scripts/setup-local.sh --reset
  View logs:          npm run infra:logs
  DB studio:          npm run db:studio
  Tail API logs:      docker logs -f tkllm-api
"