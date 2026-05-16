'use client';

import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import Lenis from 'lenis';
import { useEffect, useRef } from 'react';

/**
 * 输入归一化:Lenis 接管 ScrollControls 的 DOM 滚动容器,
 * 将 Mac 触控板/妙控鼠标的非线性 wheel 转为较线性的 scrollTop。
 * ScrollControls 仍负责 scrollTop → offset 映射与 damping。
 */
export function LenisScrollBridge({ enabled = true }: { enabled?: boolean }) {
  const scroll = useScroll();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      wrapper: scroll.el,
      content: scroll.fill,
      eventsTarget: scroll.el,
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.15,
      autoRaf: false,
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled, scroll.el, scroll.fill]);

  useFrame((state) => {
    if (!enabled) return;
    lenisRef.current?.raf(state.clock.elapsedTime * 1000);
  });

  return null;
}
