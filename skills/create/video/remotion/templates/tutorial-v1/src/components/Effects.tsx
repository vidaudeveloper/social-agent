import React from 'react';
import {interpolate} from 'remotion';

/** Dust burst on land / slam impact (0-1). */
export const DustBurst: React.FC<{
  impact: number;
  width?: number;
  color?: string;
}> = ({impact, width = 280, color = 'rgba(255,255,255,0.75)'}) => {
  if (impact <= 0.02) return null;

  const particles = Array.from({length: 14}).map((_, i) => {
    const angle = (i / 14) * Math.PI - Math.PI / 2;
    const dist = interpolate(impact, [0, 1], [0, 40 + (i % 5) * 12]);
    const x = Math.cos(angle) * dist * (i % 2 === 0 ? 1.4 : 1);
    const y = Math.abs(Math.sin(angle)) * dist * 0.35 + interpolate(impact, [0, 1], [0, 8]);
    const size = 3 + (i % 4);
    const opacity = interpolate(impact, [0, 0.3, 1], [0, 0.9, 0]) * (0.5 + (i % 3) * 0.15);
    return {x, y, size, opacity, key: i};
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: -6,
        width,
        height: 40,
        marginLeft: -width / 2,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '10%',
          right: '10%',
          bottom: 0,
          height: interpolate(impact, [0, 0.4, 1], [0, 18, 8]),
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${color} 0%, transparent 70%)`,
          opacity: interpolate(impact, [0, 0.25, 1], [0, 0.55, 0]),
          filter: 'blur(4px)',
        }}
      />
      {particles.map((p) => (
        <div
          key={p.key}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 4,
            width: p.size,
            height: p.size,
            borderRadius: p.key % 3 === 0 ? 1 : '50%',
            background: color,
            opacity: p.opacity,
            transform: `translate(${p.x}px, ${-p.y}px) rotate(${p.key * 25}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export const SparkStar: React.FC<{
  size?: number;
  opacity?: number;
  color?: string;
}> = ({size = 14, opacity = 0.6, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{opacity, display: 'block'}}>
    <path
      d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z"
      fill={color}
    />
  </svg>
);
