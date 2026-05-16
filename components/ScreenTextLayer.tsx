'use client';

import type { CSSProperties, RefObject } from 'react';
import { SCREENS, type Screen, type ScreenText } from '@/lib/screens';
import {
  buildTextBlockTransform,
  TEXT_LAYOUT,
  Z_TEXT_INSPECT,
  Z_TEXT_NARRATIVE,
} from '@/components/screenTextDom';

const TEXT_COLOR = '#faf9f6';

const TYPE = {
  body: { fontSize: '1rem', lineHeight: 1.65, fontWeight: 400 },
  meta: { fontSize: '0.85rem', lineHeight: 1.45, fontWeight: 400 },
  lead: { fontSize: '1.3rem', lineHeight: 1.5, fontWeight: 400 },
  title: { fontSize: '2.25rem', lineHeight: 1.2, fontWeight: 600 },
} as const;

const TYPE_AT_EASE = {
  body: { fontSize: '2rem', lineHeight: 1.65, fontWeight: 400, color: '#1a1a2e' },
  meta: { fontSize: '1.7rem', lineHeight: 1.45, fontWeight: 400, color: '#1a1a2e' },
  lead: { fontSize: '2.6rem', lineHeight: 1.5, fontWeight: 400, color: '#1a1a2e' },
  title: { fontSize: '4.5rem', lineHeight: 1.2, fontWeight: 600, color: '#1a1a2e' },
} as const;

function blockShellStyle(
  placement: ScreenText['placement'],
  screenId: string,
  inspectMode: boolean,
): CSSProperties {
  const layout = TEXT_LAYOUT[screenId] ?? { offsetX: 0, offsetY: 0, scale: 1 };
  const base: CSSProperties = {
    position: 'fixed',
    padding: '0.75rem 1rem',
    color: screenId === 'at-ease' ? '#1a1a2e' : TEXT_COLOR,
    pointerEvents: 'none',
    zIndex: inspectMode ? Z_TEXT_INSPECT : Z_TEXT_NARRATIVE,
    transform: buildTextBlockTransform(placement, layout, 0, 0),
  };
  if (placement === 'below-model') {
    return {
      ...base,
      bottom: '1.5rem',
      left: '50%',
      transformOrigin: '50% 100%',
      maxWidth: 'min(92vw, 40rem)',
    };
  }
  if (placement === 'model-right') {
    return {
      ...base,
      right: '1rem',
      top: '50%',
      transformOrigin: '100% 50%',
      maxWidth: 'min(42vw, 22rem)',
    };
  }
  return {
    ...base,
    left: '1rem',
    top: '50%',
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

/** 静态 DOM 壳;transform 由 ScrollNarrativeDomSync 每帧写入 */
export function ScreenTextLayer({
  blockRefs,
  inspectMode = false,
}: {
  blockRefs: RefObject<HTMLDivElement | null>[];
  inspectMode?: boolean;
}) {
  return (
    <>
      {SCREENS.map((screen, i) => {
        const text = screen.text;
        if (!text) return null;
        return (
          <div
            key={screen.id}
            ref={blockRefs[i]}
            style={blockShellStyle(text.placement, screen.id, inspectMode)}
          >
            <ScreenTextContent screen={screen} />
          </div>
        );
      })}
    </>
  );
}
