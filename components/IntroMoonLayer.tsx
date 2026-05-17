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

/* 月面背景 ——
   水墨晕染风格的月相阴影：
   1) 3 块"墨斑"，使用近黑的中性色（不是暖棕），靠明度差区分而非色相差
   2) 极淡的噪点，只破除数字感，不参与造型
   3) 月面基底保持温润亮度，让暗斑有足够反差 */
const MOON_BACKGROUND =
  "radial-gradient(ellipse 32% 24% at 60% 30%, rgba(24, 18, 12, 0.48) 0%, rgba(40, 32, 22, 0.22) 45%, transparent 78%)," +
  "radial-gradient(ellipse 18% 14% at 36% 52%, rgba(24, 18, 12, 0.36) 0%, transparent 70%)," +
  "radial-gradient(ellipse 36% 15% at 48% 72%, rgba(28, 22, 16, 0.28) 0%, transparent 72%)," +
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>" +
  "<feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0 0.32  0 0 0 0.25 0'/></filter>" +
  "<rect width='100%' height='100%' filter='url(%23n)' opacity='0.3'/></svg>\")," +
  " radial-gradient(circle at 42% 38%, #f4e8c4 0%, #e8d6ad 36%, #d4c08e 72%, #b39d70 100%)";

/* 月晕 —— 四层 box-shadow，由内向外逐级融入夜色，每层透明度递减 */
const MOON_HALO = [
  '0 0  60px   8px rgba(232, 217, 184, 0.24)',
  '0 0 130px  32px rgba(232, 217, 184, 0.14)',
  '0 0 240px  80px rgba(232, 217, 184, 0.07)',
  '0 0 380px 140px rgba(232, 217, 184, 0.035)',
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
          backgroundBlendMode: 'normal, normal, normal, soft-light, normal',
          boxShadow: MOON_HALO,
          zIndex: Z_MOON,
          display: 'none',
        }}
      />
    </>
  );
}
