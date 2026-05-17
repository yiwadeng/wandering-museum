'use client';

import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { SCREENS } from '@/lib/screens';
import { getMoonGlowMix, getMoonState, getRhythmState } from '@/lib/scrollRhythm';

type Stardust = { x: number; y: number; r: number; opacity: number };
type Mote = { left: number; size: number; duration: number; delay: number };

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function makeStardust(count: number): Stardust[] {
  const random = seededRandom(20260517);
  return Array.from({ length: count }, () => {
    const tier = random();
    const x = random() * 100;
    const y = random() * 100;
    if (tier < 0.7) return { x, y, r: 0.4 + random() * 0.4, opacity: 0.15 + random() * 0.25 };
    if (tier < 0.95) return { x, y, r: 0.8 + random() * 0.6, opacity: 0.4 + random() * 0.3 };
    return { x, y, r: 1.2 + random() * 0.8, opacity: 0.75 + random() * 0.25 };
  });
}

function makeMotes(count: number): Mote[] {
  const random = seededRandom(20260518);
  return Array.from({ length: count }, () => ({
    left: random() * 100,
    size: 2 + random() * 3,
    duration: 10 + random() * 6,
    delay: random() * 15,
  }));
}

export type AtmosphereLayerHandle = { glow: HTMLDivElement | null };

export const AtmosphereLayer = forwardRef<AtmosphereLayerHandle>(function AtmosphereLayer(_, ref) {
  const glowRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ glow: glowRef.current }), []);

  const stardust = useMemo(() => makeStardust(100), []);
  const motes = useMemo(() => makeMotes(10), []);

  return (
    <>
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 20 }}>
        {/* 月亮光晕:位置由 AtmosphereSync 实时同步 */}
        <div
          ref={glowRef}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: 0,
            height: 0,
            background: 'radial-gradient(circle, rgba(255,237,200,0.3) 0%, transparent 55%)',
            filter: 'blur(25px)',
            opacity: 0,
            transform: 'translate(-50%, -50%)',
            willChange: 'transform, width, height, opacity',
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 150 }}>
        {/* Vignette: 边缘暗角,视线集中 */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)',
          }}
        />

        {/* 远景星尘:分档明暗大小,给画面深度 */}
        <svg className="absolute inset-0 h-full w-full">
          {stardust.map((s, i) => (
            <circle
              key={i}
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={s.r}
              fill="rgba(255,255,255,0.85)"
              opacity={s.opacity}
            />
          ))}
        </svg>

        {/* 漂浮粒子:从屏底缓缓上升,像庙宇尘埃 / 香烟 */}
        {motes.map((m, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${m.left}%`,
              bottom: 0,
              width: `${m.size}px`,
              height: `${m.size}px`,
              background: 'rgba(255,237,200,0.75)',
              filter: 'blur(0.5px)',
              animation: `wm-mote-drift ${m.duration}s linear infinite`,
              animationDelay: `${m.delay}s`,
              animationFillMode: 'backwards',
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes wm-mote-drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-120vh) translateX(40px); opacity: 0; }
        }
      `}</style>
    </>
  );
});

/** Canvas 内 sync:每帧根据 getMoonState 更新月亮光晕的位置/尺寸/透明度 */
export function AtmosphereSync({
  layerRef,
}: {
  layerRef: React.RefObject<AtmosphereLayerHandle | null>;
}) {
  const scroll = useScroll();

  useFrame(() => {
    const glow = layerRef.current?.glow;
    if (!glow) return;

    const m = getMoonState(scroll.offset, false);
    const glowMix = getMoonGlowMix(scroll.offset);
    const { activeScreenIndex } = getRhythmState(scroll.offset);
    const isParticleMoon = SCREENS[activeScreenIndex]?.moonStyle === 'particle';

    // 月亮有效直径:sizeVh 优先,否则 sizePx
    const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
    const moonDiameter = m.sizeVh > 0 ? (m.sizeVh / 100) * vh : m.sizePx;
    const glowSize = moonDiameter * 1.15;

    glow.style.width = `${glowSize}px`;
    glow.style.height = `${glowSize}px`;
    glow.style.transform = `translate(-50%, -50%) translate(${m.positionX}vw, ${m.positionY}vh)`;
    // glowMix=1 暗色屏(显示光晕),glowMix=0 暖色屏(月亮就是环境,光晕隐藏)
    glow.style.opacity = isParticleMoon ? '0' : `${m.opacity * 0.4 * glowMix}`;
  });

  return null;
}
