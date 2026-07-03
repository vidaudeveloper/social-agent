"""发布成功验收：首页最新笔记 / 笔记管理已发布。"""

from __future__ import annotations

import logging
import re
import time

from .cdp import Page
from .urls import CREATOR_HOME_URL, NOTE_MANAGE_URL

logger = logging.getLogger(__name__)


def _normalize_title(title: str) -> str:
    """标题规范化：去空格、取前 10 字用于模糊匹配。"""
    cleaned = re.sub(r"\s+", "", title.strip())
    return cleaned[:10] if cleaned else ""


def _title_matches(expected: str, actual: str) -> bool:
    norm_expected = _normalize_title(expected)
    norm_actual = _normalize_title(actual)
    if not norm_expected or not norm_actual:
        return False
    return (
        norm_expected in norm_actual
        or norm_actual in norm_expected
        or norm_expected == norm_actual
    )


def _extract_home_latest_title(page: Page) -> str | None:
    """从创作中心首页提取「最新笔记」标题。"""
    return page.evaluate(
        """
        (() => {
            const bodyText = document.body.innerText || '';
            const idx = bodyText.indexOf('最新笔记');
            if (idx < 0) return null;

            // 常见结构：区块标题后紧跟笔记卡片标题
            const cards = document.querySelectorAll(
                '[class*="note"], [class*="Note"], [class*="card"], [class*="Card"]'
            );
            for (const card of cards) {
                const text = (card.textContent || '').trim();
                if (!text || text.length > 80) continue;
                if (text.includes('最新笔记') || text.includes('查看详情')) continue;
                if (text.length >= 4) return text.split('\\n')[0].trim();
            }

            // 兜底：取「最新笔记」后第一段非空行
            const after = bodyText.slice(idx, idx + 500);
            const lines = after.split('\\n').map((l) => l.trim()).filter(Boolean);
            for (const line of lines) {
                if (line === '最新笔记' || line.includes('查看详情')) continue;
                if (line.length >= 4 && line.length <= 60) return line;
            }
            return null;
        })()
        """
    )


def _click_published_tab(page: Page) -> None:
    """笔记管理页切换到「已发布」Tab。"""
    page.evaluate(
        """
        (() => {
            const tabs = document.querySelectorAll(
                'div[class*="tab"], button, span, div'
            );
            for (const el of tabs) {
                const t = (el.textContent || '').trim();
                if (t === '已发布' || t.startsWith('已发布')) {
                    el.click();
                    return true;
                }
            }
            return false;
        })()
        """
    )
    time.sleep(2)


def _extract_note_list_titles(page: Page, limit: int = 10) -> list[dict]:
    """从笔记管理列表提取标题与时间。"""
    raw = page.evaluate(
        f"""
        (() => {{
            const items = [];
            const seen = new Set();
            const nodes = document.querySelectorAll(
                '[class*="note"], [class*="card"], [class*="item"], article, li'
            );
            for (const node of nodes) {{
                const text = (node.textContent || '').trim();
                if (!text || text.length < 4 || text.length > 200) continue;
                const lines = text.split('\\n').map((l) => l.trim()).filter(Boolean);
                if (lines.length === 0) continue;
                const title = lines[0];
                if (title.length < 4 || title.length > 60) continue;
                if (seen.has(title)) continue;
                seen.add(title);
                const timeLine = lines.find((l) => /\\d{{4}}[-/]\\d{{1,2}}[-/]\\d{{1,2}}/.test(l)) || '';
                items.push({{ title, time: timeLine }});
                if (items.length >= {limit}) break;
            }}
            return items;
        }})()
        """
    )
    return raw if isinstance(raw, list) else []


def verify_note_published(
    page: Page,
    title: str,
    *,
    wait_minutes: float = 3.0,
) -> dict:
    """验收笔记是否已发布。

    先等待 wait_minutes，再检查首页「最新笔记」与笔记管理「已发布」列表。

    Returns:
        {
            published: bool,
            source: "home_latest" | "note_list" | None,
            matched_title: str | None,
            note_time: str | None,
            waited_minutes: float,
        }
    """
    if wait_minutes > 0:
        logger.info("等待 %.1f 分钟后验收发布结果...", wait_minutes)
        time.sleep(wait_minutes * 60)

    result: dict = {
        "published": False,
        "source": None,
        "matched_title": None,
        "note_time": None,
        "waited_minutes": wait_minutes,
        "title_expected": title,
    }

    # 1) 首页最新笔记
    try:
        page.navigate(CREATOR_HOME_URL)
        page.wait_for_load(timeout=300)
        time.sleep(3)
        page.wait_dom_stable()
        latest = _extract_home_latest_title(page)
        logger.info("首页最新笔记标题: %r", latest)
        if latest and _title_matches(title, latest):
            result.update({
                "published": True,
                "source": "home_latest",
                "matched_title": latest,
            })
            return result
    except Exception as e:
        logger.warning("首页验收失败: %s", e)

    # 2) 笔记管理 → 已发布
    try:
        page.navigate(NOTE_MANAGE_URL)
        page.wait_for_load(timeout=300)
        time.sleep(3)
        page.wait_dom_stable()
        _click_published_tab(page)
        page.wait_dom_stable()
        notes = _extract_note_list_titles(page)
        logger.info("笔记管理列表前 %d 条: %s", len(notes), notes)
        for note in notes:
            note_title = note.get("title", "")
            if _title_matches(title, note_title):
                result.update({
                    "published": True,
                    "source": "note_list",
                    "matched_title": note_title,
                    "note_time": note.get("time"),
                })
                return result
    except Exception as e:
        logger.warning("笔记管理验收失败: %s", e)

    return result
