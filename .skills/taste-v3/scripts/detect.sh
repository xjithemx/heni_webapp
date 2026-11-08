#!/usr/bin/env bash
# Taste v3 wrapper for Impeccable's deterministic detector (60+ slop and quality rules).
# Usage: bash scripts/detect.sh <file|dir|url> [--json]
# Source files (JSX/TSX) get pattern rules only; rendered-page rules (contrast, tiny text,
# overflow) run when the target is an HTML file served by a browser or a URL.
# Exit: 0 clean, 2 findings, 1 target could not be scanned, 3 detector unavailable.
set -u
if [ $# -eq 0 ]; then echo "usage: detect.sh <file|dir|url> [--json]"; exit 1; fi
if ! command -v npx >/dev/null 2>&1; then
  echo "DETECTOR UNAVAILABLE: npx not found. Run scripts/taste_scan.py alone and say the detector did not run."; exit 3
fi
tmp=$(mktemp)
timeout 180 npx --yes impeccable detect "$@" >"$tmp" 2>&1
code=$?
out=$(grep -v '^npm notice' "$tmp"); rm -f "$tmp"
echo "$out"
if [ "$code" = "124" ] || echo "$out" | grep -qiE 'ENOTFOUND|EAI_AGAIN|ECONNREFUSED|403 Forbidden|network'; then
  echo "DETECTOR UNAVAILABLE (network/egress). Run scripts/taste_scan.py alone and say the detector did not run."; exit 3
fi
exit $code
