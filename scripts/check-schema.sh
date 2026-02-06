#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_SCHEMA="$(mktemp)"

cleanup() {
  rm -f "$TMP_SCHEMA"
}
trap cleanup EXIT

dotnet run --project "$ROOT_DIR/src/Bootstrappers/WiSave.Bootstrapper" -- schema export --output "$TMP_SCHEMA"

if ! diff -u "$ROOT_DIR/schema.graphql" "$TMP_SCHEMA"; then
  echo "schema.graphql is out of date. Run ./scripts/export-schema.sh"
  exit 1
fi
