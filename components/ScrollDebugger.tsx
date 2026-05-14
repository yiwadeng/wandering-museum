'use client';

import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { SCREENS, TOTAL_SCREENS } from '@/lib/screens';

export type ScrollDebuggerLineRefs = {
  line1Ref: RefObject<HTMLDivElement | null>;
  line2Ref: RefObject<HTMLDivElement | null>;
};

/** 挂在 document.body，必须在 <Canvas> 外渲染，避免 R3F 把 div 当 Three 节点。 */
export function ScrollDebuggerPanel({ line1Ref, line2Ref }: ScrollDebuggerLineRefs) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

/** 必须放在 ScrollControls 内；不向场景提交任何节点。 */
export function ScrollDebuggerSync({ line1Ref, line2Ref }: ScrollDebuggerLineRefs) {
  const scroll = useScroll();

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

  return null;
}
