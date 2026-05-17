import type { ScreenText } from '@/lib/screens';

export const Z_TEXT_NARRATIVE = 1000;
export const Z_TEXT_INSPECT = 200;

export type TextLayout = { offsetX: number; offsetY: number; scale: number };

export const TEXT_LAYOUT: Record<string, TextLayout> = {
  intro: { offsetX: -400, offsetY: -30, scale: 0.85 },
  'dongfang-guanyin': { offsetX: -400, offsetY: -210, scale: 1.05 },
  'at-ease': { offsetX: 400, offsetY: 30, scale: 1 },
};

export function buildTextBlockTransform(
  placement: ScreenText['placement'],
  layout: TextLayout,
  scrollYVh: number,
  parallaxVh: number,
): string {
  const { offsetX, offsetY, scale } = layout;
  const y = `${scrollYVh + parallaxVh}vh`;
  if (placement === 'below-model') {
    return `translate(calc(-50% + ${offsetX}px), calc(${offsetY}px + ${y})) scale(${scale})`;
  }
  if (placement === 'model-right') {
    return `translate(0, calc(${offsetY}px + ${y})) scale(${scale})`;
  }
  return `translate(0, calc(${offsetY}px + ${y})) scale(${scale})`;
}
