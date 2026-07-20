/**
 * Single entry for locked visual kit.
 * New scenes MUST import theme / motion / PromoLayout from here (or sibling paths under components/).
 */
export {theme} from './theme';
export type {Theme} from './theme';
export {motion} from './components/motion';
export * from './components/motion';
export {PromoLayout, PopLayout, beatProgress} from './components/PromoLayout';
export {BrandBar} from './components/BrandBar';
export {DotGlobe} from './components/DotGlobe';
export {SubtitleBar} from './components/SubtitleBar';
export {ScreenshotFocus} from './components/ScreenshotFocus';
export {ScreenshotCard} from './components/ScreenshotCard';
export {FocusZoom} from './components/FocusZoom';
export {PopCard} from './components/PopCard';
export {DustBurst, SparkStar} from './components/Effects';
export {GenericMascot} from './components/GenericMascot';
export * from './components/scenes';
