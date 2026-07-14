---
name: tutorial-beat-video
description: |
  网站/软件操作教程 Remotion 成片（一句一镜、信息图冲击开场、真截图实操、声画同步）。
  用户要「教程视频」「操作演示」「配置教程」「怎么用 XX」时必须加载本规则。
  对话对用户一律简体中文。
metadata:
  tags: tutorial, beat, screenshot, infographic, voiceover, website-guide, impact-motion
---

# 网站操作教程视频（Beat 分镜）

本规则来自已验证成片：`content/视频/remotion/morelogin-tutorial/`  

- **叙事定稿**：**v10**（钩子 → 原因 → 选型 → 方案 → 实操 → 升华）  
- **视觉定稿**：**v9**（统一底色、极淡装饰、深色字、截图托底、概念镜吉祥物）

**对用户全程简体中文**（代码标识、路径、CLI 可保留英文）。

商业创意片用 `create/creative-agent`；**不要**用黑底花字口播管线做教程。

---

## 开工前门闩（强制）

### 0. 视频类型（未选不准写代码）

用户说「做视频 / 教程 / 成片」时，先让选：

- **A. Remotion 动画教程片**（本规则）  
- **B. Creative 创意商业片**（`create/creative-agent`）  

选定 **A** 后，**只再问下面 2 个问题**（不要展开成长问卷）：

### 1. 生成前两问（仅此两条）

1. **背景风格**想要哪种？**要不要**固定卡通形象（有则说品牌名/形象，无则不要）？  
2. **有没有参考文档**链接？截图素材是**现成**、要从文档**抓取**，还是先信息图**后补截图**？  

缺答就停；答完再出「旁白 | 画面」分列的分镜表，用户点头后再 TTS / 写组件 / 渲染。

**默认（不必再问）**：画幅 **1920×1080 横屏**；时长约 **2–4 分钟**；验证段**关闭**；含「痛点+原因」科普段（v10 结构）。

---

## 硬门闩（画面 / 节奏 / 声画）

### 开场冲击力

- 前几镜禁止「小字 + 一张白卡」撑满  
- 大标题砸入 / 关键词分段入场 / 图标弹压，第一眼抓住人  

### 标题够大够醒目

- 1920 宽：主标题建议 **120–160px**；标签 ≥44px  
- **一句话可多色**（深灰 / 琥珀 / 警示红等）拉开层次  
- 浅底禁止浅色字；深底禁止过暗字  

### 音画必须同步

- **一句一 `Series.Sequence`**  
- 镜长 = 该句音频（**含段间静音**），用类似 `beatFrames()` 对齐整段 `voiceover`  
- 动画用 `durationInFrames` **比例**铺满整句；禁止固定短动画播完后空等旁白  

### 动效有差异、有冲击

- 元素之间必须错开：落下+风尘、左右滑入、淡入上浮、翻转、弹压等  
- **禁止**全片同一种 `scale` 砸入（PPT 感）  
- 参考 `motion.ts`：`slamIn` / `flyBounce` / `impactShake` / `beatEnter`  

### 禁止

- ❌ 整页静态念稿  
- ❌ 非实操段只有空旷小白卡  
- ❌ Mock UI 代替真实截图  
- ❌ 装饰网络/粒子抢主画面  
- ❌ 吉祥物挡住实操关键按钮  
- ❌ CSS `transition` / `animation` / Tailwind 动画类驱动时间轴  

---

## 叙事结构（v10）

```
A 钩子     身份标签 + 痛点（冲击开场）
B 原因     ≤3 条内容分享（信息图）
C 选型     错误方案 vs 推荐（可对比动画）
D 方案桥接 本期工具各干什么 + 前置提醒
E 实操     真截图逐步跟做（章节卡分隔）
F 升华     「不只是单一因素」→ 回顾 → CTA
```

节奏：**前快 → 中稳 → 实操放慢 → 结尾收束**。转场以硬切为主。

| 段落 | 画面类型 |
|------|----------|
| A/B/C/D/F | 信息图（大标题、语义图标、原创联想动画） |
| E | 真实截图 + 托底卡片（默认全图清晰，聚焦可选） |

旁白紧贴官方步骤，不编造点击路径。

---

## 视觉规范（v9 经验）

- 背景全片统一（确认问卷里定好的风格）；装饰线/节点 **极淡、稀疏（约 4–5 条）**  
- 概念/标题镜：可出吉祥物（约痛点 / 桥接 / 结尾三现）  
- 截图镜：深色描边 + 浅色内衬托底，与背景分离  
- 纯文字镜：必须加大字号 **或** 出形象，否则不合格  

参考组件：`PopLayout`、`LycheeMascot`（或项目吉祥物）、`ScreenshotFocus`、`InfographicScenes`。

---

## 工作流

1. 类型选型（Remotion / Creative）  
2. 两问确认  
3. 分镜表：**镜头号 | 时长 | 景别 | 旁白 | 画面**（旁白与画面分列）→ 用户确认  
4. 素材：抓真图或声明缺失；禁止假界面糊弄  
5. 逐 beat TTS → `voiceover-meta.json` + vtt；语速加速则同步缩放 meta  
6. 实现 beats + 场景；动效库混用  
7. 抽帧自检 → 全量渲染  

Windows 中文路径易炸：可同步到 `D:\tmp\{slug}` 再 `npx remotion render`。

---

## 项目结构（摘要）

```
content/视频/remotion/{slug}/
├── src/data/beats.ts / screenshots.ts / voiceoverMeta.ts
├── src/components/PopLayout · InfographicScenes · ScreenshotFocus · motion
├── public/screenshots/ · voiceover.mp3 · voiceover-meta.json · captions.vtt
└── out/
```

配音细节见 [voiceover.md](./voiceover.md)。截图抓取注意 CDN Referer。

---

## 生成后检查清单

- [ ] 开场有冲击力大标题（够大、可多色），不是小白卡  
- [ ] 元素动效有差异，非全片同一种缩放  
- [ ] 每句动画铺满旁白时长（声画同步）  
- [ ] 实操为真实截图 + 托底；无 Mock UI  
- [ ] 浅底无白字糊掉；装饰不抢戏  
- [ ] 无验证段（除非用户明确要求）  
- [ ] 未提交 `.env`、大体积任意提交策略按仓库规范  

## 参考实现

| 项目 | 说明 |
|------|------|
| `content/视频/remotion/morelogin-tutorial/` | 定稿参考：**叙事 v10 + 视觉 v9** |
| `out/morelogin-lycheeip-tutorial-v10.mp4` | 结构样片 |
| `out/morelogin-lycheeip-tutorial-v9.mp4` | 视觉样片 |

新项目复制该目录结构，替换 beats / screenshots / 旁白即可。
