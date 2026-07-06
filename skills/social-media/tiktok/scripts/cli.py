#!/usr/bin/env python3
"""TikTok 海外版发布 CLI — 基于 social-auto-upload tk_uploader"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

CHROME_CANDIDATES = [
    os.environ.get("TIKTOK_CHROME_PATH", "").strip(),
    os.environ.get("SAU_CHROME_PATH", "").strip(),
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]


def repo_root() -> Path:
    # .../skills/social-media/tiktok/scripts/cli.py → profile root
    return Path(__file__).resolve().parents[4]


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


def resolve_chrome_path() -> str | None:
    for candidate in CHROME_CANDIDATES:
        if candidate and Path(candidate).is_file():
            return candidate
    return None


def apply_headed_conf() -> None:
    """登录/发布前强制有头 Chrome，避免 SAU 默认 headless 导致看不见登录页。"""
    import conf

    conf.LOCAL_CHROME_HEADLESS = False
    chrome = resolve_chrome_path()
    if chrome:
        conf.LOCAL_CHROME_PATH = chrome


LOGIN_COOKIE_NAMES = frozenset(
    {"sessionid", "sessionid_ss", "sid_tt", "uid_tt", "sid_guard", "multi_sids"}
)


def build_launch_kwargs(conf) -> dict:
    launch_kwargs: dict = {
        "headless": False,
        "args": ["--lang=en-US"],
    }
    if conf.LOCAL_CHROME_PATH:
        launch_kwargs["executable_path"] = conf.LOCAL_CHROME_PATH
    return launch_kwargs


async def verify_tiktok_logged_in(page, context) -> bool:
    """在 TikTok Studio 上传页确认已登录（与发布流程一致）。"""
    try:
        await page.goto(
            "https://www.tiktok.com/tiktokstudio/upload?lang=en",
            wait_until="domcontentloaded",
            timeout=90_000,
        )
        await page.wait_for_timeout(4000)
    except Exception:
        return False

    if "login" in page.url.lower():
        return False

    iframe = page.locator('iframe[data-tt="Upload_index_iframe"]')
    upload = page.locator("div.upload-container")
    select_btn = page.locator('button:has-text("Select video")')
    if await iframe.count() > 0 or await upload.count() > 0 or await select_btn.count() > 0:
        return True

    names = {c["name"] for c in await context.cookies()}
    return bool(names & LOGIN_COOKIE_NAMES)


async def verify_tiktok_cookie_file(account_path: Path, conf) -> bool:
    from playwright.async_api import async_playwright
    from utils.base_social_media import set_init_script

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(**build_launch_kwargs(conf))
        context = await browser.new_context(storage_state=str(account_path))
        context = await set_init_script(context)
        page = await context.new_page()
        ok = await verify_tiktok_logged_in(page, context)
        await browser.close()
        return ok


async def interactive_tiktok_login(account_path: Path) -> bool:
    """有头浏览器登录，终端 Enter 确认后保存 cookie（替代 SAU page.pause）。"""
    sys.path.insert(0, str(sau_root()))
    apply_headed_conf()
    from playwright.async_api import async_playwright
    from utils.base_social_media import set_init_script

    import conf

    account_path.parent.mkdir(parents=True, exist_ok=True)

    print("\n=== TikTok 登录 ===", flush=True)
    print("1. 将打开 Chrome 到 TikTok 登录页", flush=True)
    print("2. 在浏览器中完成登录，直到能看到首页或上传页（含验证码/2FA）", flush=True)
    print("3. 确认已登录后回到终端按 Enter — 脚本会跳转上传页校验", flush=True)
    print("4. 若校验失败，浏览器保持打开，请继续登录后再次按 Enter\n", flush=True)

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(**build_launch_kwargs(conf))
        context = await browser.new_context()
        context = await set_init_script(context)
        page = await context.new_page()
        await page.goto("https://www.tiktok.com/login?lang=en", wait_until="domcontentloaded")

        while True:
            await asyncio.get_event_loop().run_in_executor(
                None, input, "登录完成后按 Enter 校验并保存 cookie… "
            )
            if await verify_tiktok_logged_in(page, context):
                await context.storage_state(path=str(account_path))
                await browser.close()
                break
            print(
                "\n[!] 未检测到有效登录（上传页不可访问或缺少 session cookie）。\n"
                "    请在浏览器中完成登录，可手动打开: https://www.tiktok.com/tiktokstudio/upload\n"
                "    确认能进入上传页后，再按 Enter 重试。\n",
                flush=True,
            )

    ok = account_path.is_file() and account_path.stat().st_size > 10
    if not ok:
        print(json.dumps({"ok": False, "error": "cookie 未保存或文件过小，请重试登录"}, ensure_ascii=False), file=sys.stderr)
        return False

    apply_headed_conf()
    valid = await verify_tiktok_cookie_file(account_path, conf)
    if not valid:
        print(
            json.dumps(
                {"ok": False, "error": "cookie 已保存但上传页校验未通过，请重新 login"},
                ensure_ascii=False,
            ),
            file=sys.stderr,
        )
    return valid


async def cmd_login(account: str, headed: bool) -> int:
    path = account_file(account)
    ok = await interactive_tiktok_login(path)
    print(
        json.dumps(
            {"ok": ok, "loggedIn": ok, "account": account, "cookie": str(path)},
            ensure_ascii=False,
        )
    )
    return 0 if ok else 1


async def cmd_check(account: str) -> int:
    path = account_file(account)
    exists = path.is_file() and path.stat().st_size > 10
    valid = False
    if exists:
        sys.path.insert(0, str(sau_root()))
        apply_headed_conf()
        import conf

        valid = await verify_tiktok_cookie_file(path, conf)
    print(
        json.dumps(
            {"ok": True, "loggedIn": valid, "account": account, "cookie": str(path)},
            ensure_ascii=False,
        )
    )
    return 0


async def cmd_publish(account: str, video: str, title: str, tags: str, headed: bool) -> int:
    sys.path.insert(0, str(sau_root()))
    apply_headed_conf()
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
