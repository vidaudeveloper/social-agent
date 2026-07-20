/** Screenshot shot metadata (0-1 focus coords). */
export type ScreenshotShot = {
  file: string;
  focusX: number;
  focusY: number;
  scale?: number;
  revealDelay?: number;
};

export const shots = {
  dashboard: {
    file: 'placeholder-dashboard.png',
    focusX: 0.35,
    focusY: 0.28,
    scale: 1.8,
    revealDelay: 6,
  },
  settings: {
    file: 'placeholder-settings.png',
    focusX: 0.55,
    focusY: 0.45,
    scale: 1.6,
    revealDelay: 6,
  },
} as const satisfies Record<string, ScreenshotShot>;

export type ShotKey = keyof typeof shots;
