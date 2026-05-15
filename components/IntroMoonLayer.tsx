'use client';

import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, type CSSProperties } from 'react';
import { getIntroScreenFade } from '@/lib/introScroll';

/** 温润米白圆月 */
export const INTRO_MOON_COLOR = '#f4ead5';

/** 2D 月亮位置/大小(相对屏幕中心,单位 %) */
const MOON_POSITION_X = -5;
const MOON_POSITION_Y = -13;
const MOON_SIZE_PX = 680;

/** 屏 1 径向夜空(与原先 Canvas 纹理一致) */
const INTRO_SKY_GRADIENT =
  'radial-gradient(ellipse 85% 78% at 50% 38%, #101d38 0%, #0a1428 42%, #060d18 72%, #020508 100%)';

const Z_INTRO_SKY = 20;
const Z_MOON = 30;

const MOON_GLOW_SHADOW = [
  '0 0 2.5rem rgba(244, 234, 213, 0.9)',
  '0 0 5rem rgba(244, 234, 213, 0.5)',
  '0 0 9rem rgba(244, 234, 213, 0.22)',
  '0 0 14rem rgba(244, 234, 213, 0.08)',
].join(', ');

function moonDiscStyle(opacity: number): CSSProperties {
  return {
    position: 'fixed',
    left: `${50 + MOON_POSITION_X}%`,
    top: `${50 + MOON_POSITION_Y}%`,
    width: MOON_SIZE_PX,
    height: MOON_SIZE_PX,
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    background: INTRO_MOON_COLOR,
    pointerEvents: 'none',
    zIndex: Z_MOON,
    opacity,
    boxShadow: MOON_GLOW_SHADOW,
  };
}

/** 在 ScrollControls 内同步 intro 淡出进度 */
export function IntroFadeSync({ onFade }: { onFade: (fade: number) => void }) {
  const scroll = useScroll();
  const onFadeRef = useRef(onFade);
  onFadeRef.current = onFade;

  useFrame(() => {
    onFadeRef.current(getIntroScreenFade(scroll.offset, false));
  });

  return null;
}

/** 2D 屏 1 夜空光 + 圆月:固定在屏幕,不随 Orbit 旋转 */
export function IntroMoonLayer({
  fade,
  inspectMode,
}: {
  fade: number;
  inspectMode: boolean;
}) {
  const opacity = inspectMode ? 0 : fade;
  if (opacity <= 0.01) return null;

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: Z_INTRO_SKY,
          background: INTRO_SKY_GRADIENT,
          opacity,
          pointerEvents: 'none',
        }}
      />
      <div aria-hidden style={moonDiscStyle(opacity)} />
    </>
  );
}
