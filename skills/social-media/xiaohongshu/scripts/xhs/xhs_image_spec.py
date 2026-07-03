"""小红书官方图片规范校验。"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Literal

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
BLOCKED_EXTENSIONS = {".gif", ".bmp", ".svg", ".heic", ".heif", ".tiff", ".tif"}
MAX_BYTES = 32 * 1024 * 1024
MIN_WIDTH, MIN_HEIGHT = 720, 960
ASPECT_MIN = 2 / 3  # 3:4 portrait
ASPECT_MAX = 2.0  # 2:1 landscape


@dataclass
class ImageValidationResult:
    path: str
    ok: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    width: int | None = None
    height: int | None = None
    size_bytes: int = 0


def _normalize_ext(path: str) -> str:
    return os.path.splitext(path)[1].lower()


def _read_image_size(path: str) -> tuple[int | None, int | None]:
    try:
        from PIL import Image  # type: ignore[import-untyped]
    except ImportError:
        return None, None

    try:
        with Image.open(path) as img:
            return img.size
    except Exception:
        return None, None


def validate_xhs_image(path: str, *, strict_resolution: bool = False) -> ImageValidationResult:
    """校验单张图片是否符合小红书官方规范。"""
    result = ImageValidationResult(path=path, ok=True)

    if not os.path.isfile(path):
        result.ok = False
        result.errors.append(f"文件不存在: {path}")
        return result

    ext = _normalize_ext(path)
    if ext in BLOCKED_EXTENSIONS:
        result.ok = False
        result.errors.append(
            f"不支持的格式 {ext}；小红书仅支持 png/jpg/jpeg/webp"
        )
        return result

    if ext not in ALLOWED_EXTENSIONS:
        result.ok = False
        result.errors.append(
            f"不支持的格式 {ext or '(无扩展名)'}；小红书仅支持 png/jpg/jpeg/webp"
        )
        return result

    size_bytes = os.path.getsize(path)
    result.size_bytes = size_bytes
    if size_bytes > MAX_BYTES:
        result.ok = False
        result.errors.append(
            f"文件过大 ({size_bytes / 1024 / 1024:.1f}MB > 32MB)，请压缩后重试"
        )

    width, height = _read_image_size(path)
    result.width = width
    result.height = height

    if width is not None and height is not None and height > 0:
        aspect = width / height
        if width < MIN_WIDTH or height < MIN_HEIGHT:
            msg = (
                f"分辨率 {width}x{height} 低于建议值 {MIN_WIDTH}x{MIN_HEIGHT}"
            )
            if strict_resolution:
                result.ok = False
                result.errors.append(msg)
            else:
                result.warnings.append(msg)
        if aspect < ASPECT_MIN or aspect > ASPECT_MAX:
            result.warnings.append(
                f"宽高比 {aspect:.2f} 超出建议范围 3:4~2:1 ({ASPECT_MIN:.2f}~{ASPECT_MAX:.1f})"
            )

    return result


def validate_xhs_images(
    paths: list[str],
    *,
    strict_resolution: bool = False,
) -> list[ImageValidationResult]:
    """批量校验图片。"""
    return [validate_xhs_image(p, strict_resolution=strict_resolution) for p in paths]


def assert_xhs_images_valid(
    paths: list[str],
    *,
    strict_resolution: bool = False,
) -> list[ImageValidationResult]:
    """校验图片，失败时抛出 ValueError。"""
    results = validate_xhs_images(paths, strict_resolution=strict_resolution)
    errors: list[str] = []
    for r in results:
        errors.extend(r.errors)
    if errors:
        raise ValueError("; ".join(errors))
    return results


def format_validation_summary(results: list[ImageValidationResult]) -> dict:
    """生成 CLI 友好的校验摘要。"""
    return {
        "valid": all(r.ok for r in results),
        "images": [
            {
                "path": r.path,
                "ok": r.ok,
                "errors": r.errors,
                "warnings": r.warnings,
                "width": r.width,
                "height": r.height,
                "size_bytes": r.size_bytes,
            }
            for r in results
        ],
    }
