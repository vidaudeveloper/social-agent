"""创作者中心「内容分析 → 导出数据」：下载笔记列表明细表 xlsx。"""

from __future__ import annotations

import logging
import os
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from .selectors import CONTENT_ANALYSIS_PAGE_HINT, EXPORT_NOTE_DATA_BUTTON_TEXT
from .urls import CONTENT_ANALYSIS_URL

logger = logging.getLogger(__name__)

DEFAULT_EXPORT_DIR = Path(r"D:\tmp\xhs-creator-exports")
EXPORT_NAME_HINTS = ("笔记列表明细表", "笔记列表", "note")
EXPORT_SUFFIXES = (".xlsx", ".xls", ".csv")


def _beijing_now() -> datetime:
    return datetime.utcnow() + timedelta(hours=8)


def _resolve_date_range(
    days: int | None,
    start_date: str | None,
    end_date: str | None,
) -> tuple[str, str]:
    """返回 (start YYYY-MM-DD, end YYYY-MM-DD)，默认近 N 天（含今天）。"""
    end = end_date.strip() if end_date else _beijing_now().strftime("%Y-%m-%d")
    if start_date and start_date.strip():
        start = start_date.strip()
    else:
        n = max(1, int(days or 30))
        end_dt = datetime.strptime(end, "%Y-%m-%d")
        start = (end_dt - timedelta(days=n - 1)).strftime("%Y-%m-%d")
    return start, end


def _snapshot_exports(dirs: list[Path]) -> dict[str, float]:
    snap: dict[str, float] = {}
    for d in dirs:
        if not d.is_dir():
            continue
        for p in d.iterdir():
            if not p.is_file():
                continue
            if p.suffix.lower() not in EXPORT_SUFFIXES:
                continue
            try:
                snap[str(p.resolve())] = p.stat().st_mtime
            except OSError:
                continue
    return snap


def _is_export_candidate(path: Path) -> bool:
    name = path.name.lower()
    if path.suffix.lower() not in EXPORT_SUFFIXES:
        return False
    if any(h.lower() in name for h in EXPORT_NAME_HINTS):
        return True
    # 部分环境导出名为时间戳，只要是新出现的 xlsx 也接受
    return path.suffix.lower() in (".xlsx", ".xls")


def _wait_new_export(
    dirs: list[Path],
    before: dict[str, float],
    timeout: float = 90.0,
) -> Path | None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        for d in dirs:
            if not d.is_dir():
                continue
            for p in d.iterdir():
                if not p.is_file() or not _is_export_candidate(p):
                    continue
                key = str(p.resolve())
                try:
                    mtime = p.stat().st_mtime
                except OSError:
                    continue
                # 新文件，或同名被覆盖（mtime 更新）
                if key not in before or mtime > before[key] + 0.5:
                    # 等写完（大小稳定）
                    try:
                        size1 = p.stat().st_size
                        time.sleep(0.6)
                        size2 = p.stat().st_size
                        if size1 > 0 and size1 == size2:
                            return p
                    except OSError:
                        continue
        time.sleep(0.8)
    return None


def _set_download_dir(page: Any, download_dir: Path) -> dict:
    download_dir.mkdir(parents=True, exist_ok=True)
    abs_path = str(download_dir.resolve())
    try:
        result = page.set_download_behavior(abs_path)
        logger.info("已设置下载目录: %s → %s", abs_path, result)
        return {"ok": True, "path": abs_path, "result": result}
    except Exception as e:
        logger.warning("set_download_behavior 失败，将轮询默认下载目录: %s", e)
        return {"ok": False, "path": abs_path, "error": str(e)}


def _click_export_button(page: Any) -> bool:
    """点击「导出数据」。优先文案匹配，再兜底按钮扫描。"""
    clicked = page.evaluate(
        f"""
        (() => {{
            const want = {EXPORT_NOTE_DATA_BUTTON_TEXT!r};
            const nodes = Array.from(document.querySelectorAll(
                'button, a, span, div[role="button"], [class*="btn"], [class*="export"]'
            ));
            const match = nodes.find((el) => {{
                const t = (el.textContent || '').replace(/\\s+/g, '').trim();
                return t === want || t.includes(want);
            }});
            if (!match) return {{ ok: false, reason: 'not-found' }};
            const target = match.closest('button,a,[role="button"]') || match;
            target.scrollIntoView({{ block: 'center' }});
            target.click();
            return {{ ok: true, text: (target.textContent || '').trim().slice(0, 40) }};
        }})()
        """
    )
    if isinstance(clicked, dict) and clicked.get("ok"):
        logger.info("已点击导出: %s", clicked.get("text"))
        return True

    # Bridge 真实点击兜底
    try:
        page.click_element_by_text("button, a, span, div", EXPORT_NOTE_DATA_BUTTON_TEXT)
        logger.info("已通过 click_element_by_text 点击导出")
        return True
    except Exception as e:
        logger.warning("click_element_by_text 失败: %s", e)
        return False


def _try_set_date_range(page: Any, start: str, end: str) -> dict:
    """尽力设置日期区间；失败不阻断（页面可能已是近 30 天默认）。"""
    result = page.evaluate(
        f"""
        (() => {{
            const start = {start!r};
            const end = {end!r};
            const inputs = Array.from(document.querySelectorAll(
                'input[type="text"], input[placeholder*="日期"], input[placeholder*="开始"], input[placeholder*="结束"], .d-date-picker input, .ant-picker-input input'
            ));
            if (inputs.length >= 2) {{
                const fill = (el, val) => {{
                    el.focus();
                    el.value = val;
                    el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                    el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }};
                fill(inputs[0], start);
                fill(inputs[1], end);
                return {{ ok: true, mode: 'inputs', count: inputs.length }};
            }}
            // 点「近30天」类快捷项
            const shortcuts = Array.from(document.querySelectorAll('button, span, div, a'));
            const hit = shortcuts.find((el) => {{
                const t = (el.textContent || '').replace(/\\s+/g, '');
                return t === '近30天' || t === '最近30天' || t.includes('近30日');
            }});
            if (hit) {{
                (hit.closest('button,a,[role="button"]') || hit).click();
                return {{ ok: true, mode: 'shortcut-30d' }};
            }}
            return {{ ok: false, reason: 'no-date-controls', bodyHint: (document.body.innerText || '').slice(0, 80) }};
        }})()
        """
    )
    return result if isinstance(result, dict) else {"ok": False, "raw": result}


def _page_debug(page: Any) -> dict:
    try:
        return page.evaluate(
            f"""
            (() => {{
                const text = (document.body && document.body.innerText) || '';
                return {{
                    url: location.href,
                    title: document.title,
                    hasContentAnalysis: text.includes({CONTENT_ANALYSIS_PAGE_HINT!r}),
                    hasExport: text.includes({EXPORT_NOTE_DATA_BUTTON_TEXT!r}),
                    snippet: text.replace(/\\s+/g, ' ').slice(0, 200),
                }};
            }})()
            """
        ) or {}
    except Exception as e:
        return {"error": str(e)}


def _fallback_watch_dirs(primary: Path) -> list[Path]:
    dirs = [primary]
    for extra in (
        Path(r"D:\GoogleDownload"),
        Path(os.path.expanduser(r"~\Downloads")),
        Path(os.path.expandvars(r"%USERPROFILE%\Downloads")),
    ):
        if extra not in dirs:
            dirs.append(extra)
    return dirs


def export_note_data(
    page: Any,
    *,
    days: int = 30,
    start_date: str | None = None,
    end_date: str | None = None,
    out_dir: str | Path | None = None,
    timeout: float = 90.0,
) -> dict:
    """
    打开内容分析页 → 设日期 → 点导出 → 等待 xlsx。

    Returns:
        { ok, path, fileName, startDate, endDate, downloadDir, debug? }
    """
    start, end = _resolve_date_range(days, start_date, end_date)
    download_dir = Path(out_dir or DEFAULT_EXPORT_DIR)
    download_dir.mkdir(parents=True, exist_ok=True)

    dl_meta = _set_download_dir(page, download_dir)
    watch_dirs = _fallback_watch_dirs(download_dir)
    before = _snapshot_exports(watch_dirs)

    logger.info("打开内容分析: %s", CONTENT_ANALYSIS_URL)
    page.navigate(CONTENT_ANALYSIS_URL)
    page.wait_for_load(timeout=60)
    time.sleep(2.5)
    try:
        page.wait_dom_stable(timeout=8)
    except Exception:
        pass

    date_meta = _try_set_date_range(page, start, end)
    if date_meta.get("ok"):
        time.sleep(1.5)

    if not _click_export_button(page):
        debug = _page_debug(page)
        return {
            "ok": False,
            "error": "未找到「导出数据」按钮，请确认已登录创作者中心且账号有内容分析权限",
            "startDate": start,
            "endDate": end,
            "downloadDir": str(download_dir),
            "downloadSetup": dl_meta,
            "dateSetup": date_meta,
            "debug": debug,
        }

    found = _wait_new_export(watch_dirs, before, timeout=timeout)
    if not found:
        debug = _page_debug(page)
        return {
            "ok": False,
            "error": (
                f"等待导出文件超时（{int(timeout)}s）。"
                f"请检查下载目录是否含「笔记列表明细表*.xlsx」: {download_dir}"
            ),
            "startDate": start,
            "endDate": end,
            "downloadDir": str(download_dir),
            "watchedDirs": [str(d) for d in watch_dirs],
            "downloadSetup": dl_meta,
            "dateSetup": date_meta,
            "debug": debug,
        }

    # 若落在非目标目录，拷贝到 out_dir
    final_path = found
    if found.parent.resolve() != download_dir.resolve():
        dest = download_dir / found.name
        try:
            import shutil

            shutil.copy2(found, dest)
            final_path = dest
            logger.info("已拷贝导出文件到: %s", dest)
        except OSError as e:
            logger.warning("拷贝失败，仍使用原路径: %s", e)

    return {
        "ok": True,
        "path": str(final_path.resolve()),
        "fileName": final_path.name,
        "startDate": start,
        "endDate": end,
        "downloadDir": str(download_dir),
        "downloadSetup": dl_meta,
        "dateSetup": date_meta,
    }
