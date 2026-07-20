import React from 'react';
import {theme} from '../theme';

export const BrandBar: React.FC<{
  name?: string;
  tagline?: string;
  subtle?: boolean;
}> = ({name = 'Tutorial Kit', tagline = '教程视觉底座', subtle = true}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: theme.font,
      opacity: subtle ? 0.85 : 1,
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: `linear-gradient(135deg, ${theme.primary} 0%, #7eb8e0 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        color: '#fff',
        fontWeight: 900,
      }}
    >
      T
    </div>
    <div>
      <div style={{fontSize: 20, fontWeight: 800, color: theme.text, letterSpacing: 0.4}}>{name}</div>
      <div style={{fontSize: 14, color: theme.textDim, marginTop: 1}}>{tagline}</div>
    </div>
  </div>
);
