'use client';

import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { getRhythmState } from '@/lib/scrollRhythm';
import { SCREENS } from '@/lib/screens';

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
    const { phase, activeScreenIndex, i0, i1, t } = getRhythmState(scroll.offset);
    const name = SCREENS[activeScreenIndex]?.name ?? '—';
    const phaseLabel = phase === 'hold' ? '停留' : `过场 ${i0 + 1}→${i1 + 1} (${(t * 100).toFixed(0)}%)`;
    if (line1Ref.current) {
      line1Ref.current.textContent = `scroll: ${(scroll.offset * 100).toFixed(1)}% · ${phaseLabel}`;
    }
    if (line2Ref.current) {
      line2Ref.current.textContent = `当前屏: [${name}]`;
    }
  });

  return null;
}
