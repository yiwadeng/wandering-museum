'use client';

import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, type CSSProperties } from 'react';
import { SCREENS, TOTAL_SCREENS, type ScreenText } from '@/lib/screens';

function placementStyle(placement: ScreenText['placement']): CSSProperties {
  const base: CSSProperties = {
    position: 'fixed',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 1.5,
    pointerEvents: 'none',
    zIndex: 1000,
  };
  if (placement === 'below-model') {
    return {
      ...base,
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: 'min(92vw, 40rem)',
    };
  }
  if (placement === 'model-right') {
    return {
      ...base,
      right: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      maxWidth: 'min(42vw, 22rem)',
    };
  }
  return {
    ...base,
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    maxWidth: 'min(42vw, 22rem)',
  };
}

/** 在 ScrollControls 内使用；根据滚动段更新当前屏索引(与模型插值的 i0 一致) */
export function ScrollTextActiveSync({ onActiveIndex }: { onActiveIndex: (index: number) => void }) {
  const scroll = useScroll();
  const lastRef = useRef(-1);

  useFrame(() => {
    const n = TOTAL_SCREENS;
    const span = Math.max(1, n - 1);
    const u = scroll.offset * span;
    const idx = Math.min(Math.floor(u), n - 1);
    if (idx !== lastRef.current) {
      lastRef.current = idx;
      onActiveIndex(idx);
    }
  });

  return null;
}

/** 渲染在 Canvas 外；仅 HTML */
export function ScreenTextLayer({ activeScreenIndex }: { activeScreenIndex: number }) {
  const screen = SCREENS[activeScreenIndex];
  const text = screen?.text;
  if (!text) return null;

  return (
    <div style={placementStyle(text.placement)}>
      <div style={{ marginBottom: 8 }}>{text.title}</div>
      {text.subtitle ? <div style={{ marginBottom: 8 }}>{text.subtitle}</div> : null}
      {text.lines?.map((line, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          {line}
        </div>
      ))}
      {text.body ? <div style={{ marginBottom: text.smallPrint ? 8 : 0 }}>{text.body}</div> : null}
      {text.smallPrint ? <div style={{ fontSize: 14 }}>{text.smallPrint}</div> : null}
      {text.carouselPlaceholder ? (
        <div style={{ marginTop: 24 }}>{text.carouselPlaceholder}</div>
      ) : null}
    </div>
  );
}
