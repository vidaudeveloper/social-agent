# create/video — 视频类型索引

```text
用户要出视频 → 先选类型（强制）→ Remotion 教程再问两问 → 再制作
```

| 类型 | 路径 | 适用场景 | Hermes 前缀 |
|------|------|----------|-------------|
| **Remotion** | [`remotion/`](remotion/) | 教程（一句一镜）、程序化动效、多场景 | `create/remotion` |
| **创意成片** | [`creative-agent/`](creative-agent/) | 趋势片、产品宣传、MCP 创意 | `create/creative-agent` |
| ~~TTS 口播~~ | [`tts-narration/`](tts-narration/) | **已弃用（不推荐）**；勿用于新教程 | — |

## 强制选型

| 用户需求 | 选 |
|----------|-----|
| 教程 / 操作演示 / 配置 / 怎么用 | **Remotion** + `rules/tutorial-beat-video.md` |
| 复杂动效、图表、转场（非教程） | Remotion + `rules/video-layout.md` |
| 高质量商业短片、创意 | creative-agent |

选定 Remotion **教程**后，只再问 skill 内规定的 **2 个问题**（背景+形象、文档+素材），不要长问卷。画幅默认 1920×1080，不必再问。

## 产出路径

| 类型 | 默认目录 |
|------|----------|
| Remotion | `$HERMES_ROOT/视频/remotion/{slug}/` |
| creative-agent | `$HERMES_ROOT/视频/` |

对用户说明与确认：**一律简体中文**。
