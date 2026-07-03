"""Smoke-test tokenware chat using profile config.yaml model.default."""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

FALLBACK_MODEL = "DeepSeek：DeepSeek V4 Flash"


def profile_root() -> Path:
    return Path(
        os.environ.get(
            "VIDAU_PROFILE",
            r"C:\Users\EDY\AppData\Local\vidau\profiles\social-agent",
        )
    )


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


def load_model_from_config(path: Path) -> str | None:
    if not path.is_file():
        return None
    text = path.read_text(encoding="utf-8")
    m = re.search(
        r'^\s*default:\s*(?:"([^"]+)"|\'([^\']+)\'|(\S+))',
        text,
        re.MULTILINE,
    )
    if not m:
        return None
    return next(g for g in m.groups() if g)


def resolve_model(profile: Path) -> str:
    override = os.environ.get("TEST_MODEL", "").strip()
    if override:
        return override
    from_config = load_model_from_config(profile / "config.yaml")
    return from_config or FALLBACK_MODEL


def main() -> int:
    profile = profile_root()
    env = load_env(profile / ".env")
    key = env.get("TOKENWARE_API_KEY", "").strip()
    if not key:
        print(json.dumps({"status": "FAIL", "error": "TOKENWARE_API_KEY missing in .env"}))
        return 1

    base = env.get("TOKENWARE_BASE_URL", "https://www.tokenware.ai/v1").rstrip("/")
    model = resolve_model(profile)
    body = json.dumps(
        {
            "model": model,
            "messages": [{"role": "user", "content": "ping"}],
            "max_tokens": 8,
        },
        ensure_ascii=False,
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{base}/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        reply = data["choices"][0]["message"]["content"]
        print(
            json.dumps(
                {"status": "OK", "model": model, "reply": reply[:80]},
                ensure_ascii=False,
            )
        )
        return 0
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        print(
            json.dumps(
                {
                    "status": "FAIL",
                    "model": model,
                    "http": exc.code,
                    "detail": detail[:300],
                },
                ensure_ascii=False,
            )
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
