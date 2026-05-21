#!/usr/bin/env bash
# Production catalog import: restore products.json + images from tag v1.0,
# run migrate in a one-off builder-stage container, then clean up.
#
# Usage:
#   ./scripts/migrate-prod.sh
#   npm run prod:migrate

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.prod.yml"
MIGRATION_TAG="v1.0"
PRODUCTS_JSON="${ROOT_DIR}/src/data/products.json"
PRODUCT_IMAGES_DIR="${ROOT_DIR}/public/images/products"
RESTORED=false

cd "$ROOT_DIR"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command not found: $1" >&2
    exit 1
  fi
}

cleanup_restored_files() {
  if [[ "$RESTORED" != true ]]; then
    return 0
  fi

  echo "Cleaning up restored migration files..."
  rm -rf "$PRODUCTS_JSON" "$PRODUCT_IMAGES_DIR"
}

trap cleanup_restored_files EXIT

require_command docker
require_command git

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: missing .env (copy from .env.example and set PAYLOAD_SECRET)" >&2
  exit 1
fi

if git fetch --tags 2>/dev/null; then
  :
else
  echo "Warning: git fetch --tags failed; using local tags only" >&2
fi

if ! git rev-parse --verify "refs/tags/${MIGRATION_TAG}^{commit}" >/dev/null 2>&1; then
  echo "Error: git tag not found: ${MIGRATION_TAG}" >&2
  exit 1
fi

echo "Restoring catalog source files from tag ${MIGRATION_TAG}..."
git checkout "${MIGRATION_TAG}" -- src/data/products.json public/images/products/
RESTORED=true

echo "Stopping web service to avoid SQLite WAL race..."
docker compose -f "$COMPOSE_FILE" stop web

echo "Running catalog migration in builder-stage container..."
docker compose -f "$COMPOSE_FILE" --profile tools run --rm --build migrate

echo "Starting web service..."
docker compose -f "$COMPOSE_FILE" start web

echo "Catalog migration finished successfully."
