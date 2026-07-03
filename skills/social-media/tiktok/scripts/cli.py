#!/usr/bin/env python3
"""TikTok 海外版发布 CLI — 基于 social-auto-upload tk_uploader"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path


def repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def sau_root() -> Path:
    raw = os.environ.get("SAU_ROOT", "./tool/social-auto-upload")
    path = Path(raw)
    if not path.is_absolute():
        path = repo_root() / path
    if not (path / "sau_cli.py").is_file():
        raise FileNotFoundError(f"social-auto-upload not found: {path}")
    return path.resolve()


def account_file(account: str) -> Path:
    base = sau_root()
    return base / "cookies" / "tk_uploader" / f"{account}.json"


async def cmd_login(account: str, headed: bool) -> int:
    sys.path.insert(0, str(sau_root()))
    from uploader.tk_uploader.main_chrome import tiktok_setup

    path = account_file(account)
    path.parent.mkdir(parents=True, exist_ok=True)
    ok = await tiktok_setup(str(path), handle=True)
    print(json.dumps({"ok": bool(ok), "account": account, "cookie": str(path)}, ensure_ascii=False))
    return 0 if ok else 1


async def cmd_check(account: str) -> int:
    path = account_file(account)
    valid = path.is_file() and path.stat().st_size > 10
    print(json.dumps({"ok": True, "loggedIn": valid, "account": account, "cookie": str(path)}, ensure_ascii=False))
    return 0 if valid else 1


async def cmd_publish(account: str, video: str, title: str, tags: str, headed: bool) -> int:
    sys.path.insert(0, str(sau_root()))
    from datetime import datetime
    from uploader.tk_uploader.main_chrome import TiktokVideo, tiktok_setup

    video_path = Path(video).resolve()
    if not video_path.is_file():
        raise FileNotFoundError(video)

    cookie = account_file(account)
    ready = await tiktok_setup(str(cookie), handle=False)
    if not ready:
        raise RuntimeError(f"TikTok cookie invalid: {cookie}. Run: login --account {account}")

    tag_list = [t.strip() for t in tags.replace(",", " ").split() if t.strip()]
    app = TiktokVideo(title, video_path, tag_list, datetime.now(), str(cookie))
    await app.main()
    print(json.dumps({"ok": True, "video": str(video_path), "title": title}, ensure_ascii=False))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="TikTok Skills CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    p_login = sub.add_parser("login")
    p_login.add_argument("--account", default=os.environ.get("TIKTOK_ACCOUNT_ID", "default"))

    p_check = sub.add_parser("check-login")
    p_check.add_argument("--account", default=os.environ.get("TIKTOK_ACCOUNT_ID", "default"))

    p_pub = sub.add_parser("publish")
    p_pub.add_argument("--video", "-v", required=True)
    p_pub.add_argument("--title", "-t", required=True)
    p_pub.add_argument("--tags", default="")
    p_pub.add_argument("--account", default=os.environ.get("TIKTOK_ACCOUNT_ID", "default"))

    args = parser.parse_args()
    headed = os.environ.get("SAU_HEADED", "true").lower() == "true"

    try:
        if args.command == "login":
            return asyncio.run(cmd_login(args.account, headed))
        if args.command == "check-login":
            return asyncio.run(cmd_check(args.account))
        if args.command == "publish":
            return asyncio.run(cmd_publish(args.account, args.video, args.title, args.tags, headed))
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 1
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
