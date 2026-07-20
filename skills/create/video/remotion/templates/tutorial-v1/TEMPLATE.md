# tutorial-v1

版本：**1.0.0**  
视觉底座：morelogin 定稿黄底网络（v9）  
叙事骨架：一句一镜 Series + 整轨 voiceover

## 固化（勿改）

- `src/theme/` — 色板、字号、间距
- `src/components/motion.ts` — 动效库
- `src/components/PromoLayout.tsx`（及 BrandBar / SubtitleBar / Screenshot* / DotGlobe / Effects）
- `scripts/` 资产检查

## 可改（业务内容）

- `src/data/beats.ts` — 旁白与 visual 映射
- `src/data/screenshots.ts` — 截图索引
- `src/scenes/` — 仅当通用积木不够用时新增；**必须**从 `../kit` 导入 theme / motion / PromoLayout
- `public/screenshots|logos|illustrations|emoji|voiceover*`

## 约束

新 scene 禁止自建全局颜色/字体/阴影 token；禁止绕开 `PromoLayout` 手写全屏背景。
