# 小红书 Cron / 发布问题排查 Runbook（Hermes Agent 参考）

> **适用场景**：定时任务配图走错路、发布 CLI 超时被误判失败、短时间重复发布触发风控、草稿恢复、发布验收等。  
> **原则**：先模版卡片 → 再 AI 降级（分交互/定时）；CLI 报错 ≠ 发布失败；禁止 BMP/ffmpeg 手搓图。

---

## 快速决策树

```
小红书发布出问题
    │
    ├─ 配图用了 BMP / tokenware 起手 / 自造渐变图
    │     → 【章节 A】配图顺序与降级
    │
    ├─ publish 上传超时 / CLI 报错
    │     → 【章节 D】先 verify-publish，禁止立即重发
    │
    ├─ 确认未上线，需恢复
    │     → 【章节 E】草稿恢复 + 最多重试 1 次
    │
    └─ 仍失败
          → 【章节 F】停止、不关浏览器、汇报用户决策
```

---

## 章节 A：配图顺序与降级

### 硬性顺序

1. **必须先** `npm run pipeline:xhs -- -Slug {slug}`（xhs-card-render 模版卡片）
2. **禁止**起手「xhs-card-render 或 tokenware」并行二选一
3. **禁止** execute_code / bash 嵌 Python / BMP / ffmpeg 自造图

### 失败后降级

| 模式 | pipeline:xhs 失败后 |
|------|---------------------|
| **交互（手动）** | 停止 → 询问用户是否改用 tokenware AI 生图 → **须告知 AI 标记风险** → 用户确认后才执行 |
| **定时（Cron）** | 自动降级 `tokenware-image` CLI，**无需用户确认**（日志记录风险） |

**发布后验收（默认开启）**：`publish` / `click-publish` 自动跳转创作中心首页 `.../new/home?source=official` 匹配标题；成功告知用户；未匹配则 `user_decision` 询问是否成功/是否重发；浏览器保持打开。

### AI 风险告知文案（交互任务原样呈现）

> 使用 AI 生图（tokenware）作为配图降级时，小红书平台**可能**将内容识别或标记为 AI 生成，存在限流、降权或审核加严风险。是否继续？

### 配图失败选项

**交互**：A) `npm run tool:install` 后重试 pipeline:xhs；B) 用户确认后 tokenware；C) 跳过配图；D) 放弃

**定时**：A) 重试 pipeline:xhs 一次；B) 自动 tokenware；C) 跳过配图并记录

---

## 章节 B：官方图片规范

| 维度 | 要求 |
|------|------|
| 格式 | 仅 `png` / `jpg` / `jpeg` / `webp` |
| 禁止 | `gif`、Live 图、`.bmp`、`.svg` 等 |
| 大小 | 单张 ≤ **32MB** |
| 分辨率 | 建议 ≥ **720×960**；宽高比 **3:4 ~ 2:1** |

CLI 发布前自动校验：`validate_xhs_images`；可用 `--strict-images` 对分辨率硬拒绝。

---

## 章节 C：发布成功验收（verify-publish）

**CLI 报错或上传超时后，先不要换图/重发。**

1. 等待 **2–5 分钟**（平台索引延迟）
2. 执行 `verify-publish --title-file <标题文件> [--wait-minutes 3]`
3. 检查点（任一通过即成功）：
   - 创作中心首页 → **「最新笔记」** 标题匹配
   - **笔记管理 → 已发布** 列表顶部同标题

若验收通过 → 判定 **发布成功**，**禁止**再发同标题内容（即使 CLI 曾报错）。

---

## 章节 D：CLI 超时不等于失败

### 症状

- `UploadTimeoutError: 第N张图片上传超时(60s)`
- publish 无响应但笔记管理里已有新笔记

### 处置

```
publish 报错
  → wait 3min
  → verify-publish
  → 已上线？停止，汇报成功
  → 未上线？进入章节 E
```

**禁止**：超时后立即换图再 `publish`（同标题同正文）。

---

## 章节 E：草稿恢复（最多重试 1 次）

草稿在**发布页右侧小框**，须先进入「上传图文」发布流程才可见（不是独立草稿箱全页）。

```
save-draft（暂存离开）
  → verify 右侧草稿小框是否出现
  → 点草稿继续编辑
  → click-publish 再试一次
```

CLI：

```powershell
cd skills/xiaohongshu/scripts
python cli.py recover-publish --title-file <标题> [--title-hint <草稿标题>]
```

---

## 章节 F：停止并汇报用户

recover 仍失败后：

- **不关浏览器/标签**（`keep_browser_open: true`）
- 输出 JSON，`next_action: "user_decision"`
- Agent **暂停自动化**，等待用户指示

可选后续：手动点右侧草稿再发 / 换图后新开一轮 / 改用 AI 生图（附风险，交互须确认）/ 放弃

---

## 推荐 Cron Prompt 片段

```
小红书配图：必须先 npm run pipeline:xhs -- -Slug {slug}（模版卡片）。
若 pipeline 失败：自动降级 tokenware-image 生图（记录 AI 标记风险，无需再问用户）。
禁止并行二选一、禁止 BMP/ffmpeg/execute_code 自造图。
发布：官方格式 png/jpg/jpeg/webp，单张≤32MB；图片就绪后 publish。
发布后或 CLI 报错：先 wait 3min + verify-publish；仅验收失败才 save-draft → 右侧草稿 → 再发一次。
仍失败：停止、不关浏览器、汇报用户决策。禁止同标题连发。
```

### 交互任务补充

```
若 pipeline 失败：停止并询问用户是否改用 tokenware AI 生图，须说明「可能被平台标记为 AI 内容」的风险，用户确认后才执行。
禁止未经确认自动 AI 生图。
```

---

## Hermes 勾选清单

- [ ] Step 4c：先 `pipeline:xhs`，失败按交互/定时降级
- [ ] 图片来自 manifest.json PNG 或 tokenware 官方输出（非手搓）
- [ ] Step 5：publish 后或报错后 `verify-publish`
- [ ] 验收失败才 recover；仍失败 `user_decision`
- [ ] 禁止同标题连发
