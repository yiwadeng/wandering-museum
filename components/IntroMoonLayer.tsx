'use client';

import type { CSSProperties } from 'react';
import type { MoonDomRefs } from '@/components/narrativeDomRefs';
import { ParticleMoon } from '@/components/ParticleMoon';

/** 温润米白圆月 */
export const INTRO_MOON_COLOR = '#f4ead5';

/** 屏 1 径向夜空(与原先 Canvas 纹理一致) */
export const INTRO_SKY_GRADIENT =
  'radial-gradient(ellipse 85% 78% at 50% 38%, #101d38 0%, #0a1428 42%, #060d18 72%, #020508 100%)';

const Z_PAGE_AMBIENT = 5;
const Z_INTRO_SKY = 20;
const Z_MOON = 30;

const layerBase: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
};

/** 静态 DOM 壳;样式由 ScrollNarrativeDomSync 每帧写入 */
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
      <div
        ref={refs.moon}
        aria-hidden
        style={{
          ...layerBase,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          zIndex: Z_MOON,
          display: 'none',
        }}
      >
        <div
          className="wm-solid-moon"
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: INTRO_MOON_COLOR }}
        />
        <div className="wm-particle-moon" style={{ width: '100%', height: '100%', display: 'none' }}>
          <ParticleMoon />
        </div>
      </div>
      <style>{`
        [data-moon-style='particle'] .wm-solid-moon { display: none; }
        [data-moon-style='particle'] .wm-particle-moon { display: block !important; }
      `}</style>
    </>
  );
}
