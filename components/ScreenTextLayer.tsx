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
      position: 'absolute',
      right: '6vw',
      top: '28vh',
      transformOrigin: '100% 0%',
      maxWidth: '26vw',
      textAlign: 'left',
    };
  }
  return {
    ...base,
    left: '6vw',
    top: '28vh',
    transformOrigin: '0% 0%',
    maxWidth: '30vw',
    textAlign: 'left',
  };
}

/** 解析【XX】value 形式的元信息行；不匹配则原样返回 */
function parseLabeledLine(line: string): { label: string | null; value: string } {
  const m = line.match(/^【(.+?)】\s*[:：]?\s*(.+)$/);
  return m ? { label: m[1], value: m[2] } : { label: null, value: line };
}

const SERIF =
  '"Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "宋体", serif';

function IntroTextBlock({ text }: { text: ScreenText }) {
  return (
    <div style={{ fontFamily: SERIF }}>
      {/* 引文 —— 一句话立气场。如果不想要，删掉这个 <p> 即可。 */}
      <p
        style={{
          fontSize: 11,
          color: 'rgba(250, 249, 246, 0.42)',
          letterSpacing: '0.32em',
          margin: '0 0 36px',
          fontWeight: 300,
        }}
      >
        千 江 有 水 千 江 月
      </p>

      <h1
        style={{
          fontFamily: SERIF,
          fontSize: 34,
          fontWeight: 500,
          letterSpacing: '0.06em',
          lineHeight: 1.5,
          color: '#faf9f6',
          margin: '0 0 16px',
        }}
      >
        {text.title}
      </h1>

      {/* 朱砂细线 —— 整页唯一的彩色元素，要够细够短 */}
      <span
        aria-hidden
        style={{
          display: 'block',
          width: 28,
          height: 1,
          background: '#a13b2e',
          margin: '0 0 32px',
        }}
      />

      {text.lines ? (
        <div style={{ margin: '0 0 32px', display: 'grid', rowGap: 12 }}>
          {text.lines.map((line, i) => {
            const { label, value } = parseLabeledLine(line);
            if (!label) {
              return (
                <p
                  key={i}
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'rgba(250, 249, 246, 0.78)',
                    lineHeight: 1.9,
                    letterSpacing: '0.02em',
                  }}
                >
                  {value}
                </p>
              );
            }
            return (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3.5em 1fr',
                  columnGap: 16,
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(250, 249, 246, 0.42)',
                    letterSpacing: '0.22em',
                    fontWeight: 300,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: 'rgba(250, 249, 246, 0.86)',
                    letterSpacing: '0.02em',
                    lineHeight: 1.7,
                  }}
                >
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {text.body ? (
        <p
          style={{
            fontSize: 14,
            color: 'rgba(250, 249, 246, 0.78)',
            lineHeight: 2.05,
            letterSpacing: '0.04em',
            margin: 0,
            textAlign: 'justify',
          }}
        >
          {text.body}
        </p>
      ) : null}

      {text.carouselPlaceholder ? (
        <p style={{ ...TYPE.meta, marginTop: '1.5rem', opacity: 0.7 }}>{text.carouselPlaceholder}</p>
      ) : null}
    </div>
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
