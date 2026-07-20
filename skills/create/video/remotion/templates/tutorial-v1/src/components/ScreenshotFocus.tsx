import React from 'react';
import {Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {ScreenshotShot} from '../data/screenshots';
import {beatEnter} from './motion';
import {PromoLayout} from './PromoLayout';

/** Real screenshot on tray card — no mock UI. */
export const ScreenshotFocus: React.FC<{shot: ScreenshotShot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = beatEnter(frame, fps, 0);
  const scale = 0.97 + beatEnter(frame, fps, 3) * 0.03;

  return (
    <PromoLayout>
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity: enter,
          transform: `scale(${scale})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background: '#0f172a',
            border: '3px solid #1e293b',
            boxShadow: '0 24px 70px rgba(0,0,0,0.35), 0 0 0 6px rgba(255,255,255,0.55)',
            maxWidth: '96%',
            maxHeight: '94%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile(`screenshots/${shot.file}`)}
            style={{
              maxWidth: '100%',
              maxHeight: '82vh',
              width: 'auto',
              objectFit: 'contain',
              borderRadius: 8,
              background: '#fff',
            }}
          />
        </div>
      </div>
    </PromoLayout>
  );
};
