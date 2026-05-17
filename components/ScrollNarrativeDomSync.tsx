'use client';

import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import type { MoonDomRefs } from '@/components/narrativeDomRefs';
import {
  buildTextBlockTransform,
  TEXT_LAYOUT,
  Z_TEXT_INSPECT,
  Z_TEXT_NARRATIVE,
} from '@/components/screenTextDom';
import { NIGHT_BASE } from '@/lib/introScroll';
import { getParallaxOffsetVh } from '@/lib/parallax';
import {
  getIntroScreenFade,
  getMoonGlowMix,
  getMoonState,
  getPageAmbientBgMix,
  getRhythmState,
  getTextScrollYVh,
  SCREEN3_AMBIENT_BG,
} from '@/lib/scrollRhythm';
import { SCREENS } from '@/lib/screens';

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

function moonSizeCss(moon: { sizePx: number; sizeVh: number }) {
  if (moon.sizeVh > 0 && moon.sizePx > 0) return `max(${moon.sizePx}px, ${moon.sizeVh}vh)`;
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

function updateMoonDom(refs: MoonDomRefs, offset: number, inspectMode: boolean) {
  const bgMix = inspectMode ? 0 : getPageAmbientBgMix(offset);
  const skyFade = getIntroScreenFade(offset, inspectMode);
  const moon = getMoonState(offset, inspectMode);
  const glowMix = inspectMode ? 0 : getMoonGlowMix(offset);
  const activeScreenIndex = getRhythmState(offset).activeScreenIndex;
  const moonStyle = SCREENS[activeScreenIndex]?.moonStyle ?? 'solid';

  const ambient = refs.ambient.current;
  if (ambient) {
    if (bgMix > 0.01) {
      ambient.style.display = 'block';
      ambient.style.background =
        bgMix >= 0.99 ? SCREEN3_AMBIENT_BG : lerpHex(NIGHT_BASE, SCREEN3_AMBIENT_BG, bgMix);
    } else {
      ambient.style.display = 'none';
    }
  }

  const introSky = refs.introSky.current;
  if (introSky) {
    if (skyFade > 0.01) {
      introSky.style.display = 'block';
      introSky.style.opacity = String(skyFade);
    } else {
      introSky.style.display = 'none';
    }
  }

  const moonEl = refs.moon.current;
  if (moonEl) {
    if (moon.opacity > 0.01) {
      moonEl.style.display = 'block';
      moonEl.style.left = `${50 + moon.positionX}%`;
      moonEl.style.top = `${50 + moon.positionY}%`;
      moonEl.style.width = moonSizeCss(moon);
      moonEl.style.height = moonSizeCss(moon);
      moonEl.style.opacity = String(moon.opacity);
      moonEl.style.boxShadow = moonStyle === 'particle' ? 'none' : moonGlowBoxShadow(glowMix);
      moonEl.dataset.moonStyle = moonStyle;
    } else {
      moonEl.style.display = 'none';
    }
  }
}

function updateTextDom(
  blockRefs: RefObject<HTMLDivElement | null>[],
  offset: number,
  inspectMode: boolean,
) {
  const z = inspectMode ? String(Z_TEXT_INSPECT) : String(Z_TEXT_NARRATIVE);
  SCREENS.forEach((screen, i) => {
    const el = blockRefs[i]?.current;
    if (!el || !screen.text) return;
    const layout = TEXT_LAYOUT[screen.id] ?? { offsetX: 0, offsetY: 0, scale: 1 };
    const scrollYVh = getTextScrollYVh(i, offset);
    const parallaxVh = getParallaxOffsetVh(offset, 'foreground', inspectMode);
    el.style.zIndex = z;
    el.style.transform = buildTextBlockTransform(
      screen.text.placement,
      layout,
      scrollYVh,
      parallaxVh,
    );
  });
}

/** 在 ScrollControls 内:每帧 scroll.offset → 直接写月亮/文字 DOM */
export function ScrollNarrativeDomSync({
  moonRefs,
  textBlockRefs,
  inspectMode,
}: {
  moonRefs: MoonDomRefs;
  textBlockRefs: RefObject<HTMLDivElement | null>[];
  inspectMode: boolean;
}) {
  const scroll = useScroll();
  const inspectRef = useRef(inspectMode);
  inspectRef.current = inspectMode;

  useFrame(() => {
    const offset = scroll.offset;
    updateMoonDom(moonRefs, offset, inspectRef.current);
    updateTextDom(textBlockRefs, offset, inspectRef.current);
  });

  return null;
}
