# publish — 发布层

各平台登录、上传、发帖 CLI。

**命名规范（全局）**：见 [`skills/README.md`](../README.md)「技能命名规范」。本节为 publish 落地清单。

## 双层结构

- **中层**：`skills/publish/{platform}/` — 可读全称（`douyin`、`youtube`、`wechat`…），挂 `scripts/`
- **叶子**：`skills/{code}-auth`、`{code}-publish`… — 目录名 = `name:`，供 Agent / Hub

总览 `{code}-skills` **不进 Hub**；Hub 只装叶子路径。

## 平台码与目录

| 平台 | 码 | 中层路径 | 总览 name |
|------|-----|----------|-----------|
| 抖音 | `dy` | [`douyin/`](douyin/) | `dy-skills` |
| TikTok | `tt` | [`tiktok/`](tiktok/) | `tt-skills` |
| YouTube | `yt` | [`youtube/`](youtube/) | `yt-skills` |
| 小红书 | `xhs` | [`xiaohongshu/`](xiaohongshu/) | `xhs-skills` |
| LinkedIn | `li` | [`linkedin/`](linkedin/) | `li-skills` |
| 知乎 | `zh` | [`zhihu/`](zhihu/) | `zh-skills` |
| Reddit | `rd` | [`reddit/`](reddit/) | `rd-skills` |
| X | `x` | [`x/`](x/) | `x-skills` |
| 公众号 | `wechat` | [`wechat/`](wechat/) | `wechat-skills` |

## 叶子技能

| 平台 | auth | publish | 其它 |
|------|------|---------|------|
| 抖音 | `dy-auth` | `dy-publish` | 成片见 create `dy-create` |
| TikTok | `tt-auth` | `tt-publish` | |
| YouTube | `yt-auth` | `yt-publish` | `yt-pipeline`、`yt-upload` |
| 小红书 | `xhs-auth` | `xhs-publish` | `xhs-interact` |
| LinkedIn | `li-auth` | `li-publish` | |
| 知乎 | `zh-auth` | `zh-publish` | |
| Reddit | `rd-auth` | `rd-publish` | 上游工具目录仍为 `tool/reddit-skills` |
| X | `x-auth` | `x-publish` | |
| 微信 | `wechat-auth` | `wechat-publish` | |

登录速查：[`workspace/references/platform-login-quickstart.md`](../../workspace/references/platform-login-quickstart.md)
