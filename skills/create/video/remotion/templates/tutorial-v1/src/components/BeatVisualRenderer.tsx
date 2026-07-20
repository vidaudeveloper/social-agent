import React from 'react';
import type {BeatVisual} from '../data/beats';
import {shots} from '../data/screenshots';
import {ScreenshotFocus} from './ScreenshotFocus';
import {
  BigMessageScene,
  BigStepScene,
  CompareCardsScene,
  CtaScene,
  FeatureGridScene,
  GlobeHookScene,
  HookQuestionScene,
  MindmapScene,
  WarningHookScene,
} from './scenes';

export const BeatVisualRenderer: React.FC<{visual: BeatVisual}> = ({visual}) => {
  switch (visual.type) {
    case 'hook-question':
      return (
        <HookQuestionScene
          parts={visual.parts}
          mascotEmoji={visual.mascotEmoji}
          mascotLabel={visual.mascotLabel}
        />
      );
    case 'warning-hook':
      return <WarningHookScene title={visual.title} subtitle={visual.subtitle} />;
    case 'big-message':
      return (
        <BigMessageScene
          emoji={visual.emoji}
          title={visual.title}
          titleColor={visual.titleColor}
          subtitle={visual.subtitle}
        />
      );
    case 'big-step':
      return <BigStepScene step={visual.step} title={visual.title} />;
    case 'feature-grid':
      return <FeatureGridScene heading={visual.heading} items={visual.items} />;
    case 'compare-cards':
      return (
        <CompareCardsScene left={visual.left} right={visual.right} tip={visual.tip} />
      );
    case 'mindmap':
      return <MindmapScene center={visual.center} nodes={visual.nodes} />;
    case 'globe-hook':
      return <GlobeHookScene title={visual.title} subtitle={visual.subtitle} />;
    case 'screenshot':
      return <ScreenshotFocus shot={shots[visual.shot]} />;
    case 'cta':
      return <CtaScene title={visual.title} subtitle={visual.subtitle} />;
    default: {
      const _exhaustive: never = visual;
      return _exhaustive;
    }
  }
};
