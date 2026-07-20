# Remotion Tutorial Template v1

![version](https://img.shields.io/badge/version-1.0.0-blue)
![remotion](https://img.shields.io/badge/remotion-4.0.486-purple)

一句话简介：可版本管理的教程片视觉底座（黄底网络 v9 + 一句一镜 Series），复制后只改内容。

---

## 项目介绍

**为什么做这个项目？**
> 仅靠文字规则无法让多个 Agent 复现同一视觉系统；`content/` 又不进 Git。

**它做了什么？**
> 把 theme / motion / PromoLayout / 通用积木 / 资产脚本固化进 skill，业务项目用 `remotion:init` 复制后替换 beats 与素材。

## 功能特性

- 锁定黄底网络背景与动效库
- 参数化 Hook / Compare / Mindmap / FeatureGrid / CTA / Screenshot
- `src/kit` 统一导出 + `check:kit` 约束
- 静音占位配音 + meta，开箱可 `still` / `render`

## 快速上手

```powershell
# 在 profile 根目录
npm run remotion:init -- my-tutorial
cd content\视频\remotion\my-tutorial
npm install
npm run studio
```

## 约束

新 scene：

```ts
import {PromoLayout, theme, slamIn} from '../kit';
```

禁止重定义 theme / 手写全屏背景色板。
