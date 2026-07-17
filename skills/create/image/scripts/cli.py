#!/usr/bin/env python3
"""tokenware 生图 CLI — OpenAI 兼容 /v1/images/generations"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

API_URL = "https://www.tokenware.ai/v1/images/generations"
DEFAULT_MODEL = "gpt-image-2"

PLATFORM_PRESETS: dict[str, dict[str, str]] = {
    "zhihu": {"size": "1792x1024", "label": "知乎封面 16:9"},
    "wechat": {"size": "1792x1024", "label": "公众号封面 16:9"},
    "gongzhonghao": {"size": "1792x1024", "label": "公众号封面 16:9"},
    "xiaohongshu": {"size": "1024x1792", "label": "小红书卡片 3:4"},
    "xhs": {"size": "1024x1792", "label": "小红书卡片 3:4"},
    "douyin": {"size": "1792x1024", "label": "抖音封面 16:9"},
    "youtube": {"size": "1792x1024", "label": "YouTube 封面 16:9"},
    "square": {"size": "1024x1024", "label": "正方形 1:1"},
}


def repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def content_root() -> Path:
    return Path(os.environ.get("CONTENT_ROOT", "./content"))


def resolve_env_path() -> Path | None:
    explicit = os.environ.get("CONTENT_ENV_PATH")
    if explicit:
        path = Path(explicit)
        if path.is_file():
            return path
    default = repo_root() / ".env"
    if default.is_file():
        return default
    return None


def load_api_key() -> str:
    env_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if env_key and "***" not in env_key:
        return env_key.strip('"').strip("'")

    env_path = resolve_env_path()
    if not env_path:
        raise RuntimeError(
            "未找到 OPENAI_API_KEY。请写入 Hermes .env（hermes config env-path）或设置环境变量。"
        )

    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("OPENAI_API_KEY=") and "***" not in stripped:
            return stripped.split("=", 1)[1].strip().strip('"').strip("'")

    raise RuntimeError(f"在 {env_path} 中未找到 OPENAI_API_KEY")


def download_image(url: str, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as resp, out_path.open("wb") as f:
        f.write(resp.read())


def generate_image(
    *,
    prompt: str,
    size: str,
    model: str,
    out_path: Path,
    response_format: str = "url",
) -> dict:
    key = load_api_key()
    payload = {
        "model": model,
        "prompt": prompt,
        "n": 1,
        "size": size,
        "response_format": response_format,
    }
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"tokenware API HTTP {exc.code}: {detail}") from exc

    item = body["data"][0]
    if response_format == "url":
        download_image(item["url"], out_path)
    else:
        import base64

        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(base64.b64decode(item["b64_json"]))

    result = {
        "ok": True,
        "path": str(out_path.resolve()),
        "model": model,
        "size": size,
        "prompt": prompt,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def cmd_check_key() -> int:
    key = load_api_key()
    masked = f"{key[:4]}...{key[-4:]}" if len(key) > 8 else "***"
    print(json.dumps({"ok": True, "keyPreview": masked}, ensure_ascii=False))
    return 0


def cmd_generate(args: argparse.Namespace) -> int:
    platform = (args.platform or "").lower()
    if platform:
        preset = PLATFORM_PRESETS.get(platform)
        if not preset:
            known = ", ".join(sorted(set(PLATFORM_PRESETS.keys())))
            raise RuntimeError(f"未知平台 '{platform}'，可选: {known}")
        size = args.size or preset["size"]
    else:
        size = args.size or "1792x1024"

    out = Path(args.out) if args.out else default_out_path(platform or "cover")
    generate_image(
        prompt=args.prompt,
        size=size,
        model=args.model,
        out_path=out,
        response_format=args.format,
    )
    return 0


def default_out_path(platform: str) -> Path:
    from datetime import datetime

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    folder_map = {
        "zhihu": "知乎",
        "wechat": "公众号",
        "gongzhonghao": "公众号",
        "xiaohongshu": "小红书",
        "xhs": "小红书",
        "douyin": "抖音",
        "youtube": "YouTube",
    }
    folder = folder_map.get(platform, "通用")
    return content_root() / "图片" / folder / f"{ts}.png"


def cmd_presets() -> int:
    print(json.dumps(PLATFORM_PRESETS, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except OSError:
            pass

    parser = argparse.ArgumentParser(description="tokenware 生图 CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    p_check = sub.add_parser("check-key", help="检查 OPENAI_API_KEY 是否可读")
    p_check.set_defaults(func=lambda _a: cmd_check_key())

    p_presets = sub.add_parser("presets", help="列出平台尺寸预设")
    p_presets.set_defaults(func=lambda _a: cmd_presets())

    p_gen = sub.add_parser("generate", help="生成单张图片")
    p_gen.add_argument("--prompt", required=True, help="生图提示词")
    p_gen.add_argument(
        "--platform",
        choices=sorted(set(PLATFORM_PRESETS.keys())),
        help="平台预设尺寸（zhihu/wechat/xiaohongshu/douyin/...）",
    )
    p_gen.add_argument("--size", help="覆盖尺寸，如 1792x1024")
    p_gen.add_argument("--model", default=DEFAULT_MODEL, help=f"模型，默认 {DEFAULT_MODEL}")
    p_gen.add_argument("--out", help="输出文件路径")
    p_gen.add_argument(
        "--format",
        default="url",
        choices=["url", "b64_json"],
        help="API response_format",
    )
    p_gen.set_defaults(func=cmd_generate)

    args = parser.parse_args()
    try:
        return args.func(args)
    except Exception as exc:  # noqa: BLE001 — CLI 统一错误输出
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
