import * as THREE from 'three';
import { TOTAL_SCREENS } from '@/lib/screens';

/** 全详情页夜色底 */
export const NIGHT_BASE = '#0a1428';

/** 屏 1 专属层(月亮/径向光)可见度:1=全显,0=滚离 intro */
export function getIntroScreenFade(scrollOffset: number, inspectMode: boolean): number {
  if (inspectMode) return 0;
  const n = TOTAL_SCREENS;
  if (n < 1) return 0;
  const maxIdx = n - 1;
  const span = Math.max(1, maxIdx);
  const rawU = scrollOffset * span;
  const u = THREE.MathUtils.clamp(Number.isFinite(rawU) ? rawU : 0, 0, span);
  const i0 = THREE.MathUtils.clamp(Math.floor(u), 0, maxIdx);
  const i1 = Math.min(i0 + 1, maxIdx);
  const t = i0 === i1 ? 0 : THREE.MathUtils.clamp(u - i0, 0, 1);
  return i0 === 0 ? (i1 === 0 ? 1 : 1 - t) : 0;
}
