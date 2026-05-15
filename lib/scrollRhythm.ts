import * as THREE from 'three';

/**
 * 亮相停留 + 过场过渡：scroll.offset ∈ [0,1] 上的区间比例。
 * 停留区画面静止；过场区在两屏姿态间快速插值。
 */
export const RHYTHM_CONFIG = {
  hold1: { start: 0, end: 0.12 },
  trans1to2: { start: 0.12, end: 0.36 },
  hold2: { start: 0.36, end: 0.51 },
  trans2to3: { start: 0.51, end: 0.73 },
  hold3: { start: 0.73, end: 1 },
} as const;

/** 总滚动距离：约 4 屏高走完叙事(3 屏内容 + 余量) */
export const SCROLL_CONTROL_PAGES = 4;

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

