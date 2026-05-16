import * as THREE from 'three';

/**
 * 亮相停留 + 过场过渡：scroll.offset ∈ [0,1] 上的区间比例。
 * 停留区画面静止；过场区在两屏姿态间快速插值。
 * 宽度总和 = 1；改节奏只改 SCROLL_RHYTHM_SEGMENTS，RHYTHM_CONFIG 自动对齐。
 */
export type RhythmSegmentId = 'hold1' | 'trans1to2' | 'hold2' | 'trans2to3' | 'hold3';

export type RhythmSegment = {
  id: RhythmSegmentId;
  /** HUD 短标签，如「屏1→2过场」 */
  label: string;
  width: number;
  start: number;
  end: number;
  /** 这一段滚动时，画面上主要在发生什么 */
  description: string;
};

export const SCROLL_RHYTHM_SEGMENTS: readonly RhythmSegment[] = [
  // 屏1停留 3%：开场定稿一口气，避免第一次滚动「画面不动」
  {
    id: 'hold1',
    label: '屏1停留',
    width: 0.03,
    start: 0,
    end: 0.03,
    description: '大月居中、深色夜空定稿；屏1文案就位，几乎不耗滚动',
  },
  // 屏1→2 过场 25%：月亮要完成大幅位移+缩小，需要足够滚动时间
  {
    id: 'trans1to2',
    label: '屏1→2过场',
    width: 0.25,
    start: 0.03,
    end: 0.28,
    description: '月亮从居中缩小、飞到右上角；屏1文字向上滑出；屏2文字从下方升起',
  },
  // 屏2停留 20%：角月+屏2文案，给中段阅读留白
  {
    id: 'hold2',
    label: '屏2停留',
    width: 0.2,
    start: 0.28,
    end: 0.48,
    description: '角月挂右上角；屏2文案居中可读',
  },
  // 屏2→3 过场 25%：月亮扩大成整屏背景+背景渐变，视觉变化最大
  {
    id: 'trans2to3',
    label: '屏2→3过场',
    width: 0.25,
    start: 0.48,
    end: 0.73,
    description: '月亮扩大成整屏环境；整页由深靛渐变为暖月；屏2文字滑出、屏3文字升起',
  },
  // 屏3停留 27%：终章暖环境+模型，停留预算最长
  {
    id: 'hold3',
    label: '屏3停留',
    width: 0.27,
    start: 0.73,
    end: 1,
    description: '月与暖色环境融合；模型与屏3文案完整呈现',
  },
] as const;

function segmentBounds(id: RhythmSegmentId) {
  const s = SCROLL_RHYTHM_SEGMENTS.find((x) => x.id === id)!;
  return { start: s.start, end: s.end };
}

/** 节奏逻辑仍用 start/end；数值与 SCROLL_RHYTHM_SEGMENTS 同源 */
export const RHYTHM_CONFIG = {
  hold1: segmentBounds('hold1'),
  trans1to2: segmentBounds('trans1to2'),
  hold2: segmentBounds('hold2'),
  trans2to3: segmentBounds('trans2to3'),
  hold3: segmentBounds('hold3'),
} as const;

/** 总滚动距离：约 5 屏高走完叙事 */
export const SCROLL_CONTROL_PAGES = 5;

const OFF_BOTTOM_VH = 100;
const OFF_TOP_VH = -100;

/** 屏 1 停留定稿值(勿改) */
export const MOON_HOLD1 = { positionX: -5, positionY: -13, sizePx: 680, sizeVh: 0, opacity: 1 };
/** 屏 2 停留：右上角挂月(建议值) */
export const MOON_HOLD2 = { positionX: 32, positionY: -32, sizePx: 200, sizeVh: 0, opacity: 1 };
/** 屏 3 停留：月成为环境,充满视口 */
export const MOON_HOLD3 = { positionX: 0, positionY: 0, sizePx: 0, sizeVh: 200, opacity: 1 };

/** 屏 3 暖月底色:与月盘 #f4ead5 同色相、略深,避免 #e8dcb8 偏绿 */
export const SCREEN3_AMBIENT_BG = '#ede1c0';

export type MoonState = typeof MOON_HOLD1;

export type RhythmPhase = 'hold' | 'transition';

export type RhythmState = {
  phase: RhythmPhase;
  /** 停留区 = 该屏；过场区 = 上一屏(切换完成前不换文案) */
  activeScreenIndex: number;
  i0: number;
  i1: number;
  /** 屏间插值 0~1，过场区经 easeInOutCubic */
  t: number;
};

function clamp01(x: number) {
  return THREE.MathUtils.clamp(Number.isFinite(x) ? x : 0, 0, 1);
}

/** 当前 scroll.offset 落在哪一段（与 getRhythmState 边界一致） */
export function getRhythmSegmentAt(scrollOffset: number): RhythmSegment {
  const o = clamp01(scrollOffset);
  const segs = SCROLL_RHYTHM_SEGMENTS;
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (o < seg.end || (i === segs.length - 1 && o <= seg.end)) return seg;
  }
  return segs[segs.length - 1];
}

export function easeInOutCubic(t: number) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function segmentLocal(offset: number, start: number, end: number) {
  if (end <= start) return 0;
  return clamp01((offset - start) / (end - start));
}

/** 模型走位用的屏索引与插值 t */
export function getRhythmState(scrollOffset: number): RhythmState {
  const o = clamp01(scrollOffset);
  const c = RHYTHM_CONFIG;

  if (o < c.hold1.end) {
    return { phase: 'hold', activeScreenIndex: 0, i0: 0, i1: 0, t: 0 };
  }
  if (o < c.trans1to2.end) {
    const t = easeInOutCubic(segmentLocal(o, c.trans1to2.start, c.trans1to2.end));
    return { phase: 'transition', activeScreenIndex: 0, i0: 0, i1: 1, t };
  }
  if (o < c.hold2.end) {
    return { phase: 'hold', activeScreenIndex: 1, i0: 1, i1: 1, t: 0 };
  }
  if (o < c.trans2to3.end) {
    const t = easeInOutCubic(segmentLocal(o, c.trans2to3.start, c.trans2to3.end));
    return { phase: 'transition', activeScreenIndex: 1, i0: 1, i1: 2, t };
  }
  return { phase: 'hold', activeScreenIndex: 2, i0: 2, i1: 2, t: 0 };
}

function lerpMoon(a: MoonState, b: MoonState, t: number): MoonState {
  return {
    positionX: THREE.MathUtils.lerp(a.positionX, b.positionX, t),
    positionY: THREE.MathUtils.lerp(a.positionY, b.positionY, t),
    sizePx: THREE.MathUtils.lerp(a.sizePx, b.sizePx, t),
    sizeVh: THREE.MathUtils.lerp(a.sizeVh, b.sizeVh, t),
    opacity: THREE.MathUtils.lerp(a.opacity, b.opacity, t),
  };
}

/**
 * 月亮叙事链 → 背景分工(勿混用)
 * | 滚动段   | 月亮 DOM z=30 | Canvas (z=100)     | 整页 DOM z=5      |
 * | 屏1停留  | 大月          | null               | 深靛(page.tsx)    |
 * | 1→2过场  | 缩至角        | null               | 深靛              |
 * | 屏2停留  | 角月          | null               | 深靛              |
 * | 2→3过场  | 扩大满屏      | null(必透明!)      | 深靛→暖月 lerp    |
 * | 屏3停留  | 充满融合      | 暖月色(与月无缝)   | 暖月色            |
 */

/** 整页底色 0=深靛 1=暖月:仅 trans2to3 起 lerp(IntroMoonLayer),不驱动 Canvas */
export function getPageAmbientBgMix(scrollOffset: number): number {
  const o = clamp01(scrollOffset);
  const c = RHYTHM_CONFIG;
  if (o < c.trans2to3.start) return 0;
  if (o < c.trans2to3.end) {
    return easeInOutCubic(segmentLocal(o, c.trans2to3.start, c.trans2to3.end));
  }
  return 1;
}

/** 屏3停留:Canvas 铺暖月色;2→3 过场期间必须为 false */
export function isScreen3CanvasWarmHold(scrollOffset: number): boolean {
  return clamp01(scrollOffset) >= RHYTHM_CONFIG.hold3.start;
}

/** Canvas 透明以露出身后月亮(含 2→3 过场扩大动画) */
export function shouldCanvasBeTransparent(scrollOffset: number, inspectMode: boolean): boolean {
  if (inspectMode) return false;
  if (getIntroScreenFade(scrollOffset, false) > 0.02) return true;
  return !isScreen3CanvasWarmHold(scrollOffset);
}

/** 1=角月光晕,0=屏3无边界光晕 */
export function getMoonGlowMix(scrollOffset: number): number {
  return 1 - getPageAmbientBgMix(scrollOffset);
}

/** 屏 1 径向夜空：随 1→2 过场淡出(月亮仍连续位移) */
export function getIntroScreenFade(scrollOffset: number, inspectMode: boolean): number {
  if (inspectMode) return 0;
  const { i0, i1, t } = getRhythmState(scrollOffset);
  if (i0 === 0 && i1 === 0) return 1;
  if (i0 === 0 && i1 === 1) return 1 - t;
  return 0;
}

/** 叙事文字卷轴 Y 偏移(vh):正=下移,负=上移 */
export function getTextScrollYVh(screenIndex: number, scrollOffset: number): number {
  const o = clamp01(scrollOffset);
  const c = RHYTHM_CONFIG;

  if (screenIndex === 0) {
    if (o < c.hold1.end) return 0;
    if (o < c.trans1to2.end) {
      const t = easeInOutCubic(segmentLocal(o, c.trans1to2.start, c.trans1to2.end));
      return THREE.MathUtils.lerp(0, OFF_TOP_VH, t);
    }
    return OFF_TOP_VH;
  }

  if (screenIndex === 1) {
    if (o < c.trans1to2.start) return OFF_BOTTOM_VH;
    if (o < c.trans1to2.end) {
      const t = easeInOutCubic(segmentLocal(o, c.trans1to2.start, c.trans1to2.end));
      return THREE.MathUtils.lerp(OFF_BOTTOM_VH, 0, t);
    }
    if (o < c.hold2.end) return 0;
    if (o < c.trans2to3.end) {
      const t = easeInOutCubic(segmentLocal(o, c.trans2to3.start, c.trans2to3.end));
      return THREE.MathUtils.lerp(0, OFF_TOP_VH, t);
    }
    return OFF_TOP_VH;
  }

  if (o < c.trans2to3.start) return OFF_BOTTOM_VH;
  if (o < c.trans2to3.end) {
    const t = easeInOutCubic(segmentLocal(o, c.trans2to3.start, c.trans2to3.end));
    return THREE.MathUtils.lerp(OFF_BOTTOM_VH, 0, t);
  }
  return 0;
}

/** 月亮贯穿三屏:屏1大月 → 屏2角月 → 屏3月成为环境 */
export function getMoonState(scrollOffset: number, inspectMode: boolean): MoonState {
  if (inspectMode) return { ...MOON_HOLD2, opacity: 0 };
  const o = clamp01(scrollOffset);
  const c = RHYTHM_CONFIG;

  if (o < c.hold1.end) return MOON_HOLD1;
  if (o < c.trans1to2.end) {
    const t = easeInOutCubic(segmentLocal(o, c.trans1to2.start, c.trans1to2.end));
    return lerpMoon(MOON_HOLD1, MOON_HOLD2, t);
  }
  if (o < c.hold2.end) return MOON_HOLD2;
  if (o < c.trans2to3.end) {
    const t = easeInOutCubic(segmentLocal(o, c.trans2to3.start, c.trans2to3.end));
    return lerpMoon(MOON_HOLD2, MOON_HOLD3, t);
  }
  return MOON_HOLD3;
}

