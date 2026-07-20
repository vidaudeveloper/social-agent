import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {DustBurst} from '../Effects';
import {PromoLayout, beatProgress} from '../PromoLayout';
import {theme} from '../../theme';

export type HighlightPart = {text: string; color: string};

export const HookQuestionScene: React.FC<{
  parts: HighlightPart[];
  mascotEmoji?: string;
  mascotLabel?: string;
}> = ({parts, mascotEmoji = '🤖', mascotLabel}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  return (
    <PromoLayout>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 6,
            maxWidth: 1500,
          }}
        >
          {parts.map((p, i) => {
            const start = 0.02 + i * 0.07;
            const progress = beatProgress(frame, durationInFrames, start, start + 0.14);
            const y = interpolate(progress, [0, 0.55, 0.8, 1], [-160, 16, -6, 0]);
            const rotate = interpolate(progress, [0, 0.55, 1], [-10, 4, 0]);
            const impact = interpolate(progress, [0.45, 0.6, 0.95], [0, 1, 0]);
            return (
              <span
                key={`${p.text}-${i}`}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  fontSize: theme.titleSize - 10,
                  fontWeight: 900,
                  color: p.color,
                  opacity: progress,
                  transform: `translateY(${y}px) rotate(${rotate}deg)`,
                  textShadow: '0 3px 0 #fff, 0 6px 0 rgba(0,0,0,0.35)',
                }}
              >
                {p.text}
                <DustBurst impact={impact} width={160 + i * 40} color={p.color} />
              </span>
            );
          })}
        </div>
        <div
          style={{
            opacity: beatProgress(frame, durationInFrames, 0.28, 0.4),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{fontSize: 92}}>{mascotEmoji}</div>
          {mascotLabel ? (
            <div
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                background: theme.primary,
                fontSize: 20,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {mascotLabel}
            </div>
          ) : null}
        </div>
      </div>
    </PromoLayout>
  );
};

export const BigMessageScene: React.FC<{
  emoji: string;
  title: string;
  titleColor?: string;
  subtitle?: string;
  showMascot?: boolean;
}> = ({emoji, title, titleColor = theme.text, subtitle, showMascot = true}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const m = beatProgress(frame, durationInFrames, 0.08, 0.32);
  const y = interpolate(m, [0, 0.55, 0.8, 1], [-130, 14, -5, 0]);
  const impact = interpolate(m, [0.45, 0.62, 0.95], [0, 1, 0]);
  const sub = beatProgress(frame, durationInFrames, 0.42, 0.58);

  return (
    <PromoLayout showMascot={showMascot}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        <div
          style={{
            fontSize: 100,
            opacity: m,
            transform: `rotate(${interpolate(m, [0, 1], [25, 0])}deg) scale(${interpolate(m, [0, 1], [0.5, 1])})`,
          }}
        >
          {emoji}
        </div>
        <div style={{position: 'relative'}}>
          <div
            style={{
              opacity: m,
              transform: `translateY(${y}px)`,
              fontSize: 78,
              fontWeight: 900,
              color: titleColor,
              textAlign: 'center',
              textShadow: '0 3px 0 rgba(255,255,255,0.95), 0 6px 0 rgba(0,0,0,0.22)',
              maxWidth: 1180,
            }}
          >
            {title}
          </div>
          <DustBurst impact={impact} width={400} color={titleColor} />
        </div>
        {subtitle ? (
          <div
            style={{
              opacity: sub,
              transform: `translateY(${interpolate(sub, [0, 1], [28, 0])}px)`,
              fontSize: 34,
              color: theme.textMuted,
              fontWeight: 700,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </PromoLayout>
  );
};

export const WarningHookScene: React.FC<{title: string; subtitle?: string}> = ({
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const m = beatProgress(frame, durationInFrames, 0.08, 0.3);
  const y = interpolate(m, [0, 0.55, 0.8, 1], [-140, 18, -6, 0]);
  const impact = interpolate(m, [0.45, 0.62, 0.95], [0, 1, 0]);
  const sub = beatProgress(frame, durationInFrames, 0.42, 0.58);

  return (
    <PromoLayout showMascot>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        <div
          style={{
            fontSize: 100,
            opacity: m,
            transform: `scale(${interpolate(m, [0, 1], [0.4, 1])}) rotate(${interpolate(m, [0, 1], [-20, 0])}deg)`,
          }}
        >
          ⚠️
        </div>
        <div style={{position: 'relative'}}>
          <div
            style={{
              opacity: m,
              transform: `translateY(${y}px)`,
              fontSize: 78,
              fontWeight: 900,
              color: theme.danger,
              textAlign: 'center',
              textShadow: '0 3px 0 rgba(255,255,255,0.85), 0 6px 0 rgba(0,0,0,0.2)',
              maxWidth: 1200,
            }}
          >
            {title}
          </div>
          <DustBurst impact={impact} width={480} color={theme.danger} />
        </div>
        {subtitle ? (
          <div
            style={{
              opacity: sub,
              fontSize: 34,
              color: theme.textMuted,
              fontWeight: 700,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </PromoLayout>
  );
};

export const BigStepScene: React.FC<{step: string; title: string}> = ({step, title}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const s = beatProgress(frame, durationInFrames, 0.08, 0.3);
  const t = beatProgress(frame, durationInFrames, 0.35, 0.55);

  return (
    <PromoLayout showMascot>
      <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
        <div
          style={{
            opacity: s,
            transform: `translateX(${interpolate(s, [0, 1], [-200, 0])}px)`,
            fontSize: 180,
            fontWeight: 900,
            color: theme.primary,
            textShadow: '0 4px 0 rgba(255,255,255,0.9), 0 8px 0 rgba(0,0,0,0.2)',
          }}
        >
          {step}
        </div>
        <div
          style={{
            opacity: t,
            transform: `translateX(${interpolate(t, [0, 1], [160, 0])}px)`,
            fontSize: 72,
            fontWeight: 900,
            color: theme.text,
            textShadow: '0 2px 0 rgba(255,255,255,0.9), 0 4px 0 rgba(0,0,0,0.15)',
          }}
        >
          {title}
        </div>
      </div>
    </PromoLayout>
  );
};
