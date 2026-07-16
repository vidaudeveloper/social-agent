#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""解析创作者中心「笔记列表明细表」xlsx → JSON（stdout）。"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# Windows 控制台
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

HEADER_ALIASES = {
    "title": ("笔记标题", "标题"),
    "publishedAt": ("首次发布时间", "发布时间"),
    "genre": ("体裁", "类型"),
    "impressions": ("曝光",),
    "views": ("观看量", "观看", "阅读"),
    "coverCtr": ("封面点击率",),
    "likedCount": ("点赞",),
    "commentCount": ("评论",),
    "collectedCount": ("收藏",),
    "fanGrowth": ("涨粉",),
    "sharedCount": ("分享",),
    "avgWatchDurationSec": ("人均观看时长",),
    "danmakuCount": ("弹幕",),
}


def _norm_header(cell: object) -> str:
    return str(cell or "").strip().replace("\n", "")


def _find_header_row(rows: list[tuple]) -> tuple[int, dict[str, int]]:
    """返回 (header_row_index, field->col_index)。跳过「最多导出…」说明行。"""
    for i, row in enumerate(rows[:10]):
        cells = [_norm_header(c) for c in row]
        if "笔记标题" in cells and ("曝光" in cells or "观看量" in cells):
            col_map: dict[str, int] = {}
            for field, aliases in HEADER_ALIASES.items():
                for alias in aliases:
                    if alias in cells:
                        col_map[field] = cells.index(alias)
                        break
            if "title" in col_map:
                return i, col_map
    raise ValueError("未找到表头行（需含「笔记标题」+「曝光/观看量」）")


def _to_number(val: object) -> float | None:
    if val is None or val == "":
        return None
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).strip().replace(",", "").replace("%", "")
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _cover_ctr_percent(val: object) -> float | None:
    """导出多为 0~1 比例；若已是百分数(>1)则原样。返回 0~100。"""
    n = _to_number(val)
    if n is None:
        return None
    if 0 <= n <= 1:
        return round(n * 100, 2)
    return round(n, 2)


def _format_published(val: object) -> str:
    if val is None:
        return ""
    s = str(val).strip()
    # 2026年07月16日10时00分33秒 → 2026-07-16 10:00:33
    m = re.match(
        r"(\d{4})年(\d{1,2})月(\d{1,2})日(?:(\d{1,2})时(\d{1,2})分(\d{1,2})秒)?",
        s,
    )
    if m:
        y, mo, d = m.group(1), int(m.group(2)), int(m.group(3))
        hh = int(m.group(4) or 0)
        mm = int(m.group(5) or 0)
        ss = int(m.group(6) or 0)
        return f"{y}-{mo:02d}-{d:02d} {hh:02d}:{mm:02d}:{ss:02d}"
    return s


def parse_xlsx(path: Path) -> dict:
    try:
        import openpyxl
    except ImportError as e:
        raise SystemExit(
            "缺少 openpyxl。请在 skills/publish/xiaohongshu 执行: uv add openpyxl"
        ) from e

    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    rows = [tuple(r) for r in ws.iter_rows(values_only=True)]
    if not rows:
        raise ValueError("空表格")

    header_i, col_map = _find_header_row(rows)
    posts: list[dict] = []
    for row in rows[header_i + 1 :]:
        title_i = col_map["title"]
        title = row[title_i] if title_i < len(row) else None
        if title is None or str(title).strip() == "":
            continue
        if str(title).strip().startswith("最多导出"):
            continue

        def cell(field: str) -> object:
            idx = col_map.get(field)
            if idx is None or idx >= len(row):
                return None
            return row[idx]

        post = {
            "title": str(title).strip(),
            "publishedAt": _format_published(cell("publishedAt")),
            "genre": str(cell("genre") or "").strip() or None,
            "impressions": _to_number(cell("impressions")),
            "views": _to_number(cell("views")),
            "coverCtr": _cover_ctr_percent(cell("coverCtr")),
            "likedCount": _to_number(cell("likedCount")),
            "commentCount": _to_number(cell("commentCount")),
            "collectedCount": _to_number(cell("collectedCount")),
            "fanGrowth": _to_number(cell("fanGrowth")),
            "sharedCount": _to_number(cell("sharedCount")),
            "avgWatchDurationSec": _to_number(cell("avgWatchDurationSec")),
            "danmakuCount": _to_number(cell("danmakuCount")),
        }
        posts.append(post)

    def _sum(key: str) -> float:
        return float(sum(float(p.get(key) or 0) for p in posts))

    summary = {
        "postCount": len(posts),
        "impressions": _sum("impressions"),
        "views": _sum("views"),
        "likedCount": _sum("likedCount"),
        "commentCount": _sum("commentCount"),
        "collectedCount": _sum("collectedCount"),
        "fanGrowth": _sum("fanGrowth"),
        "sharedCount": _sum("sharedCount"),
    }
    return {
        "ok": True,
        "source": "creator-export-xlsx",
        "file": str(path),
        "posts": posts,
        "summary": summary,
    }


def main() -> None:
    ap = argparse.ArgumentParser(description="解析小红书创作者中心笔记导出 xlsx")
    ap.add_argument("--in", dest="in_path", required=True, help="xlsx 路径")
    args = ap.parse_args()
    path = Path(args.in_path)
    if not path.exists():
        print(json.dumps({"ok": False, "error": f"文件不存在: {path}"}, ensure_ascii=False))
        sys.exit(2)
    try:
        data = parse_xlsx(path)
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False))
        sys.exit(1)
    print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
