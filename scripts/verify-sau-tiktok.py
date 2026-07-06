"""Verify social-auto-upload TikTok uploader imports (run from SAU_ROOT via uv)."""
import sys
from pathlib import Path

sau_root = Path(__file__).resolve().parents[1] / "tool" / "social-auto-upload"
if not (sau_root / "conf.py").is_file() and (sau_root / "conf.example.py").is_file():
    raise SystemExit(f"conf.py missing. Run: npm run overseas:install ({sau_root})")
if not sau_root.is_dir():
    raise SystemExit(f"social-auto-upload not found: {sau_root}")

sys.path.insert(0, str(sau_root))

import playwright  # noqa: F401
from uploader.tk_uploader.main_chrome import tiktok_setup  # noqa: F401

print("ok: playwright + tk_uploader")
