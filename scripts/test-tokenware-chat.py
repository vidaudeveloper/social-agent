"""Smoke-test tokenware chat with configured model id."""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from pathlib import Path


def load_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        k, v = s.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def main() -> None:
    profile = Path(
        os.environ.get(
            "VIDAU_PROFILE",
            r"C:\Users\EDY\AppData\Local\vidau\profiles\social-agent",
        )
    )
    env = load_env(profile / ".env")
    key = env["TOKENWARE_API_KEY"]
    base = env.get("TOKENWARE_BASE_URL", "https://www.tokenware.ai/v1").rstrip("/")
    model = os.environ.get("TEST_MODEL", "DeepSeek：DeepSeek V4 Flash")
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
        print("OK", model, data["choices"][0]["message"]["content"][:40])
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        print("FAIL", model, exc.code, detail[:200])


if __name__ == "__main__":
    main()
