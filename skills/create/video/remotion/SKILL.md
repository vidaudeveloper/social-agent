---
name: remotion
description: |
  Remotion 程序化视频 — React/TypeScript 合成 MP4。用户要「Remotion 成片」「动效视频」「多场景转场」时激活。
  简单口播请用 create/tts-narration；商业创意片请用 create/creative-agent。
version: 1.0.0
author: remotion-dev (rules vendored)
license: MIT
metadata:
  hermes:
    tags: [video, remotion, react, animation, composition]
    related_skills:
      - create/tts-narration
      - create/creative-agent
      - create/pipeline-orchestrator
  tags: remotion, video, react, animation, composition
---

## When to use

Use this skill whenever you are dealing with Remotion code to obtain the domain-specific knowledge.

## New project setup

When in an empty folder or workspace with no existing Remotion project, scaffold one using:

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
```

Replace `my-video` with a suitable project name.

## Designing a video

Before designing visual scenes, layouts, promos, motion graphics, or text-heavy videos, load [rules/video-layout.md](rules/video-layout.md) for video-first layout and text sizing guidance.

Animate properties using `useCurrentFrame()` and `interpolate()`. Prefer `interpolate()` over `spring()` unless physics-based motion is explicitly needed. Use `Easing.bezier()` to customize timing, including jumpy or overshooting motion.

For animations that should be editable in Remotion Studio, keep the `interpolate()` call inline in the `style` prop and use individual CSS transform properties (`scale`, `translate`, `rotate`) instead of composing a `transform` string.

```tsx
import { useCurrentFrame, Easing, interpolate, useVideoConfig } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return <div style={{ opacity }}>Hello World!</div>;
};
```

Prefer:

```tsx
style={{
  scale: interpolate(frame, [0, 100], [0, 1]),
  translate: interpolate(frame, [0, 100], ["0px 0px", "100px 100px"]),
  rotate: interpolate(frame, [0, 100], ["20deg", "90deg"]),
}}
```

Over:

```tsx
const scale = interpolate(frame, [0, 100], [0, 1]);

style={{
  transform: `scale(${scale})`,
}}
```

CSS transitions or animations are FORBIDDEN - they will not render correctly.  
Tailwind animation class names are FORBIDDEN - they will not render correctly.

Place assets in the `public/` folder at your project root.

Use `staticFile()` to reference files from the `public/` folder.

Add images using the `<Img>` component:

```tsx
import { Img, staticFile } from "remotion";

export const MyComposition = () => {
  return <Img src={staticFile("logo.png")} style={{ width: 100, height: 100 }} />;
};
```

Add videos using the `<Video>` component from `@remotion/media`:

```tsx
import { Video } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Video src={staticFile("video.mp4")} style={{ opacity: 0.5 }} />;
};
```

Add audio using the `<Audio>` component from `@remotion/media`:

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Audio src={staticFile("audio.mp3")} />;
};
```

Assets can be also referenced as remote URLs:

```tsx
import { Video } from "@remotion/media";

export const MyComposition = () => {
  return <Video src="https://remotion.media/video.mp4" />
};
```

To delay content wrap it in `<Sequence>` and use `from`.
To limit the duration of an element, use `durationInFrames` of `<Sequence>`.
`<Sequence>` by default is an absolute fill. For inline content, use `layout="none"`.

```tsx
import { Sequence } from "remotion";

export const Title = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return <div style={{ opacity }}>Title</div>;
};

export const Subtitle = () => {
  return <div>Subtitle</div>;
};

const Main = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence>
        <Background />
      </Sequence>
      <Sequence from={1 * fps} durationInFrames={2 * fps} layout="none">
        <Title />
      </Sequence>
      <Sequence from={2 * fps} durationInFrames={2 * fps} layout="none">
        <Subtitle />
      </Sequence>
    </AbsoluteFill>
  );
}
```

The width, height, fps, and duration of a video is defined in `src/Root.tsx`:

```tsx
import { Composition } from "remotion";
import { MyComposition } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={100}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
```

Metadata can also be calculated dynamically:

```tsx
import { Composition, CalculateMetadataFunction } from "remotion";
import { MyComposition, MyCompositionProps } from "./MyComposition";

const calculateMetadata: CalculateMetadataFunction<
  MyCompositionProps
> = async ({ props, abortSignal }) => {
  const data = await fetch(`https://api.example.com/video/${props.videoId}`, {
    signal: abortSignal,
  }).then((res) => res.json());

  return {
    durationInFrames: Math.ceil(data.duration * 30),
    props: {
      ...props,
      videoUrl: data.url,
    },
    width: 1080,
    height: 1080,
  };
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{ videoId: "abc123" }}
      calculateMetadata={calculateMetadata}
    />
  );
};
```

## Starting preview

Start the Remotion Studio to preview a video:

```bash
npx remotion studio
```

## Optional: one-frame render check

You can render a single frame with the CLI to sanity-check layout, colors, or timing.  
Skip it for trivial edits, pure refactors, or when you already have enough confidence from Studio or prior renders.

```bash
npx remotion still [composition-id] --scale=0.25 --frame=30
```

At 30 fps, `--frame=30` is the one-second mark (`--frame` is zero-based).

## Captions

When dealing with captions or subtitles, load the [./rules/subtitles.md](./rules/subtitles.md) file for more information.

## Using FFmpeg

For some video operations, such as trimming videos or detecting silence, FFmpeg should be used. Load the [./rules/ffmpeg.md](./rules/ffmpeg.md) file for more information.

## Silence detection

When needing to detect and trim silent segments from video or audio files, load the [./rules/silence-detection.md](./rules/silence-detection.md) file.

## Audio visualization

When needing to visualize audio (spectrum bars, waveforms, bass-reactive effects), load the [./rules/audio-visualization.md](./rules/audio-visualization.md) file for more information.

## Sound effects

When needing to use sound effects, load the [./rules/sfx.md](./rules/sfx.md) file for more information.

## Visual and pixel effects

When creating a visual effect, prefer: 1. normal Remotion/HTML/CSS/SVG/filter/blend/mask animation, 2. a listed effect via [rules/effects.md](rules/effects.md), including on HTML rendered through `<HtmlInCanvas>`, 3. a custom `createEffect()` via [rules/effects.md](rules/effects.md) when the user asks for a reusable/project-specific effect, 4. custom `<HtmlInCanvas onPaint>` via [rules/html-in-canvas.md](rules/html-in-canvas.md) only if no effect fits.

For light leak overlays, see [rules/light-leaks.md](rules/light-leaks.md). Docs: https://www.remotion.dev/docs/effects

Available effects: `brightness()`, `contrast()`, `colorKey()`, `duotone()`, `grayscale()`, `hue()`, `invert()`, `saturation()`, `tint()`, `linearGradient()`, `linearGradientTint()`, `thermalVision()`, `blur()`, `linearProgressiveBlur()`, `radialProgressiveBlur()`, `zoomBlur()`, `dropShadow()`, `glow()`, `lightTrail()`, `evolve()`, `venetianBlinds()`, `mirror()`, `scale()`, `uvTranslate()`, `xyTranslate()`, `barrelDistortion()`, `chromaticAberration()`, `fisheye()`, `cornerPin()`, `wave()`, `burlap()`, `emboss()`, `dotGrid()`, `halftone()`, `noise()`, `noiseDisplacement()`, `paper()`, `pattern()`, `pixelate()`, `pixelDissolve()`, `scanlines()`, `speckle()`, `shine()`, `shrinkwrap()`, `vignette()`, `contourLines()`, `checkerboard()`, `halftoneLinearGradient()`, `gridlines()`, `whiteNoise()`, `tvSignalOff()`, `lines()`, `rings()`, `waves()`, `zigzag()`, `lightLeak()`, `starburst()`.

## 3D content

See [rules/3d.md](rules/3d.md) for 3D content in Remotion using Three.js and React Three Fiber.

## Advanced audio

See [rules/audio.md](rules/audio.md) for advanced audio features like trimming, volume, speed, pitch.

## Dynamic duration, dimensions and data

See [rules/calculate-metadata.md](rules/calculate-metadata.md) for dynamically set composition duration, dimensions, and props.

## Advanced compositions

See [rules/compositions.md](rules/compositions.md) for how to define stills, folders, default props and for how to nest compositions.

## Google Fonts

Is the recommended way to load fonts in Remotion. See [rules/google-fonts.md](rules/google-fonts.md) for how to load Google Fonts.

## Local fonts

See [rules/local-fonts.md](rules/local-fonts.md) for how to load local fonts.

## Getting audio duration

See [rules/get-audio-duration.md](rules/get-audio-duration.md) for getting the duration of an audio file in seconds with Mediabunny.

## Getting video dimensions

See [rules/get-video-dimensions.md](rules/get-video-dimensions.md) for getting the width and height of a video file with Mediabunny.

## Getting video duration

See [rules/get-video-duration.md](rules/get-video-duration.md) for getting the duration of a video file in seconds with Mediabunny.

## GIFs

See [rules/gifs.md](rules/gifs.md) for how to display GIFs synchronized with Remotion's timeline.

## Advanced Images

See [rules/images.md](rules/images.md) for sizing and positioning images, dynamic image paths, and getting image dimensions.

## Lottie animations

See [rules/lottie.md](rules/lottie.md) for embedding Lottie animations in Remotion.

## Measuring DOM nodes

See [rules/measuring-dom-nodes.md](rules/measuring-dom-nodes.md) for measuring DOM element dimensions in Remotion.

## Measuring text

See [rules/measuring-text.md](rules/measuring-text.md) for measuring text dimensions, fitting text to containers, and checking overflow.

## Advanced sequencing

See [rules/sequencing.md](rules/sequencing.md) for more sequencing patterns - delay, trim, limit duration of items.

## TailwindCSS

See [rules/tailwind.md](rules/tailwind.md) for using TailwindCSS in Remotion.

## Text animations

See [rules/text-animations.md](rules/text-animations.md) for typography and text animation patterns.

## Advanced timing

See [rules/timing.md](rules/timing.md) for advanced timing with `interpolate` and Bézier easing, and springs.

## Transitions

See [rules/transitions.md](rules/transitions.md) for scene transition patterns.

## Transparent videos

See [rules/transparent-videos.md](rules/transparent-videos.md) for rendering out a video with transparency.

## Trimming

See [rules/trimming.md](rules/trimming.md) for trimming patterns - cutting the beginning or end of animations.

## Advanced Videos

See [rules/videos.md](rules/videos.md) for advanced knowledge about embedding videos - trimming, volume, speed, looping, pitch.

## Parameterized videos

See [rules/parameters.md](rules/parameters.md) for making a composition parametrizable by adding a Zod schema.

## Maps

For simple maps with little flyovers, consider using static map images.
For complex maps with animated routes or flyovers, load the maps rule: [rules/maplibre.md](rules/maplibre.md)

## Voiceover

See [rules/voiceover.md](rules/voiceover.md) for adding AI-generated voiceover to Remotion compositions using ElevenLabs TTS.

---

## 在 social-agent 中的用法

**上游规则来源**：[remotion-dev/skills](https://github.com/remotion-dev/skills)（`skills/remotion/rules/`，约 130KB，已 vendored）。

### 工作区与产出

- 每个成片建议在 `$HERMES_ROOT/视频/remotion/{slug}/` 下建独立 Remotion 项目
- 口播稿/素材可从 `$HERMES_ROOT/文章/{平台}/` 复制到项目 `public/`
- 渲染 MP4 输出到同目录 `out/` 或 `output.mp4`

### 推荐流程

1. 确认 Node.js ≥ 18、`ffmpeg` 可用
2. 空目录脚手架：`npx create-video@latest --yes --blank --no-tailwind {slug}`（在项目子目录执行）
3. 按本 SKILL 与 `rules/` 编写 Composition
4. 预览：`npx remotion studio`
5. 渲染：`npx remotion render [composition-id] out/video.mp4`
6. 回到 social-agent Step 5 用 `publish/*` 或 computer-use 发布

### 技能检查

```powershell
npm run remotion:check
```

### 与 tts-narration 选型

| 需求 | 选 |
|------|-----|
| 快速口播、黑底花字 | `create/tts-narration` |
| 品牌动效、图表、精细转场 | `create/remotion`（本技能） |
| 全自动创意商业片 | `create/creative-agent` |
