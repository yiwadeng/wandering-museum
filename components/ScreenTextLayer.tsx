'use client';

import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, type CSSProperties } from 'react';
import { getParallaxOffsetVh } from '@/lib/parallax';
import { getTextScrollYVh } from '@/lib/scrollRhythm';
import { SCREENS, type Screen, type ScreenText } from '@/lib/screens';

/** 叙事:文字在 Canvas 上。查看3D:文字 < 遮罩(500) < Canvas(800) < ✕(1200) */
const Z_TEXT_NARRATIVE = 1000;
const Z_TEXT_INSPECT = 200;

const TEXT_COLOR = '#faf9f6';
/** 屏 3 暖月背景上的深色字 */
const TEXT_COLOR_SCREEN3 = '#1a1a2e';

/** 字号阶梯(rem):正文 1 → 信息/小字 ~0.85 → 题记/诗句 ~1.3 → 标题 ~2.25 */
const TYPE = {
  body: { fontSize: '1rem', lineHeight: 1.65, fontWeight: 400 },
  meta: { fontSize: '0.85rem', lineHeight: 1.45, fontWeight: 400 },
  lead: { fontSize: '1.3rem', lineHeight: 1.5, fontWeight: 400 },
  title: { fontSize: '2.25rem', lineHeight: 1.2, fontWeight: 600 },
} as const;

/** 屏 3 基础字号 ×2;字色写进 TYPE 避免被 body 浅色继承盖住 */
const TYPE_AT_EASE = {
  body: { fontSize: '2rem', lineHeight: 1.65, fontWeight: 400, color: TEXT_COLOR_SCREEN3 },
  meta: { fontSize: '1.7rem', lineHeight: 1.45, fontWeight: 400, color: TEXT_COLOR_SCREEN3 },
  lead: { fontSize: '2.6rem', lineHeight: 1.5, fontWeight: 400, color: TEXT_COLOR_SCREEN3 },
  title: { fontSize: '4.5rem', lineHeight: 1.2, fontWeight: 600, color: TEXT_COLOR_SCREEN3 },
} as const;

type TextLayout = { offsetX: number; offsetY: number; scale: number };

const TEXT_LAYOUT: Record<string, TextLayout> = {
  intro: { offsetX: -400, offsetY: -30, scale: 0.85 },
  'dongfang-guanyin': { offsetX: -400, offsetY: -210, scale: 1.05 },
  'at-ease': { offsetX: 400, offsetY: 30, scale: 1 },
};

const DEFAULT_TEXT_LAYOUT: TextLayout = { offsetX: 0, offsetY: 0, scale: 1 };

function placementStyle(
  placement: ScreenText['placement'],
  inspectMode: boolean,
  layout: TextLayout,
  scrollYVh: number,
  parallaxVh: number,
  screenId: string,
): CSSProperties {
  const { offsetX, offsetY, scale } = layout;
  const y = `${scrollYVh + parallaxVh}vh`;
  const base: CSSProperties = {
    position: 'fixed',
    padding: '0.75rem 1rem',
    color: screenId === 'at-ease' ? TEXT_COLOR_SCREEN3 : TEXT_COLOR,
    pointerEvents: 'none',
    zIndex: inspectMode ? Z_TEXT_INSPECT : Z_TEXT_NARRATIVE,
  };
  if (placement === 'below-model') {
    return {
      ...base,
      bottom: '1.5rem',
      left: '50%',
      transform: `translate(calc(-50% + ${offsetX}px), calc(${offsetY}px + ${y})) scale(${scale})`,
      transformOrigin: '50% 100%',
      maxWidth: 'min(92vw, 40rem)',
    };
  }
  if (placement === 'model-right') {
    return {
      ...base,
      right: '1rem',
      top: '50%',
      transform: `translate(${offsetX}px, calc(-50% + ${offsetY}px + ${y})) scale(${scale})`,
      transformOrigin: '100% 50%',
      maxWidth: 'min(42vw, 22rem)',
    };
  }
  return {
    ...base,
    left: '1rem',
    top: '50%',
    transform: `translate(${offsetX}px, calc(-50% + ${offsetY}px + ${y})) scale(${scale})`,
    transformOrigin: '0% 50%',
    maxWidth: 'min(42vw, 22rem)',
  };
}

function IntroTextBlock({ text }: { text: ScreenText }) {
  return (
    <>
      <h1 style={{ ...TYPE.title, margin: '0 0 0.75rem' }}>{text.title}</h1>
      {text.lines?.map((line, i) => (
        <p key={i} style={{ ...TYPE.meta, margin: '0 0 0.25rem' }}>
          {line}
        </p>
      ))}
      {text.body ? (
        <p style={{ ...TYPE.body, margin: '0.75rem 0 0' }}>{text.body}</p>
      ) : null}
      {text.carouselPlaceholder ? (
        <p style={{ ...TYPE.meta, marginTop: '1.5rem', opacity: 0.7 }}>{text.carouselPlaceholder}</p>
      ) : null}
    </>
  );
}

function DongfangTextBlock({ text }: { text: ScreenText }) {
  return (
    <>
      <h1 style={{ ...TYPE.title, margin: '0 0 0.75rem' }}>{text.title}</h1>
      {text.body ? <p style={{ ...TYPE.body, margin: 0 }}>{text.body}</p> : null}
      {text.smallPrint ? (
        <p style={{ ...TYPE.lead, margin: '1.25rem 0 0' }}>{text.smallPrint}</p>
      ) : null}
      {text.carouselPlaceholder ? (
        <p style={{ ...TYPE.meta, marginTop: '1.5rem', opacity: 0.7 }}>{text.carouselPlaceholder}</p>
      ) : null}
    </>
  );
}

function AtEaseTextBlock({ text }: { text: ScreenText }) {
  return (
    <>
      <h1 style={{ ...TYPE_AT_EASE.title, margin: '0 0 0.5rem' }}>{text.title}</h1>
      {text.subtitle ? (
        <p style={{ ...TYPE_AT_EASE.lead, margin: '0 0 0.75rem' }}>{text.subtitle}</p>
      ) : null}
      {text.body ? <p style={{ ...TYPE_AT_EASE.body, margin: 0 }}>{text.body}</p> : null}
    </>
  );
}

function ScreenTextContent({ screen }: { screen: Screen }) {
  const text = screen.text;
  if (!text) return null;
  if (screen.id === 'intro') return <IntroTextBlock text={text} />;
  if (screen.id === 'dongfang-guanyin') return <DongfangTextBlock text={text} />;
  if (screen.id === 'at-ease') return <AtEaseTextBlock text={text} />;
  return (
    <>
      <h1 style={{ ...TYPE.title, margin: '0 0 0.75rem' }}>{text.title}</h1>
      {text.subtitle ? <p style={{ ...TYPE.lead, margin: '0 0 0.75rem' }}>{text.subtitle}</p> : null}
      {text.lines?.map((line, i) => (
        <p key={i} style={{ ...TYPE.body, marginBottom: '0.5rem' }}>
          {line}
        </p>
      ))}
      {text.body ? <p style={{ ...TYPE.body, margin: 0 }}>{text.body}</p> : null}
      {text.smallPrint ? <p style={{ ...TYPE.lead, marginTop: '1rem' }}>{text.smallPrint}</p> : null}
    </>
  );
}

/** 在 ScrollControls 内同步 scroll.offset → 叙事 DOM */
export function ScrollOffsetSync({ onOffset }: { onOffset: (offset: number) => void }) {
  const scroll = useScroll();
  const onOffsetRef = useRef(onOffset);
  onOffsetRef.current = onOffset;

  useFrame(() => {
    onOffsetRef.current(scroll.offset);
  });

  return null;
}

/** 渲染在 Canvas 外；三段文字同时挂载,由 translateY(vh) 卷轴位移 */
export function ScreenTextLayer({
  scrollOffset,
  inspectMode = false,
}: {
  scrollOffset: number;
  inspectMode?: boolean;
}) {
  return (
    <>
      {SCREENS.map((screen, i) => {
        const text = screen.text;
        if (!text) return null;
        const layout = TEXT_LAYOUT[screen.id] ?? DEFAULT_TEXT_LAYOUT;
        const scrollYVh = getTextScrollYVh(i, scrollOffset);
        const parallaxVh = getParallaxOffsetVh(scrollOffset, 'foreground', inspectMode);
        return (
          <div
            key={screen.id}
            style={placementStyle(text.placement, inspectMode, layout, scrollYVh, parallaxVh, screen.id)}
          >
            <ScreenTextContent screen={screen} />
          </div>
        );
      })}
    </>
  );
}
