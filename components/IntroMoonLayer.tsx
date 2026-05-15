'use client';

import { NIGHT_BASE } from '@/lib/introScroll';
import {
  getIntroScreenFade,
  getMoonGlowMix,
  getMoonState,
  getPageAmbientBgMix,
  SCREEN3_AMBIENT_BG,
} from '@/lib/scrollRhythm';

/** 温润米白圆月 */
export const INTRO_MOON_COLOR = '#f4ead5';

/** 屏 1 径向夜空(与原先 Canvas 纹理一致) */
const INTRO_SKY_GRADIENT =
  'radial-gradient(ellipse 85% 78% at 50% 38%, #101d38 0%, #0a1428 42%, #060d18 72%, #020508 100%)';

/** 叙事层级(底→顶):页底/暖月环境 5 → 屏1夜空 20 → 月亮 30 → Canvas 100 → 文字 1000 */
const Z_PAGE_AMBIENT = 5;
const Z_INTRO_SKY = 20;
const Z_MOON = 30;

function moonSizeCss(moon: { sizePx: number; sizeVh: number }) {
  if (moon.sizeVh > 0 && moon.sizePx > 0) {
    return `max(${moon.sizePx}px, ${moon.sizeVh}vh)`;
  }
  if (moon.sizeVh > 0) return `${moon.sizeVh}vh`;
  return `${moon.sizePx}px`;
}

function moonGlowBoxShadow(glowMix: number): string {
  if (glowMix <= 0.02) return 'none';
  const m = glowMix;
  return [
    `0 0 ${2.5 * m}rem rgba(244, 234, 213, ${0.9 * m})`,
    `0 0 ${5 * m}rem rgba(244, 234, 213, ${0.5 * m})`,
    `0 0 ${9 * m}rem rgba(244, 234, 213, ${0.22 * m})`,
    `0 0 ${14 * m}rem rgba(244, 234, 213, ${0.08 * m})`,
  ].join(', ');
}

function lerpHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [r0, g0, b0] = parse(a);
  const [r1, g1, b1] = parse(b);
  const u = Math.min(1, Math.max(0, t));
  const r = Math.round(r0 + (r1 - r0) * u);
  const g = Math.round(g0 + (g1 - g0) * u);
  const bl = Math.round(b0 + (b1 - b0) * u);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** 2D 屏 1 夜空光 + 圆月:不参与视差,位置/大小仅由 scrollRhythm 驱动 */
export function IntroMoonLayer({
  scrollOffset,
  inspectMode,
}: {
  scrollOffset: number;
  inspectMode: boolean;
}) {
  const skyFade = getIntroScreenFade(scrollOffset, inspectMode);
  const moon = getMoonState(scrollOffset, inspectMode);
  const bgMix = inspectMode ? 0 : getPageAmbientBgMix(scrollOffset);
  const glowMix = inspectMode ? 0 : getMoonGlowMix(scrollOffset);
  const ambientBg =
    bgMix >= 0.99 ? SCREEN3_AMBIENT_BG : lerpHex(NIGHT_BASE, SCREEN3_AMBIENT_BG, bgMix);
  const sizeCss = moonSizeCss(moon);

  return (
    <>
      {bgMix > 0.01 ? (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: Z_PAGE_AMBIENT,
            background: ambientBg,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {skyFade > 0.01 ? (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: Z_INTRO_SKY,
            background: INTRO_SKY_GRADIENT,
            opacity: skyFade,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {moon.opacity > 0.01 ? (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            left: `${50 + moon.positionX}%`,
            top: `${50 + moon.positionY}%`,
            width: sizeCss,
            height: sizeCss,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: INTRO_MOON_COLOR,
            pointerEvents: 'none',
            zIndex: Z_MOON,
            opacity: moon.opacity,
            boxShadow: moonGlowBoxShadow(glowMix),
          }}
        />
      ) : null}
    </>
  );
}
