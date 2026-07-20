import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {beatEnter} from './motion';
import {theme} from '../theme';

export const FocusZoom: React.FC<{
  children: React.ReactNode;
  focusX: number;
  focusY: number;
  scale?: number;
  showCursor?: boolean;
}> = ({children, focusX, focusY, scale = 1.65, showCursor = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = beatEnter(frame, fps, 4);
  const s = interpolate(p, [0, 1], [1, scale]);
  const tx = interpolate(p, [0, 1], [0, (0.5 - focusX) * 900]);
  const ty = interpolate(p, [0, 1], [0, (0.5 - focusY) * 500]);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div
        style={{
          width: '100%',
          height: '100%',
          scale: s,
          translate: `${tx}px ${ty}px`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
      {showCursor && p > 0.5 ? (
        <div
          style={{
            position: 'absolute',
            left: `${focusX * 100}%`,
            top: `${focusY * 100}%`,
            fontSize: 36,
            opacity: interpolate(p, [0.5, 0.8], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
            pointerEvents: 'none',
          }}
        >
          🖱️
        </div>
      ) : null}
      {p > 0.4 ? (
        <div
          style={{
            position: 'absolute',
            left: `${focusX * 100 - 8}%`,
            top: `${focusY * 100 - 6}%`,
            width: '16%',
            height: '12%',
            border: `3px solid ${theme.accent}`,
            borderRadius: 12,
            boxShadow: `0 0 24px ${theme.accent}`,
            opacity: interpolate(p, [0.4, 0.7], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
