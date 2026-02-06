#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

dotnet run --project "$ROOT_DIR/src/Bootstrappers/WiSave.Bootstrapper" -- schema export --output "$ROOT_DIR/schema.graphql"
cp "$ROOT_DIR/schema.graphql" "$ROOT_DIR/ui/schema.graphql"
