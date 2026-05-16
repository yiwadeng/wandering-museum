'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { SCREENS } from '@/lib/screens';
import { easeInOutCubic, getRhythmSegmentAt } from '@/lib/scrollRhythm';

const TARGET_SCREEN_ID = 'detail-labels';

function getOverlayOpacity(scrollOffset: number, targetIndex: number): number {
  const seg = getRhythmSegmentAt(scrollOffset);
  if (seg.kind === 'hold' && seg.fromScreen === targetIndex) return 1;
  if (seg.kind === 'trans') {
    const localT = easeInOutCubic((scrollOffset - seg.start) / Math.max(seg.end - seg.start, 1e-6));
    if (seg.toScreen === targetIndex) return localT;     // 切入目标屏:渐显
    if (seg.fromScreen === targetIndex) return 1 - localT; // 切出目标屏:渐隐
  }
  return 0;
}

export type DetailLabelsLayerHandle = { root: HTMLDivElement | null };

/** DOM 层:渲染 SVG 引线 + 标签;opacity 由 DetailLabelsSync 控制 */
export const DetailLabelsLayer = forwardRef<DetailLabelsLayerHandle>(
  function DetailLabelsLayer(_, ref) {
    const rootRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({ root: rootRef.current }), []);

    const targetScreen = SCREENS.find((s) => s.id === TARGET_SCREEN_ID);
    const labels = targetScreen?.labels ?? [];

    return (
      <div
        ref={rootRef}
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0, zIndex: 950, transition: 'opacity 80ms linear' }}
      >
        <svg className="absolute inset-0 h-full w-full">
          {labels.map((l) => (
            <g key={l.id}>
              <line
                x1={`${l.labelPos.x}%`}
                y1={`${l.labelPos.y}%`}
                x2={`${l.anchorPos.x}%`}
                y2={`${l.anchorPos.y}%`}
                stroke="rgba(255,255,255,0.55)"
                strokeWidth={1}
              />
              <circle cx={`${l.anchorPos.x}%`} cy={`${l.anchorPos.y}%`} r={2} fill="rgba(255,255,255,0.85)" />
            </g>
          ))}
        </svg>
        {labels.map((l) => (
          <div
            key={l.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 select-none text-xs tracking-wide text-white/85"
            style={{ left: `${l.labelPos.x}%`, top: `${l.labelPos.y}%` }}
          >
            {l.text}
          </div>
        ))}
      </div>
    );
  },
);

/** Three 层内组件:每帧同步 opacity + 相机锁定,必须放在 ScrollControls 内 */
export function DetailLabelsSync({
  layerRef,
  inspectMode,
}: {
  layerRef: React.RefObject<DetailLabelsLayerHandle | null>;
  inspectMode: boolean;
}) {
  const scroll = useScroll();
  const controls = useThree(
    (s) => s.controls,
  ) as unknown as { enableRotate: boolean } | null;

  // 退出 inspect 模式时,把相机重置回 Canvas 初始位置,避免保留 inspect 中旋转的角度
  useEffect(() => {
    if (inspectMode) return;
    const c = controls as unknown as { reset?: () => void } | null;
    c?.reset?.();
  }, [inspectMode, controls]);

  const targetIndex = SCREENS.findIndex((s) => s.id === TARGET_SCREEN_ID);

  useFrame(() => {
    const root = layerRef.current?.root;
    if (root) {
      const opacity = inspectMode ? 0 : getOverlayOpacity(scroll.offset, targetIndex);
      root.style.opacity = String(opacity);
    }

    // 相机锁定:当前屏 lockCamera === true 时禁用 OrbitControls 旋转
    if (controls) {
      const activeIndex = getRhythmSegmentAt(scroll.offset).fromScreen;
      const screenLocked = SCREENS[activeIndex]?.lockCamera === true;
      controls.enableRotate = inspectMode || !screenLocked;
    }
  });

  return null;
}
