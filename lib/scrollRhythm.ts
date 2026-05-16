import * as THREE from 'three';
import { SCREENS } from '@/lib/screens';

/**
 * 节奏机制:每屏由 hold(停留)+ transition(过场)组成。
 * 宽度从 SCREENS 数组按需读取,缺省用 DEFAULT 值,总宽度自动归一化为 1。
 * 加屏 / 删屏 / 调序 → 只动 SCREENS,本文件自动重算。
 *
 * 注:月亮叙事链(MOON_HOLD1/2/3)与暖月底色目前保留原 3 屏编排;
 * 屏 3 之后维持 HOLD3 状态。月亮的精细编排留待下一轮专门做。
 */

const DEFAULT_HOLD_WIDTH = 0.08;
const DEFAULT_TRANSITION_WIDTH = 0.12;

export type RhythmSegmentId = string;

export type RhythmSegment = {
  id: RhythmSegmentId;
  label: string;
  width: number;
  start: number;
  end: number;
  description: string;
  kind: 'hold' | 'trans';
  fromScreen: number;
  toScreen: number;
};

const HIDDEN_MOON_FALLBACK: MoonState = {
  positionX: 32, positionY: -32, sizePx: 200, sizeVh: 0, opacity: 0,
};

function buildSegments(screens: typeof SCREENS): RhythmSegment[] {
  const raw: Array<Omit<RhythmSegment, 'start' | 'end'>> = [];
  let total = 0;

  screens.forEach((s, i) => {
    const h = s.holdWidth ?? DEFAULT_HOLD_WIDTH;
    raw.push({
      id: `hold${i + 1}`,
      label: `屏${i + 1}停留`,
      width: h,
      description: `${s.name} 稳定显示`,
      kind: 'hold',
      fromScreen: i,
      toScreen: i,
    });
    total += h;

    if (i < screens.length - 1) {
      const t = s.transitionWidth ?? DEFAULT_TRANSITION_WIDTH;
      raw.push({
        id: `trans${i + 1}to${i + 2}`,
        label: `屏${i + 1}→${i + 2}过场`,
        width: t,
        description: `过渡:${s.name} → ${screens[i + 1].name}`,
        kind: 'trans',
        fromScreen: i,
        toScreen: i + 1,
      });
      total += t;
    }
  });

  const out: RhythmSegment[] = [];
  let cursor = 0;
  for (const r of raw) {
    const w = r.width / total;
    out.push({ ...r, width: w, start: cursor, end: cursor + w });
    cursor += w;
  }
  if (out.length > 0) out[out.length - 1].end = 1; // 防浮点漂移
  return out;
}

export const SCROLL_RHYTHM_SEGMENTS: readonly RhythmSegment[] = buildSegments(SCREENS);

/** 滚动总距离:屏数越多,留给阅读和过场的距离越长 */
export const SCROLL_CONTROL_PAGES = Math.max(5, Math.round(SCREENS.length * 1.5));

function findSegmentById(id: string) {
  return SCROLL_RHYTHM_SEGMENTS.find((s) => s.id === id);
}

/** 向后兼容:保留原 3 屏 keys 的访问入口 */
export const RHYTHM_CONFIG = {
  hold1: { start: findSegmentById('hold1')?.start ?? 0, end: findSegmentById('hold1')?.end ?? 0 },
  trans1to2: { start: findSegmentById('trans1to2')?.start ?? 0, end: findSegmentById('trans1to2')?.end ?? 0 },
  hold2: { start: findSegmentById('hold2')?.start ?? 0, end: findSegmentById('hold2')?.end ?? 0 },
  trans2to3: { start: findSegmentById('trans2to3')?.start ?? 0, end: findSegmentById('trans2to3')?.end ?? 0 },
  hold3: { start: findSegmentById('hold3')?.start ?? 0, end: findSegmentById('hold3')?.end ?? 0 },
} as const;

const OFF_BOTTOM_VH = 100;
const OFF_TOP_VH = -100;

export const MOON_HOLD1 = { positionX: -5, positionY: -13, sizePx: 680, sizeVh: 0, opacity: 1 };
export const MOON_HOLD2 = { positionX: 32, positionY: -32, sizePx: 200, sizeVh: 0, opacity: 1 };
export const MOON_HOLD3 = { positionX: 0, positionY: 0, sizePx: 0, sizeVh: 200, opacity: 1 };

export const SCREEN3_AMBIENT_BG = '#ede1c0';

export type MoonState = typeof MOON_HOLD1;
export type RhythmPhase = 'hold' | 'transition';

export type RhythmState = {
  phase: RhythmPhase;
  activeScreenIndex: number;
  i0: number;
  i1: number;
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

function lerpMoon(a: MoonState, b: MoonState, t: number): MoonState {
  return {
    positionX: THREE.MathUtils.lerp(a.positionX, b.positionX, t),
    positionY: THREE.MathUtils.lerp(a.positionY, b.positionY, t),
    sizePx: THREE.MathUtils.lerp(a.sizePx, b.sizePx, t),
    sizeVh: THREE.MathUtils.lerp(a.sizeVh, b.sizeVh, t),
    opacity: THREE.MathUtils.lerp(a.opacity, b.opacity, t),
  };
}

export function getRhythmSegmentAt(scrollOffset: number): RhythmSegment {
  const o = clamp01(scrollOffset);
  const segs = SCROLL_RHYTHM_SEGMENTS;
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (o < seg.end || (i === segs.length - 1 && o <= seg.end)) return seg;
  }
  return segs[segs.length - 1];
}

export function getRhythmState(scrollOffset: number): RhythmState {
  const seg = getRhythmSegmentAt(scrollOffset);
  if (seg.kind === 'hold') {
    return { phase: 'hold', activeScreenIndex: seg.fromScreen, i0: seg.fromScreen, i1: seg.fromScreen, t: 0 };
  }
  const t = easeInOutCubic(segmentLocal(scrollOffset, seg.start, seg.end));
  // 过场中文案归属上一屏(切完才换)
  return { phase: 'transition', activeScreenIndex: seg.fromScreen, i0: seg.fromScreen, i1: seg.toScreen, t };
}

export function getTextScrollYVh(screenIndex: number, scrollOffset: number): number {
  const segs = SCROLL_RHYTHM_SEGMENTS;
  const o = clamp01(scrollOffset);

  const holdIdx = segs.findIndex((s) => s.kind === 'hold' && s.fromScreen === screenIndex);
  if (holdIdx === -1) return 0;
  const hold = segs[holdIdx];
  const prevTrans = holdIdx > 0 ? segs[holdIdx - 1] : null;
  const nextTrans = holdIdx < segs.length - 1 ? segs[holdIdx + 1] : null;

  if (prevTrans && o < prevTrans.start) return OFF_BOTTOM_VH;
  if (prevTrans && o < prevTrans.end) {
    const t = easeInOutCubic(segmentLocal(o, prevTrans.start, prevTrans.end));
    return THREE.MathUtils.lerp(OFF_BOTTOM_VH, 0, t);
  }
  if (o < hold.end) return 0;
  if (nextTrans && o < nextTrans.end) {
    const t = easeInOutCubic(segmentLocal(o, nextTrans.start, nextTrans.end));
    return THREE.MathUtils.lerp(0, OFF_TOP_VH, t);
  }
  return OFF_TOP_VH;
}

export function getMoonState(scrollOffset: number, inspectMode: boolean): MoonState {
  if (inspectMode) return { ...MOON_HOLD2, opacity: 0 };

  const seg = getRhythmSegmentAt(scrollOffset);
  const fromMoon = SCREENS[seg.fromScreen]?.moonState ?? HIDDEN_MOON_FALLBACK;
  const toMoon = SCREENS[seg.toScreen]?.moonState ?? HIDDEN_MOON_FALLBACK;

  if (seg.kind === 'hold') return fromMoon;

  const t = easeInOutCubic(segmentLocal(scrollOffset, seg.start, seg.end));
  return lerpMoon(fromMoon, toMoon, t);
}

export function getPageAmbientBgMix(scrollOffset: number): number {
  const seg = getRhythmSegmentAt(scrollOffset);
  const fromWarm = SCREENS[seg.fromScreen]?.bgMode === 'warm' ? 1 : 0;
  const toWarm = SCREENS[seg.toScreen]?.bgMode === 'warm' ? 1 : 0;

  if (seg.kind === 'hold') return fromWarm;

  const t = easeInOutCubic(segmentLocal(scrollOffset, seg.start, seg.end));
  return THREE.MathUtils.lerp(fromWarm, toWarm, t);
}

/** Canvas 在"暖色屏"hold 期铺暖色;过场期间需透明以露出 DOM 月亮 */
export function isScreen3CanvasWarmHold(scrollOffset: number): boolean {
  const seg = getRhythmSegmentAt(scrollOffset);
  return seg.kind === 'hold' && SCREENS[seg.fromScreen]?.bgMode === 'warm';
}

export function shouldCanvasBeTransparent(scrollOffset: number, inspectMode: boolean): boolean {
  if (inspectMode) return false;
  if (getIntroScreenFade(scrollOffset, false) > 0.02) return true;
  return !isScreen3CanvasWarmHold(scrollOffset);
}

export function getMoonGlowMix(scrollOffset: number): number {
  return 1 - getPageAmbientBgMix(scrollOffset);
}

export function getIntroScreenFade(scrollOffset: number, inspectMode: boolean): number {
  if (inspectMode) return 0;
  const { i0, i1, t } = getRhythmState(scrollOffset);
  if (i0 === 0 && i1 === 0) return 1;
  if (i0 === 0 && i1 === 1) return 1 - t;
  return 0;
}
