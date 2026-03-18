#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <portal_base_url> <path_to_run_report_json>"
  exit 1
fi

PORTAL_BASE_URL="$1"
REPORT_PATH="$2"

if [[ -z "${PORTAL_INGEST_TOKEN:-}" ]]; then
  echo "Missing PORTAL_INGEST_TOKEN env var"
  exit 1
fi

curl -sS \
  -X POST "${PORTAL_BASE_URL%/}/api/ingest/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${PORTAL_INGEST_TOKEN}" \
  --data-binary "@${REPORT_PATH}"

