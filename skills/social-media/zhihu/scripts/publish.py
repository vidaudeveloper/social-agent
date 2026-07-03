#!/usr/bin/env python3
"""Publish Zhihu article with pre-built HTML (bypasses CLI single-<p> wrap)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Publish Zhihu article via pyzhihu-cli client")
    parser.add_argument("--title", required=True, help="Article title")
    parser.add_argument("--html-file", required=True, help="HTML body file path")
    parser.add_argument("-i", "--image", action="append", default=[], help="Cover image path (repeatable)")
    args = parser.parse_args()

    html_path = Path(args.html_file)
    if not html_path.is_file():
        print(f"HTML file not found: {html_path}", file=sys.stderr)
        return 1

    html = html_path.read_text(encoding="utf-8").strip()
    if not html:
        print("HTML body is empty", file=sys.stderr)
        return 1

    try:
        from zhihu_cli.auth import cookie_str_to_dict, get_cookie_string
        from zhihu_cli.client import ZhihuClient
    except ImportError:
        print("pyzhihu-cli not installed. Run: uv tool install pyzhihu-cli", file=sys.stderr)
        return 1

    cookie = get_cookie_string()
    if not cookie:
        print("Not authenticated — run: zhihu login --qrcode", file=sys.stderr)
        return 1

    try:
        with ZhihuClient(cookie_str_to_dict(cookie)) as client:
            image_infos = None
            if args.image:
                image_infos = []
                for img_path in args.image:
                    print(f"Uploading image: {img_path}", file=sys.stderr)
                    image_infos.append(client.upload_image(img_path, source="article"))

            result = client.create_article(
                title=args.title.strip(),
                content=html,
                image_infos=image_infos,
            )
    except Exception as exc:
        print(f"Publish failed: {exc}", file=sys.stderr)
        return 1

    aid = str(result.get("id", "") or "")
    if aid:
        url = f"https://zhuanlan.zhihu.com/p/{aid}"
        print(url)
        return 0

    print("Article may have been published but no ID returned", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
