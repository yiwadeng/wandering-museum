'use client';

import type { CSSProperties } from 'react';
import type { MoonDomRefs } from '@/components/narrativeDomRefs';

/** 温润米白圆月（外部仍可引用） */
export const INTRO_MOON_COLOR = '#f4ead5';

/** 屏 1 径向夜空 —— 略偏暖，避免纯冷蓝的"科技感" */
export const INTRO_SKY_GRADIENT =
  'radial-gradient(ellipse 90% 80% at 50% 42%, #14223e 0%, #0c1830 38%, #060e1e 70%, #02050c 100%)';

const Z_PAGE_AMBIENT = 5;
const Z_INTRO_SKY    = 20;
const Z_WATER        = 25; // 在天与月之间
const Z_MOON         = 30;

const layerBase: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
};

const MOON_BACKGROUND =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>" +
  "<feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0.6 0'/></filter>" +
  "<rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")," +
  ' radial-gradient(circle at 44% 40%, #faf1dc 0%, #f4ead5 38%, #ead9b7 72%, #d4c79f 100%)';

/* 月晕 —— 四层 box-shadow，由内向外逐级融入夜色，每层透明度递减 */
const MOON_HALO = [
  '0 0  60px   8px rgba(244, 234, 213, 0.28)',
  '0 0 130px  32px rgba(244, 234, 213, 0.17)',
  '0 0 240px  80px rgba(244, 234, 213, 0.085)',
  '0 0 380px 140px rgba(244, 234, 213, 0.04)',
].join(', ');

/** 静态 DOM 壳；尺寸/位置由 ScrollNarrativeDomSync 每帧写入 */
export function IntroMoonLayer({ refs }: { refs: MoonDomRefs }) {
  return (
    <>
      <div
        ref={refs.ambient}
        aria-hidden
        style={{ ...layerBase, inset: 0, zIndex: Z_PAGE_AMBIENT, display: 'none' }}
      />
      <div
        ref={refs.introSky}
        aria-hidden
        style={{
          ...layerBase,
          inset: 0,
          zIndex: Z_INTRO_SKY,
          background: INTRO_SKY_GRADIENT,
          display: 'none',
        }}
      />

      {/*
        ── 水面雾气 ──────────────────────────────────────────
        TODO（接入 sync）：
          1. 在 narrativeDomRefs.ts 的 MoonDomRefs 加 water: RefObject<HTMLDivElement | null>
          2. 在 ScrollNarrativeDomSync 中跟随 introSky 的可见度淡入淡出
        当前为简化版：跟 IntroMoonLayer 同生命周期，display 默认 block。
      */}
      <div
        aria-hidden
        className="water-mist"
        style={{
          ...layerBase,
          left: 0,
          right: 0,
          bottom: 0,
          height: '38vh',
          zIndex: Z_WATER,
        }}
      />

      <div
        ref={refs.moon}
        aria-hidden
        style={{
          ...layerBase,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: MOON_BACKGROUND,
          backgroundBlendMode: 'soft-light, normal',
          boxShadow: MOON_HALO,
          zIndex: Z_MOON,
          display: 'none',
        }}
      />
    </>
  );
}
