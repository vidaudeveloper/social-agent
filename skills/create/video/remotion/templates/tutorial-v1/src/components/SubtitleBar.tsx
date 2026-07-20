import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {getCaptionAtSec} from '../data/voiceoverMeta';
import {theme} from '../theme';

export const SubtitleBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const text = getCaptionAtSec(frame / fps);

  if (!text) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 36,
        left: 80,
        right: 80,
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          padding: '14px 28px',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.82)',
          border: `1px solid ${theme.surfaceBorder}`,
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.45,
          textAlign: 'center',
          color: '#fff',
        }}
      >
        {text}
      </div>
    </div>
  );
};
