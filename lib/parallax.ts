/**
 * 视差:在现有动画之上叠加按 scroll 比例的 Y 偏移(不替代节奏编排)。
 *
 * 何时用:
 * - ✅ 自由装饰、无精确滚动终点的演员(竹叶、云、雾) → 声明一层即可
 * - ❌ scrollRhythm 精确编排的元素(月亮位移/扩大、模型走位) → 1:1 跟 scroll,不参与视差
 *
 * 当前接入: 文字 foreground 1.2x · 模型 main 1.0x(基准,偏移≈0)
 * 明确豁免: 月亮 — 仅用 getMoonState,见 IntroMoonLayer
 *
 * 主体(1.0x)=基准;远景更慢(正 Y)、前景更快(负 Y)。
 */
export const PARALLAX_LAYERS = {
  extremeFar: 0.1,
  far: 0.15,
  mid: 0.6,
  main: 1.0,
  foreground: 1.2,
} as const;

export type ParallaxLayer = keyof typeof PARALLAX_LAYERS;

/** scroll 0→1 时最大视差幅度(vh),刻意偏轻 */
export const PARALLAX_STRENGTH_VH = 10;

/** 3D 主体层等效世界单位 Y */
export const PARALLAX_STRENGTH_WORLD = 0.18;

function clamp01(x: number) {
  return Math.min(1, Math.max(0, Number.isFinite(x) ? x : 0));
}

/** 叠加 Y 偏移(vh):负=上移更快(前景),正=上移更慢(远景) */
export function getParallaxOffsetVh(
  scrollOffset: number,
  layer: ParallaxLayer,
  disabled = false,
): number {
  if (disabled) return 0;
  const t = clamp01(scrollOffset);
  const speed = PARALLAX_LAYERS[layer];
  return -t * PARALLAX_STRENGTH_VH * (speed - PARALLAX_LAYERS.main);
}

export function getParallaxOffsetWorld(
  scrollOffset: number,
  layer: ParallaxLayer,
  disabled = false,
): number {
  if (disabled) return 0;
  const t = clamp01(scrollOffset);
  const speed = PARALLAX_LAYERS[layer];
  return -t * PARALLAX_STRENGTH_WORLD * (speed - PARALLAX_LAYERS.main);
}
