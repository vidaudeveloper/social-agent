#!/usr/bin/env bash
# Playwright browsers for PVA (Douyin) — macOS / Linux
# Usage: npm run douyin:setup

set -euo pipefail

PROFILE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEFAULT_BROWSERS="${PROFILE_ROOT}/tool/playwright-browsers"
BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$DEFAULT_BROWSERS}"
DOWNLOAD_HOST="${PLAYWRIGHT_DOWNLOAD_HOST:-https://cdn.npmmirror.com/binaries/playwright}"

echo "=== douyin:setup (Playwright for PVA) ==="
echo "PLAYWRIGHT_BROWSERS_PATH: ${BROWSERS_PATH}"
echo "PLAYWRIGHT_DOWNLOAD_HOST: ${DOWNLOAD_HOST}"
echo ""

mkdir -p "${BROWSERS_PATH}"
export PLAYWRIGHT_BROWSERS_PATH="${BROWSERS_PATH}"
export PLAYWRIGHT_DOWNLOAD_HOST="${DOWNLOAD_HOST}"

echo "Installing playwright@1.61.1 chromium (npmmirror) ..."
npx playwright@1.61.1 install chromium

echo ""
echo "[done] Playwright ready at ${BROWSERS_PATH}"
echo "Next: npm run douyin:login"
