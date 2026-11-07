#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
export PYTHONPATH="${ROOT}/src${PYTHONPATH:+:$PYTHONPATH}"
RUN_DIR="${1:-runs/dry-run-v1}"
exec python3 -m mass_import.pipeline \
  --manifest manifests/dry-run-v1.jsonl \
  --run-dir "$RUN_DIR" \
  --catalogue-root "${ROOT}/../.." \
  --fixtures-root "${ROOT}/fixtures" \
  --no-fetch \
  "${@:2}"
