'use client';

import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SCREENS, TOTAL_SCREENS } from '@/lib/screens';

export function ScrollDebugger() {
  const scroll = useScroll();
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useFrame(() => {
    const progress = scroll.offset * TOTAL_SCREENS;
    const idx = Math.min(TOTAL_SCREENS - 1, Math.max(0, Math.floor(progress)));
    const name = SCREENS[idx]?.name ?? '—';
    if (line1Ref.current) {
      line1Ref.current.textContent = `进度: ${progress.toFixed(2)}`;
    }
    if (line2Ref.current) {
      line2Ref.current.textContent = `当前屏: [${name}]`;
    }
  });

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 99999,
        pointerEvents: 'none',
        padding: '8px 12px',
        borderRadius: 6,
        background: 'rgba(0, 0, 0, 0.55)',
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        lineHeight: 1.5,
      }}
    >
      <div ref={line1Ref}>进度: …</div>
      <div ref={line2Ref}>当前屏: […]</div>
    </div>,
    document.body,
  );
}
