# create/video — 视频类型索引

按**成片方式**划分，不按平台划分。平台差异在 `tts-narration/` 子技能中说明。

```text
用户要出视频 → 先选类型 → 再选平台/参数
```

| 类型 | 路径 | 适用场景 | Hermes 前缀 |
|------|------|----------|-------------|
| **TTS 口播** | [`tts-narration/`](tts-narration/) | 纯文字 + Edge TTS + ffmpeg 花字/横版 | `create/tts-narration` |
| **Remotion** | [`remotion/`](remotion/) | React 程序化动效、多场景、品牌模板 | `create/remotion` |
| **创意成片** | [`creative-agent/`](creative-agent/) | 趋势片、产品 URL、MCP 创意（切 profile） | `create/creative-agent` |

## 快速选择

| 用户需求 | 推荐 |
|----------|------|
| 抖音/TikTok/YouTube 口播短视频 | `tts-narration` → 对应平台子技能 |
| 复杂动效、图表、转场、字幕动画 | `remotion` |
| 高质量商业短片、批量创意 | `creative-agent` profile |

## 产出路径约定

| 类型 | 默认目录 |
|------|----------|
| TTS 口播 | `$HERMES_ROOT/视频/{slug}/` |
| Remotion | `$HERMES_ROOT/视频/remotion/{slug}/` |
| creative-agent | `$HERMES_ROOT/视频/`（与 social-agent 对齐） |

## 脚本位置

TTS 口播的 `create-video` CLI 仍在 `skills/publish/{platform}/scripts/`（发布与创作共用工具链）。
