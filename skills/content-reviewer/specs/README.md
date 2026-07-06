# 发布标准 CSV（唯一维护源）

本目录下的 **`platform-publish-standards.csv`** 是各平台发布内容的**唯一维护源**。

## 维护流程

1. 用 Excel / WPS 编辑 CSV（或导出覆盖本文件）
2. 在 profile 根目录执行：

```powershell
npm run review:sync-specs
```

3. 自动生成：
   - `references/platform-publish-standards.md` — 审核员参考手册
   - `rules/{platform}.yaml` — **可解析的数值上限**（标题/正文字数、标签数、图片张数等）

## 同步范围

| CSV 平台 | 生成 rules 文件 |
|----------|-----------------|
| TikTok | `tiktok.yaml` |
| YouTube | `youtube.yaml` |
| Instagram | `instagram.yaml` |
| Facebook | `facebook.yaml` |
| LinkedIn | `linkedin.yaml` |
| 小红书 | `xiaohongshu.yaml` |
| 知乎 | `zhihu.yaml` |

**不覆盖**（手写维护）：`reddit.yaml`、`wechat.yaml`、`douyin.yaml`、`x.yaml`、`_common.yaml`

## 说明

- 带具体数字的上限（如标题≤20、正文 3000 字符）会写入 `rules/*.yaml` 供 `review:lint` 硬检
- 画面比例、合规话术等无法自动解析的项 → 参考手册 + rubric 软审核
- 内容载体含「主推」时，lint 默认只检查该行；无「主推」时取该平台第一行
- 指定载体：`npm run review:lint -- --platform tiktok --carrier "图文帖" --file ...`
