import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, Series, staticFile} from 'remotion';
import {beats} from './data/beats';
import {beatFrames, COMPOSITION_FPS, TOTAL_FRAMES, voiceoverMeta} from './data/voiceoverMeta';
import {BeatVisualRenderer} from './components/BeatVisualRenderer';
import {SubtitleBar} from './components/SubtitleBar';
import {theme} from './theme';

const durations = beatFrames();

export {COMPOSITION_FPS, TOTAL_FRAMES};

export const TutorialComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: theme.bg}}>
      <Audio src={staticFile(voiceoverMeta.audioFile)} />
      <Series>
        {beats.map((beat, i) => (
          <Series.Sequence key={beat.id} durationInFrames={durations[i] ?? 90} layout="none">
            <BeatVisualRenderer visual={beat.visual} />
          </Series.Sequence>
        ))}
      </Series>
      <SubtitleBar />
    </AbsoluteFill>
  );
};
