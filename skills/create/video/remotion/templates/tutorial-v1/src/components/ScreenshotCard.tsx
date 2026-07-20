import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {theme} from '../theme';

export const ScreenshotCard: React.FC<{
  src: string;
  label?: string;
  height?: number;
}> = ({src, label, height = 420}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 18], [0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        borderRadius: 24,
        overflow: 'hidden',
        border: `3px solid ${theme.ink}`,
        boxShadow: '0 24px 70px rgba(0,0,0,0.35), 0 0 0 6px rgba(255,255,255,0.55)',
        background: '#0f172a',
      }}
    >
      {label ? (
        <div
          style={{
            padding: '12px 20px',
            fontSize: 22,
            fontWeight: 700,
            color: '#e2e8f0',
            background: 'rgba(255,255,255,0.06)',
            borderBottom: `1px solid ${theme.surfaceBorder}`,
          }}
        >
          {label}
        </div>
      ) : null}
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height,
          objectFit: 'cover',
          objectPosition: 'top center',
          display: 'block',
          background: '#fff',
        }}
      />
    </div>
  );
};
