import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBar} from './BrandBar';
import {GenericMascot} from './GenericMascot';
import {theme} from '../theme';

type Node = {x: number; y: number};

const NODES: Node[] = [
  {x: 180, y: 200},
  {x: 520, y: 140},
  {x: 980, y: 220},
  {x: 1420, y: 160},
  {x: 1740, y: 280},
  {x: 280, y: 560},
  {x: 760, y: 620},
  {x: 1280, y: 540},
  {x: 1680, y: 680},
  {x: 480, y: 900},
  {x: 1100, y: 860},
];

const EDGES: Array<[number, number]> = [
  [0, 2],
  [2, 4],
  [5, 7],
  [1, 6],
  [7, 10],
];

const ACTIVE = new Set([0, 1, 2, 3, 4]);

const PaleYellowNetworkBg: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const dashOffset = -t * 36;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{background: theme.bgGradient}} />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        style={{position: 'absolute', inset: 0, opacity: 0.18, pointerEvents: 'none'}}
      >
        <ellipse cx="480" cy="420" rx="280" ry="180" fill="#D4B24A" />
        <ellipse cx="1100" cy="380" rx="320" ry="200" fill="#D4B24A" />
        <ellipse cx="1450" cy="560" rx="200" ry="140" fill="#C9A63E" />
      </svg>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
      >
        {EDGES.map(([ai, bi], i) => {
          const a = NODES[ai];
          const b = NODES[bi];
          const mx = (a.x + b.x) / 2 + Math.sin(i * 1.7) * 36;
          const my = (a.y + b.y) / 2 + Math.cos(i * 1.3) * 28;
          const d = `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
          const isActive = ACTIVE.has(i);
          const speed = 0.1 + (i % 3) * 0.03;
          const prog = (t * speed + i * 0.19) % 1;
          const px = (1 - prog) * (1 - prog) * a.x + 2 * (1 - prog) * prog * mx + prog * prog * b.x;
          const py = (1 - prog) * (1 - prog) * a.y + 2 * (1 - prog) * prog * my + prog * prog * b.y;
          const twinkle = 0.2 + 0.3 * Math.abs(Math.sin(t * 1.1 + i));

          return (
            <g key={`e-${i}`}>
              <path
                d={d}
                fill="none"
                stroke={isActive ? 'rgba(80,80,80,0.16)' : 'rgba(80,80,80,0.07)'}
                strokeWidth={isActive ? 1.5 : 1.1}
                strokeDasharray="6 14"
                strokeDashoffset={dashOffset + i * 14}
              />
              {isActive ? (
                <circle cx={px} cy={py} r={2.8} fill={`rgba(70,70,70,${0.18 + twinkle * 0.18})`} />
              ) : null}
            </g>
          );
        })}
        {NODES.map((n, i) => (
          <g key={`n-${i}`}>
            <circle cx={n.x} cy={n.y} r={3.5} fill="rgba(70,70,70,0.1)" />
            <circle cx={n.x} cy={n.y} r={1.8} fill="rgba(70,70,70,0.2)" />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Locked scene chrome — yellow network backdrop + optional brand / mascot.
 * New scenes MUST wrap content with this (or PopLayout alias).
 */
export const PromoLayout: React.FC<{
  children: React.ReactNode;
  showBrand?: boolean;
  showMascot?: boolean;
  brandName?: string;
  brandTagline?: string;
}> = ({children, showBrand = false, showMascot = false, brandName, brandTagline}) => {
  return (
    <AbsoluteFill style={{fontFamily: theme.font, color: theme.ink}}>
      <PaleYellowNetworkBg />
      {showBrand ? (
        <div style={{position: 'absolute', top: 28, left: 48, zIndex: 5}}>
          <BrandBar name={brandName} tagline={brandTagline} />
        </div>
      ) : null}
      {showMascot ? (
        <div
          style={{
            position: 'absolute',
            right: 36,
            bottom: 100,
            zIndex: 4,
            pointerEvents: 'none',
          }}
        >
          <GenericMascot size={280} />
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: showBrand
            ? '88px 64px 72px'
            : showMascot
              ? '56px 340px 72px 64px'
              : '56px 64px 72px',
          boxSizing: 'border-box',
          zIndex: 3,
          color: theme.ink,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Alias kept for older morelogin naming. */
export const PopLayout = PromoLayout;

export function beatProgress(
  frame: number,
  durationInFrames: number,
  startRatio: number,
  endRatio: number,
) {
  const start = durationInFrames * startRatio;
  const end = durationInFrames * endRatio;
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}
