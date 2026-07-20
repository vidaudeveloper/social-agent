import type {ShotKey} from './screenshots';

export type BeatSection = 'open' | 'reason' | 'compare' | 'solution' | 'demo' | 'summary';

export type BeatVisual =
  | {
      type: 'hook-question';
      parts: Array<{text: string; color: string}>;
      mascotEmoji?: string;
      mascotLabel?: string;
    }
  | {type: 'warning-hook'; title: string; subtitle?: string}
  | {type: 'big-message'; emoji: string; title: string; titleColor?: string; subtitle?: string}
  | {type: 'big-step'; step: string; title: string}
  | {type: 'feature-grid'; heading?: string; items: Array<{icon: string; title: string}>}
  | {
      type: 'compare-cards';
      left: {title: string; subtitle: string; tone?: 'danger' | 'neutral'};
      right: {title: string; subtitle: string; tone?: 'success' | 'neutral'};
      tip?: string;
    }
  | {
      type: 'mindmap';
      center: string;
      nodes: Array<{label: string; icon: string; x: number; y: number}>;
    }
  | {type: 'globe-hook'; title: string; subtitle?: string}
  | {type: 'screenshot'; shot: ShotKey}
  | {type: 'cta'; title: string; subtitle?: string};

export type Beat = {
  id: string;
  section: BeatSection;
  text: string;
  visual: BeatVisual;
};

/**
 * Generic demo beats — fictional CloudDesk product.
 * Replace this file when scaffolding a real tutorial.
 */
export const beats: Beat[] = [
  {
    id: 'o1',
    section: 'open',
    text: '多账号运营时，为什么总是莫名其妙被风控？',
    visual: {
      type: 'hook-question',
      parts: [
        {text: '多账号', color: '#92400E'},
        {text: '总被', color: '#0f172a'},
        {text: '风控？', color: '#EF4444'},
      ],
      mascotEmoji: '🤖',
      mascotLabel: 'CloudDesk 教程',
    },
  },
  {
    id: 'o2',
    section: 'open',
    text: '先别急着重装软件，问题往往出在环境隔离。',
    visual: {
      type: 'warning-hook',
      title: '先别重装软件',
      subtitle: '根因多半是环境串号',
    },
  },
  {
    id: 'r1',
    section: 'reason',
    text: '风控通常同时看设备指纹、网络出口和登录行为。',
    visual: {
      type: 'mindmap',
      center: '风控\n判定',
      nodes: [
        {label: '设备指纹', icon: '🖥️', x: -320, y: -160},
        {label: '网络出口', icon: '🌐', x: 320, y: -160},
        {label: '登录行为', icon: '🔐', x: -320, y: 160},
        {label: '账号关联', icon: '🔗', x: 320, y: 160},
      ],
    },
  },
  {
    id: 'c1',
    section: 'compare',
    text: '错误做法是共用一台裸机；推荐做法是隔离环境加独立出口。',
    visual: {
      type: 'compare-cards',
      left: {title: '❌ 裸机共用', subtitle: '指纹串号风险高', tone: 'danger'},
      right: {title: '✅ 隔离环境', subtitle: '一号一环境', tone: 'success'},
      tip: '内容可变，视觉底座不变',
    },
  },
  {
    id: 'd1',
    section: 'solution',
    text: 'CloudDesk 提供三块能力：环境、代理、批量管理。',
    visual: {
      type: 'feature-grid',
      heading: '三块能力',
      items: [
        {icon: '🧩', title: '环境隔离'},
        {icon: '🛡️', title: '出口管理'},
        {icon: '📦', title: '批量操作'},
      ],
    },
  },
  {
    id: 'd2',
    section: 'demo',
    text: '第一步：打开控制台，新建一个独立环境。',
    visual: {type: 'big-step', step: '01', title: '新建独立环境'},
  },
  {
    id: 'd3',
    section: 'demo',
    text: '看真实界面：在控制台点击新建，并填写环境名称。',
    visual: {type: 'screenshot', shot: 'dashboard'},
  },
  {
    id: 'd4',
    section: 'demo',
    text: '第二步：在设置里绑定出口节点，并保存。',
    visual: {type: 'screenshot', shot: 'settings'},
  },
  {
    id: 's1',
    section: 'summary',
    text: '一套底座锁风格，换旁白和截图就能做新教程。',
    visual: {
      type: 'globe-hook',
      title: '风格锁死，内容随便变',
      subtitle: 'theme · motion · PromoLayout',
    },
  },
  {
    id: 's2',
    section: 'summary',
    text: '现在就用模板脚手架开始你的下一支教程片。',
    visual: {
      type: 'cta',
      title: '开始你的教程片',
      subtitle: 'npx → init-tutorial',
    },
  },
];
