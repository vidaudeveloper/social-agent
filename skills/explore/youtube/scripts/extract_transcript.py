#!/usr/bin/env python3
"""Thin wrapper around youtube-transcript-api for explore extract CLI."""
from __future__ import annotations

import argparse
import json
import sys


def fetch_transcript(video_id: str, languages: list[str]) -> dict:
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError as exc:
        raise SystemExit(
            "缺少 youtube-transcript-api。请执行: uv pip install youtube-transcript-api\n"
            "详见 workspace/references/youtube-explore-setup.md"
        ) from exc

    api = YouTubeTranscriptApi()
    fetched = api.fetch(video_id, languages=languages)

    segments = []
    for snippet in fetched:
        text = getattr(snippet, "text", None) or snippet.get("text", "")
        start = getattr(snippet, "start", None) or snippet.get("start", 0)
        segments.append({"text": text, "start": start})

    full_text = " ".join(s["text"] for s in segments).replace("\n", " ").strip()
    language = getattr(fetched, "language", None) or languages[0]

    return {
        "videoId": video_id,
        "language": language,
        "source": "youtube-transcript-api",
        "segments": segments,
        "fullText": full_text,
        "transcript_status": "ok",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract YouTube transcript JSON")
    parser.add_argument("--video-id", required=True)
    parser.add_argument("--lang", default="en,en-US")
    parser.add_argument("--out", help="Output JSON path (default stdout)")
    args = parser.parse_args()

    languages = [x.strip() for x in args.lang.split(",") if x.strip()]
    if not languages:
        languages = ["en"]

    try:
        result = fetch_transcript(args.video_id, languages)
    except Exception as exc:  # noqa: BLE001 — CLI boundary
        result = {
            "videoId": args.video_id,
            "transcript_status": "unavailable",
            "error": str(exc),
            "source": "youtube-transcript-api",
        }

    payload = json.dumps(result, ensure_ascii=False, indent=2)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(payload)
    else:
        print(payload)

    if result.get("transcript_status") != "ok":
        sys.exit(1)


if __name__ == "__main__":
    main()
