import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {DotGlobe} from '../DotGlobe';
import {DustBurst} from '../Effects';
import {PromoLayout, beatProgress} from '../PromoLayout';
import {theme} from '../../theme';

export const FeatureGridScene: React.FC<{
  heading?: string;
  items: Array<{icon: string; title: string}>;
}> = ({heading = '核心能力', items}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const head = beatProgress(frame, durationInFrames, 0.05, 0.2);
  const headY = interpolate(head, [0, 0.6, 1], [-100, 10, 0]);
  const headImpact = interpolate(head, [0.45, 0.65, 1], [0, 1, 0]);

  return (
    <PromoLayout>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%'}}>
        <div style={{position: 'relative'}}>
          <div
            style={{
              opacity: head,
              transform: `translateY(${headY}px)`,
              fontSize: 64,
              fontWeight: 900,
              color: theme.text,
            }}
          >
            {heading}
          </div>
          <DustBurst impact={headImpact} width={360} />
        </div>
        <div style={{display: 'flex', gap: 24}}>
          {items.map((item, i) => {
            const start = 0.25 + i * 0.18;
            const p = beatProgress(frame, durationInFrames, start, start + 0.15);
            const rotateY = interpolate(p, [0, 1], [70, 0]);
            return (
              <div
                key={item.title}
                style={{
                  opacity: p,
                  transform: `perspective(800px) rotateY(${rotateY}deg)`,
                  width: 320,
                  height: 280,
                  borderRadius: 24,
                  background: theme.surface,
                  color: theme.text,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  boxShadow: theme.cardShadow,
                  border: i === items.length - 1 ? `4px solid ${theme.accent}` : undefined,
                }}
              >
                <div style={{fontSize: 64}}>{item.icon}</div>
                <div style={{fontSize: 28, fontWeight: 900, textAlign: 'center', padding: '0 16px'}}>
                  {item.title}
                </div>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: theme.primary,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                  }}
                >
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PromoLayout>
  );
};

export const CompareCardsScene: React.FC<{
  left: {title: string; subtitle: string; tone?: 'danger' | 'neutral'};
  right: {title: string; subtitle: string; tone?: 'success' | 'neutral'};
  tip?: string;
}> = ({left, right, tip}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const a = beatProgress(frame, durationInFrames, 0.08, 0.28);
  const x = beatProgress(frame, durationInFrames, 0.3, 0.42);
  const b = beatProgress(frame, durationInFrames, 0.45, 0.65);
  const tipP = beatProgress(frame, durationInFrames, 0.7, 0.85);

  return (
    <PromoLayout showMascot>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
          <div
            style={{
              opacity: a,
              transform: `translateX(${interpolate(a, [0, 1], [-120, 0])}px)`,
              background: theme.surface,
              borderRadius: 22,
              padding: '28px 36px',
              fontSize: 40,
              fontWeight: 900,
              color: left.tone === 'danger' ? theme.danger : theme.primary,
              boxShadow: theme.cardShadow,
              border: left.tone === 'danger' ? `3px solid ${theme.danger}` : undefined,
            }}
          >
            {left.title}
            <div style={{marginTop: 8, fontSize: 22, color: theme.textMuted, fontWeight: 700}}>
              {left.subtitle}
            </div>
          </div>
          <div style={{opacity: x, fontSize: 48, fontWeight: 900, color: theme.text}}>vs</div>
          <div
            style={{
              opacity: b,
              transform: `translateX(${interpolate(b, [0, 1], [120, 0])}px)`,
              background: theme.surface,
              borderRadius: 22,
              padding: '28px 36px',
              fontSize: 40,
              fontWeight: 900,
              color: right.tone === 'success' ? theme.success : theme.primary,
              boxShadow: theme.cardShadow,
              border: right.tone === 'success' ? `3px solid ${theme.success}` : undefined,
            }}
          >
            {right.title}
            <div style={{marginTop: 8, fontSize: 22, color: theme.textMuted, fontWeight: 700}}>
              {right.subtitle}
            </div>
          </div>
        </div>
        {tip ? (
          <div style={{opacity: tipP, fontSize: 34, fontWeight: 800, color: theme.textMuted}}>
            {tip}
          </div>
        ) : null}
      </div>
    </PromoLayout>
  );
};

export const MindmapScene: React.FC<{
  center: string;
  nodes: Array<{label: string; icon: string; x: number; y: number}>;
}> = ({center, nodes}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const centerP = beatProgress(frame, durationInFrames, 0.05, 0.22);

  return (
    <PromoLayout>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="900"
          height="520"
          viewBox="0 0 900 520"
          style={{position: 'absolute', opacity: centerP * 0.55}}
        >
          {nodes.map((n, i) => (
            <line
              key={i}
              x1="450"
              y1="260"
              x2={450 + n.x * 0.85}
              y2={260 + n.y * 0.85}
              stroke="rgba(15,23,42,0.25)"
              strokeWidth="3"
              strokeDasharray="8 10"
            />
          ))}
        </svg>
        <div
          style={{
            opacity: centerP,
            transform: `scale(${interpolate(centerP, [0, 1], [0.6, 1])})`,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `linear-gradient(145deg, ${theme.primary}, #1D4ED8)`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 900,
            boxShadow: '0 20px 50px rgba(37,99,235,0.4)',
            zIndex: 2,
            textAlign: 'center',
            lineHeight: 1.2,
            padding: 16,
            whiteSpace: 'pre-line',
          }}
        >
          {center}
        </div>
        {nodes.map((n, i) => {
          const p = beatProgress(frame, durationInFrames, 0.25 + i * 0.12, 0.4 + i * 0.12);
          return (
            <div
              key={n.label}
              style={{
                position: 'absolute',
                left: `calc(50% + ${n.x}px)`,
                top: `calc(50% + ${n.y}px)`,
                transform: 'translate(-50%, -50%)',
                opacity: p,
                width: 180,
                padding: '18px 14px',
                borderRadius: 18,
                background: theme.surface,
                boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                textAlign: 'center',
                border: '2px solid rgba(15,23,42,0.1)',
              }}
            >
              <div style={{fontSize: 36}}>{n.icon}</div>
              <div style={{marginTop: 6, fontSize: 24, fontWeight: 900, color: theme.text}}>
                {n.label}
              </div>
            </div>
          );
        })}
      </div>
    </PromoLayout>
  );
};

export const CtaScene: React.FC<{title: string; subtitle?: string}> = ({title, subtitle}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const m = beatProgress(frame, durationInFrames, 0.1, 0.4);
  const s = beatProgress(frame, durationInFrames, 0.45, 0.65);

  return (
    <PromoLayout showBrand showMascot>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
        <div
          style={{
            opacity: m,
            transform: `scale(${interpolate(m, [0, 1], [0.8, 1])})`,
            fontSize: 72,
            fontWeight: 900,
            color: theme.text,
            textAlign: 'center',
            maxWidth: 1100,
            textShadow: '0 3px 0 #fff, 0 6px 0 rgba(0,0,0,0.2)',
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              opacity: s,
              padding: '14px 28px',
              borderRadius: 999,
              background: theme.primary,
              color: '#fff',
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </PromoLayout>
  );
};

export const GlobeHookScene: React.FC<{title: string; subtitle?: string}> = ({title, subtitle}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const m = beatProgress(frame, durationInFrames, 0.08, 0.35);

  return (
    <PromoLayout showBrand>
      <div style={{display: 'flex', alignItems: 'center', gap: 48, width: '100%', justifyContent: 'center'}}>
        <div style={{flex: 1, maxWidth: 720}}>
          <div
            style={{
              opacity: m,
              fontSize: 64,
              fontWeight: 900,
              color: theme.text,
              lineHeight: 1.25,
              textShadow: '0 2px 0 #fff',
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                marginTop: 20,
                opacity: beatProgress(frame, durationInFrames, 0.4, 0.55),
                fontSize: 32,
                fontWeight: 700,
                color: theme.textMuted,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        <DotGlobe size={380} />
      </div>
    </PromoLayout>
  );
};
