import React from 'react';
import {Composition} from 'remotion';
import {COMPOSITION_FPS, TOTAL_FRAMES, TutorialComposition} from './TutorialComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TutorialComposition"
      component={TutorialComposition}
      durationInFrames={TOTAL_FRAMES}
      fps={COMPOSITION_FPS}
      width={1920}
      height={1080}
    />
  );
};
