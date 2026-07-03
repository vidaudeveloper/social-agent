"""Probe tokenware /v1/models for DeepSeek IDs (no secrets printed)."""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
from pathlib import Path


def load_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        k, v = s.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def main() -> int:
    profile = Path(
        os.environ.get(
            "VIDAU_PROFILE",
            r"C:\Users\EDY\AppData\Local\vidau\profiles\social-agent",
        )
    )
    env = load_env(profile / ".env")
    key = env.get("TOKENWARE_API_KEY", "").strip()
    base = env.get("TOKENWARE_BASE_URL", "https://www.tokenware.ai/v1").rstrip("/")
    if not key:
        print("TOKENWARE_API_KEY missing", file=sys.stderr)
        return 1

    req = urllib.request.Request(
        f"{base}/models",
        headers={"Authorization": f"Bearer {key}"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    ids = [m.get("id", "") for m in data.get("data", []) if isinstance(m, dict)]
    hits = [i for i in ids if re.search(r"deepseek|flash", i, re.I)]
    out_path = profile / "cache" / "tokenware_deepseek_models.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(hits, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(hits)} ids to {out_path}")
    for i in hits:
        print(i)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
