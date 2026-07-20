import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';

type Props = {
  size?: number;
  bob?: boolean;
  style?: React.CSSProperties;
};

/** Generic robot mascot — not brand-specific. */
export const GenericMascot: React.FC<Props> = ({size = 220, bob = true, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const y = bob ? Math.sin(t * 2.2) * 8 : 0;
  const arm = Math.sin(t * 2.2 + 0.4) * 6;

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `translateY(${y}px)`,
        filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.18))',
        ...style,
      }}
    >
      <svg viewBox="0 0 200 220" width="100%" height="100%" aria-hidden>
        <rect x="70" y="28" width="60" height="18" rx="6" fill="#64748b" />
        <circle cx="100" cy="22" r="10" fill="#2563EB" />
        <rect x="40" y="55" width="120" height="100" rx="28" fill="#F8FAFC" stroke="#0f172a" strokeWidth="4" />
        <circle cx="75" cy="100" r="12" fill="#0f172a" />
        <circle cx="125" cy="100" r="12" fill="#0f172a" />
        <circle cx="78" cy="97" r="4" fill="#fff" />
        <circle cx="128" cy="97" r="4" fill="#fff" />
        <rect x="78" y="125" width="44" height="10" rx="5" fill="#2563EB" />
        <g transform={`translate(28,95) rotate(${-12 + arm})`}>
          <rect x="0" y="0" width="22" height="54" rx="10" fill="#CBD5E1" stroke="#0f172a" strokeWidth="3" />
        </g>
        <g transform={`translate(150,95) rotate(${12 - arm})`}>
          <rect x="0" y="0" width="22" height="54" rx="10" fill="#CBD5E1" stroke="#0f172a" strokeWidth="3" />
        </g>
        <rect x="60" y="160" width="28" height="40" rx="10" fill="#94A3B8" />
        <rect x="112" y="160" width="28" height="40" rx="10" fill="#94A3B8" />
        <text x="100" y="210" textAnchor="middle" fontSize="14" fill={theme.textDim} fontFamily={theme.font}>
          GUIDE
        </text>
      </svg>
    </div>
  );
};
