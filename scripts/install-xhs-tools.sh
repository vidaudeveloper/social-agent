#!/usr/bin/env bash
# social-agent — 小红书卡片渲染（Auto-Redbook-Skills）
# 用法：npm run tool:install

set -euo pipefail

PROFILE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REDBOOK_ROOT="${AUTO_REDBOOK_ROOT:-$PROFILE_ROOT/tool/Auto-Redbook-Skills}"

echo "=== social-agent tool:install (xhs-card-render) ==="
echo "Profile: $PROFILE_ROOT"
echo "AUTO_REDBOOK_ROOT: $REDBOOK_ROOT"
echo ""

RENDER_PY="$REDBOOK_ROOT/scripts/render_xhs.py"
if [[ ! -f "$RENDER_PY" ]]; then
  echo "[1/5] clone Auto-Redbook-Skills ..."
  mkdir -p "$(dirname "$REDBOOK_ROOT")"
  git clone https://github.com/comeonzhj/Auto-Redbook-Skills.git "$REDBOOK_ROOT"
fi

CUSTOM_THEMES="$PROFILE_ROOT/assets/xhs-themes"
TARGET_THEMES="$REDBOOK_ROOT/assets/themes"
if [[ -d "$CUSTOM_THEMES" ]]; then
  echo "[2/5] sync custom themes from assets/xhs-themes ..."
  mkdir -p "$TARGET_THEMES"
  cp -f "$CUSTOM_THEMES"/*.css "$TARGET_THEMES/" 2>/dev/null || true
else
  echo "[2/5] no assets/xhs-themes, skip theme sync"
fi

if ! command -v uv >/dev/null 2>&1; then
  echo "[error] uv not found. Install: https://docs.astral.sh/uv/" >&2
  exit 1
fi

cd "$REDBOOK_ROOT"
if [[ ! -d .venv ]]; then
  echo "[3/5] uv venv ..."
  uv venv
fi

echo "[4/5] uv pip install -r requirements.txt ..."
uv pip install -r requirements.txt

echo "[5/5] playwright install chromium ..."
uv run playwright install chromium

echo ""
echo "[done] xhs-card-render ready"
echo "  npm run pipeline:xhs -- -Slug your-slug"
echo "  npm run xhs:card-render -- -File \"<配图.md绝对路径>\""
