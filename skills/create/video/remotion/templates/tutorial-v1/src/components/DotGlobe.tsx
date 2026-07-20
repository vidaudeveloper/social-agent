import React, {useMemo} from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';

type Dot = {x: number; y: number; delay: number};

export const DotGlobe: React.FC<{color?: string; size?: number}> = ({
  color = theme.primary,
  size = 420,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const dots = useMemo(() => {
    const result: Dot[] = [];
    const cx = size / 2;
    const cy = size * 0.55;
    const radius = size * 0.42;
    const step = 11;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius && dy <= 40) {
          const angle = Math.atan2(dy, dx);
          const delay = (angle + Math.PI) / (Math.PI * 2);
          result.push({x, y, delay});
        }
      }
    }
    return result;
  }, [size]);

  const pulse = interpolate(frame % (fps * 3), [0, fps * 1.5, fps * 3], [0.85, 1, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        filter: `drop-shadow(0 0 40px ${theme.primaryGlow})`,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {dots.map((dot, i) => {
          const appear = interpolate(
            frame,
            [dot.delay * fps * 0.8, dot.delay * fps * 0.8 + fps * 0.4],
            [0, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)},
          );
          const r = 2.2 * pulse * appear;
          return (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={r}
              fill={color}
              opacity={0.35 + appear * 0.65}
            />
          );
        })}
      </svg>
    </div>
  );
};
