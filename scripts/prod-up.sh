#!/usr/bin/env bash
# Production bootstrap: prepare .env, seed secrets/admin on first deploy, start docker compose.
#
# Usage:
#   ./scripts/prod-up.sh          # up -d, no log follow
#   ./scripts/prod-up.sh --follow # up -d, then tail logs
#   npm run prod:up

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
ENV_EXAMPLE="${ROOT_DIR}/.env.example"
DB_FILE="${ROOT_DIR}/data/payload.db"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.prod.yml"
FOLLOW_LOGS=false

PAYLOAD_SECRET_PLACEHOLDER='replace-with-strong-random-string-min-16-chars'
ADMIN_EMAIL_PLACEHOLDER='admin@example.com'
ADMIN_PASSWORD_PLACEHOLDER='replace-with-strong-password-min-8-chars'
MIN_PASSWORD_LENGTH=8

for arg in "$@"; do
  case "$arg" in
    --follow | -f) FOLLOW_LOGS=true ;;
    -h | --help)
      echo "Usage: $0 [--follow|-f]"
      echo "  Prepares .env, generates PAYLOAD_SECRET if needed,"
      echo "  prompts for admin credentials on first deploy (empty DB),"
      echo "  then runs: docker compose -f docker-compose.prod.yml up --build -d"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg (try --help)" >&2
      exit 1
      ;;
  esac
done

cd "$ROOT_DIR"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command not found: $1" >&2
    exit 1
  fi
}

require_command openssl
require_command docker

# Read KEY=value from .env (ignores comments and blank lines).
get_env_var() {
  local key="$1"
  if [[ ! -f "$ENV_FILE" ]]; then
    echo ""
    return
  fi
  local line
  line="$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -n 1 || true)"
  if [[ -z "$line" ]]; then
    echo ""
    return
  fi
  echo "${line#*=}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

is_placeholder_secret() {
  local value="$1"
  [[ -z "$value" ]] && return 0
  [[ "$value" == "$PAYLOAD_SECRET_PLACEHOLDER" ]] && return 0
  [[ "$value" == 'change-me-local-dev-secret' ]] && return 0
  [[ "$value" == 'dev-local-payload-secret-change-me' ]] && return 0
  return 1
}

is_placeholder_admin_email() {
  local value="$1"
  [[ -z "$value" ]] && return 0
  [[ "$value" == "$ADMIN_EMAIL_PLACEHOLDER" ]] && return 0
  [[ "$value" == 'admin@local.dev' ]] && return 0
  return 1
}

is_placeholder_admin_password() {
  local value="$1"
  [[ -z "$value" ]] && return 0
  [[ "$value" == "$ADMIN_PASSWORD_PLACEHOLDER" ]] && return 0
  [[ "$value" == 'changeme-local-only' ]] && return 0
  return 1
}

is_valid_email() {
  local value="$1"
  [[ "$value" == *@* ]] && [[ "$value" != @* ]] && [[ "$value" != *@ ]]
}

# Update or append KEY=VALUE in .env atomically.
upsert_env_var() {
  local key="$1"
  local value="$2"
  local tmp
  tmp="$(mktemp "${ENV_FILE}.XXXXXX")"

  if [[ -f "$ENV_FILE" ]]; then
    awk -v k="$key" -v v="$value" '
      BEGIN { found = 0 }
      $0 ~ ("^" k "=") { print k "=" v; found = 1; next }
      { print }
      END { if (!found) print k "=" v }
    ' "$ENV_FILE" >"$tmp"
  else
    echo "${key}=${value}" >"$tmp"
  fi

  mv "$tmp" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
}

ensure_env_file() {
  if [[ -f "$ENV_FILE" ]]; then
    chmod 600 "$ENV_FILE"
    return
  fi
  if [[ ! -f "$ENV_EXAMPLE" ]]; then
    echo "Error: .env not found and .env.example is missing." >&2
    exit 1
  fi
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "Created ${ENV_FILE} from .env.example"
}

warn_stale_admin_password() {
  if [[ ! -f "$DB_FILE" ]]; then
    return
  fi
  local password
  password="$(get_env_var ADMIN_PASSWORD)"
  if is_placeholder_admin_password "$password"; then
    return
  fi
  echo "Warning: ADMIN_PASSWORD is still set in .env after bootstrap." >&2
  echo "  Seed only runs when users collection is empty — remove ADMIN_PASSWORD from .env" >&2
  echo "  (and from the container env) so it is not visible via docker inspect." >&2
}

ensure_payload_secret() {
  local current
  current="$(get_env_var PAYLOAD_SECRET)"
  if ! is_placeholder_secret "$current"; then
    echo "PAYLOAD_SECRET: already set"
    return
  fi

  local secret
  secret="$(openssl rand -base64 32 | tr -d '\n')"
  upsert_env_var PAYLOAD_SECRET "$secret"
  echo "PAYLOAD_SECRET: generated and saved to .env"
}

prompt_admin_credentials() {
  local email password confirm

  while true; do
    read -rp "Admin email: " email
    email="$(echo "$email" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    if is_valid_email "$email"; then
      break
    fi
    echo "Invalid email (must contain @)." >&2
  done

  while true; do
    read -rsp "Admin password (min ${MIN_PASSWORD_LENGTH} chars): " password
    echo
    if [[ ${#password} -ge $MIN_PASSWORD_LENGTH ]]; then
      break
    fi
    echo "Password too short (min ${MIN_PASSWORD_LENGTH} characters)." >&2
  done

  while true; do
    read -rsp "Confirm password: " confirm
    echo
    if [[ "$password" == "$confirm" ]]; then
      break
    fi
    echo "Passwords do not match. Try again." >&2
  done

  upsert_env_var ADMIN_EMAIL "$email"
  upsert_env_var ADMIN_PASSWORD "$password"
  echo "Admin credentials saved to .env"
}

ensure_admin_credentials() {
  if [[ -f "$DB_FILE" ]]; then
    echo "Database exists (${DB_FILE}) — skipping admin prompt"
    return
  fi

  local email password
  email="$(get_env_var ADMIN_EMAIL)"
  password="$(get_env_var ADMIN_PASSWORD)"

  if ! is_placeholder_admin_email "$email" && ! is_placeholder_admin_password "$password"; then
    if is_valid_email "$email" && [[ ${#password} -ge $MIN_PASSWORD_LENGTH ]]; then
      echo "Admin credentials: already set in .env (first deploy)"
      return
    fi
    echo "Warning: ADMIN_EMAIL/ADMIN_PASSWORD in .env are invalid — will prompt." >&2
  fi

  echo "First deploy (no database) — set admin credentials for Payload CMS:"
  prompt_admin_credentials
}

ensure_env_file
ensure_payload_secret
ensure_admin_credentials
warn_stale_admin_password

echo
echo "Starting production stack..."
docker compose -f "$COMPOSE_FILE" up --build -d

echo
echo "Production stack is up."
SITE_URL="$(get_env_var NEXT_PUBLIC_SITE_URL)"
if [[ -z "$SITE_URL" || "$SITE_URL" == http://localhost* ]]; then
  SITE_URL="https://yaninav.ru"
fi
echo "  Site:    ${SITE_URL}  (via Caddy on :80/:443)"
echo "  Admin:   ${SITE_URL%/}/admin"
echo "  Note:    web:3000 is not published on the host — only reachable inside the Docker network."
echo "  Logs:    docker compose -f docker-compose.prod.yml logs -f"

if [[ "$FOLLOW_LOGS" == true ]]; then
  docker compose -f "$COMPOSE_FILE" logs -f --tail=50
fi
