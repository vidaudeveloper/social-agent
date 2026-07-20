import {Easing, interpolate} from 'remotion';

export function beatEnter(frame: number, fps: number, delay = 0) {
  return interpolate(frame - delay, [0, 0.35 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
}

export function beatExit(frame: number, fps: number, durationInFrames: number) {
  return interpolate(frame, [durationInFrames - 0.2 * fps, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export function pop(frame: number, fps: number, delay = 0) {
  const p = beatEnter(frame, fps, delay);
  return interpolate(p, [0, 1], [0.88, 1]);
}

export function slideY(frame: number, fps: number, delay = 0, dist = 40) {
  const p = beatEnter(frame, fps, delay);
  return interpolate(p, [0, 1], [dist, 0]);
}

export function pulse(frame: number, fps: number) {
  return 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 4);
}

/** Slam-in scale impact */
export function slamIn(frame: number, fps: number, delay = 0) {
  const t = frame - delay;
  const scale = interpolate(t, [0, 0.12 * fps, 0.28 * fps, 0.4 * fps], [2.6, 0.9, 1.08, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(t, [0, 0.08 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {scale, opacity};
}

/** Fall from top with land impact */
export function fallFromTop(frame: number, fps: number, delay = 0, fromY = -180) {
  const t = frame - delay;
  const y = interpolate(t, [0, 0.22 * fps, 0.34 * fps, 0.48 * fps], [fromY, 18, -8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.2, 0.9, 0.3, 1.15),
  });
  const opacity = interpolate(t, [0, 0.1 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rotate = interpolate(t, [0, 0.22 * fps, 0.48 * fps], [-8, 3, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const impact = interpolate(t, [0.2 * fps, 0.28 * fps, 0.55 * fps], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {y, opacity, rotate, impact};
}

export function slideFromLeft(frame: number, fps: number, delay = 0, fromX = -220) {
  const t = frame - delay;
  const x = interpolate(t, [0, 0.35 * fps], [fromX, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(t, [0, 0.15 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {x, opacity};
}

export function slideFromRight(frame: number, fps: number, delay = 0, fromX = 220) {
  const t = frame - delay;
  const x = interpolate(t, [0, 0.35 * fps], [fromX, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(t, [0, 0.15 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {x, opacity};
}

export function fadeRise(frame: number, fps: number, delay = 0, fromY = 60) {
  const t = frame - delay;
  const y = interpolate(t, [0, 0.4 * fps], [fromY, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const opacity = interpolate(t, [0, 0.3 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {y, opacity};
}

export function flipIn(frame: number, fps: number, delay = 0) {
  const t = frame - delay;
  const rotateY = interpolate(t, [0, 0.4 * fps], [75, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(t, [0, 0.2 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(t, [0, 0.4 * fps], [0.85, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {rotateY, opacity, scale};
}

export function flyBounce(frame: number, fps: number, delay = 0, fromY = 140) {
  const t = frame - delay;
  const y = interpolate(t, [0, 0.18 * fps, 0.32 * fps, 0.45 * fps], [fromY, -14, 6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1.15, 0.36, 1),
  });
  const opacity = interpolate(t, [0, 0.1 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {y, opacity};
}

export function impactShake(frame: number, fps: number, hitFrame = 10) {
  const t = frame - hitFrame;
  if (t < 0) return {x: 0, y: 0};
  const decay = interpolate(t, [0, 0.25 * fps], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {
    x: Math.sin(t * 1.8) * 8 * decay,
    y: Math.cos(t * 2.2) * 4 * decay,
  };
}

/** Map a beat-local ratio window to 0-1 progress */
export function ratioProgress(
  frame: number,
  durationInFrames: number,
  startRatio: number,
  endRatio: number,
) {
  return interpolate(frame, [durationInFrames * startRatio, durationInFrames * endRatio], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export const motion = {
  beatEnter,
  beatExit,
  pop,
  slideY,
  pulse,
  slamIn,
  fallFromTop,
  slideFromLeft,
  slideFromRight,
  fadeRise,
  flipIn,
  flyBounce,
  impactShake,
  ratioProgress,
} as const;
