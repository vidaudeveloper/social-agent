/** Locked visual tokens — tutorial-v1 (yellow network / v9). Do not redefine in scenes. */
export const theme = {
  bg: '#E8C85A',
  bgGradient:
    'radial-gradient(ellipse at 50% 35%, #FFF3C4 0%, #F7E08A 52%, #E8C85A 100%)',
  surface: '#ffffff',
  surfaceBorder: 'rgba(15,23,42,0.12)',
  primary: '#2563EB',
  primaryGlow: 'rgba(37,99,235,0.35)',
  accent: '#FACC15',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#92400E',
  text: '#0f172a',
  textMuted: '#334155',
  textDim: '#64748b',
  ink: '#1e293b',
  cardShadow: '0 20px 60px rgba(0,0,0,0.35)',
  font: '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", "Segoe UI", sans-serif',
  titleSize: 120,
  subtitleSize: 44,
  bodySize: 36,
  iconSize: 120,
} as const;

export type Theme = typeof theme;
