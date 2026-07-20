import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {beatEnter, pop, slideY} from './motion';
import {theme} from '../theme';

export const PopCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  accent?: boolean;
  danger?: boolean;
  width?: number | string;
}> = ({children, delay = 0, accent, danger, width = 'auto'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = pop(frame, fps, delay);
  const y = slideY(frame, fps, delay, 36);
  const opacity = beatEnter(frame, fps, delay);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        background: theme.surface,
        color: theme.text,
        borderRadius: 20,
        padding: '28px 40px',
        fontSize: theme.bodySize,
        fontWeight: 800,
        lineHeight: 1.35,
        boxShadow: theme.cardShadow,
        maxWidth: 920,
        width,
        textAlign: 'center',
        border: accent
          ? `3px solid ${theme.accent}`
          : danger
            ? `3px solid ${theme.danger}`
            : undefined,
      }}
    >
      {children}
    </div>
  );
};
