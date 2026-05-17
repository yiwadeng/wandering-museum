'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { SCREENS } from '@/lib/screens';
import { type MoonState, getRhythmState, SCROLL_RHYTHM_SEGMENTS } from '@/lib/scrollRhythm';

const bridge: {
  currentScreenIndex: number;
  scrollToScreen: ((index: number) => void) | null;
} = {
  currentScreenIndex: 0,
  scrollToScreen: null,
};

/** Canvas 内 sync:发布当前屏索引 + 提供 scrollToScreen */
export function DirectorModeSync() {
  const scroll = useScroll();
  useFrame(() => {
    bridge.currentScreenIndex = getRhythmState(scroll.offset).activeScreenIndex;
    if (!bridge.scrollToScreen) {
      bridge.scrollToScreen = (index: number) => {
        const holdSeg = SCROLL_RHYTHM_SEGMENTS.find(
          (s) => s.kind === 'hold' && s.fromScreen === index,
        );
        if (!holdSeg) return;
        const el = scroll.el;
        if (!el) return;
        const mid = (holdSeg.start + holdSeg.end) / 2;
        const target = mid * (el.scrollHeight - el.clientHeight);
        el.scrollTo({ top: target, behavior: 'smooth' });
      };
    }
  });
  return null;
}

/** DOM 面板:按 D 开关 */
export function DirectorMode() {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(0);
  const [, force] = useState(0);
  const reRender = () => force((v) => v + 1);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'd') {
        setOpen((v) => {
          const willOpen = !v;
          if (willOpen) setEditIndex(bridge.currentScreenIndex);
          return willOpen;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) {
    return (
      <div className="pointer-events-none fixed left-4 top-4 z-[2000] select-none text-[10px] text-white/30">
        按 D 进入编辑模式
      </div>
    );
  }

  const screen = SCREENS[editIndex];
  if (!screen) return null;
  const m = screen.moonState;

  const updateDesktop = (patch: Partial<typeof screen.desktop>) => {
    SCREENS[editIndex] = { ...screen, desktop: { ...screen.desktop, ...patch } };
    reRender();
  };
  const setPosition = (i: 0 | 1 | 2, v: number) => {
    const arr: [number, number, number] = [...screen.desktop.position];
    arr[i] = v;
    updateDesktop({ position: arr });
  };
  const setRotation = (i: 0 | 1 | 2, v: number) => {
    const arr: [number, number, number] = [...screen.desktop.rotation];
    arr[i] = v;
    updateDesktop({ rotation: arr });
  };

  const updateMoon = (patch: Partial<MoonState>) => {
    const base = m ?? { positionX: 0, positionY: 0, sizePx: 300, sizeVh: 0, opacity: 1 };
    SCREENS[editIndex] = { ...screen, moonState: { ...base, ...patch } };
    reRender();
  };
  const toggleMoon = () => {
    if (m) SCREENS[editIndex] = { ...screen, moonState: undefined };
    else SCREENS[editIndex] = {
      ...screen,
      moonState: { positionX: 0, positionY: 0, sizePx: 300, sizeVh: 0, opacity: 1 },
    };
    reRender();
  };
  const toggleBg = () => {
    SCREENS[editIndex] = { ...screen, bgMode: screen.bgMode === 'warm' ? 'dark' : 'warm' };
    reRender();
  };

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(SCREENS.length - 1, i));
    setEditIndex(clamped);
    bridge.scrollToScreen?.(clamped);
  };

  const copyCode = () => {
    const s = SCREENS[editIndex];
    const moonLine = s.moonState
      ? `moonState: { positionX: ${s.moonState.positionX}, positionY: ${s.moonState.positionY}, sizePx: ${s.moonState.sizePx}, sizeVh: ${s.moonState.sizeVh}, opacity: ${s.moonState.opacity} },`
      : `// moonState: undefined (该屏月亮隐藏)`;
    const code = `// 屏 ${editIndex + 1}: ${s.name} (${s.id}) — 粘贴到 lib/screens.ts 对应屏的字段
desktop: { position: [${s.desktop.position.map((n) => n.toFixed(2)).join(', ')}], scale: ${s.desktop.scale.toFixed(2)}, rotation: [${s.desktop.rotation.map((n) => n.toFixed(2)).join(', ')}] },
${moonLine}
bgMode: '${s.bgMode ?? 'dark'}',`;
    navigator.clipboard.writeText(code).catch(() => {});
  };

  return (
    <div className="pointer-events-auto fixed right-4 top-4 z-[2000] flex max-h-[90vh] w-80 select-none flex-col gap-3 overflow-y-auto rounded bg-zinc-900/95 p-4 text-xs text-zinc-100 shadow-lg">
      <div className="flex items-center justify-between">
        <strong className="text-sm">Director Mode</strong>
        <button type="button" onClick={() => setOpen(false)} className="rounded px-2 py-0.5 text-zinc-400 hover:bg-zinc-800">✕</button>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={() => goTo(editIndex - 1)} className="rounded bg-zinc-700 px-2 py-1 hover:bg-zinc-600">←</button>
        <div className="flex-1 text-center text-[11px]">
          屏 {editIndex + 1} / {SCREENS.length}<br />
          <span className="text-zinc-400">{screen.name}</span>
        </div>
        <button type="button" onClick={() => goTo(editIndex + 1)} className="rounded bg-zinc-700 px-2 py-1 hover:bg-zinc-600">→</button>
      </div>

      <Section title="模型 Model">
        <div className="flex gap-2">
          <button type="button" onClick={() => updateDesktop({ position: [0, 0, 0] })} className="rounded bg-zinc-700 px-2 py-1 text-[11px] hover:bg-zinc-600">归零 position</button>
          <button type="button" onClick={() => updateDesktop({ rotation: [0, 0, 0] })} className="rounded bg-zinc-700 px-2 py-1 text-[11px] hover:bg-zinc-600">归零 rotation</button>
        </div>
        <Slider label="position.x" min={-3} max={3} step={0.05} value={screen.desktop.position[0]} onChange={(v) => setPosition(0, v)} />
        <Slider label="position.y" min={-3} max={3} step={0.05} value={screen.desktop.position[1]} onChange={(v) => setPosition(1, v)} />
        <Slider label="position.z" min={-3} max={3} step={0.05} value={screen.desktop.position[2]} onChange={(v) => setPosition(2, v)} />
        <Slider label="rotation.x" min={-3.14} max={3.14} step={0.02} value={screen.desktop.rotation[0]} onChange={(v) => setRotation(0, v)} />
        <Slider label="rotation.y" min={-3.14} max={3.14} step={0.02} value={screen.desktop.rotation[1]} onChange={(v) => setRotation(1, v)} />
        <Slider label="rotation.z" min={-3.14} max={3.14} step={0.02} value={screen.desktop.rotation[2]} onChange={(v) => setRotation(2, v)} />
        <Slider label="scale" min={0.01} max={1} step={0.01} value={screen.desktop.scale} onChange={(v) => updateDesktop({ scale: v })} />
      </Section>

      <Section title="月亮 Moon">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">状态: {m ? '可见' : '隐藏'}</span>
          <button type="button" onClick={toggleMoon} className="rounded bg-zinc-700 px-2 py-0.5 hover:bg-zinc-600">
            {m ? '隐藏' : '显示'}
          </button>
        </div>
        {m && (
          <>
            <Slider label="positionX" min={-100} max={100} step={1} value={m.positionX} onChange={(v) => updateMoon({ positionX: v })} />
            <Slider label="positionY" min={-100} max={100} step={1} value={m.positionY} onChange={(v) => updateMoon({ positionY: v })} />
            <Slider label="sizePx" min={0} max={1000} step={10} value={m.sizePx} onChange={(v) => updateMoon({ sizePx: v })} />
            <Slider label="sizeVh" min={0} max={300} step={5} value={m.sizeVh} onChange={(v) => updateMoon({ sizeVh: v })} />
            <Slider label="opacity" min={0} max={1} step={0.05} value={m.opacity} onChange={(v) => updateMoon({ opacity: v })} />
          </>
        )}
      </Section>

      <Section title="背景 Background">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">当前: {screen.bgMode ?? 'dark'}</span>
          <button type="button" onClick={toggleBg} className="rounded bg-zinc-700 px-2 py-0.5 hover:bg-zinc-600">切换</button>
        </div>
      </Section>

      <button type="button" onClick={copyCode} className="mt-2 rounded bg-emerald-600 px-3 py-2 font-medium hover:bg-emerald-700">
        复制本屏代码到剪贴板
      </button>

      <p className="text-[10px] text-zinc-500">
        粘贴到 lib/screens.ts 对应屏的字段位置,然后 commit。再按 D 退出。
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t border-zinc-700 pt-2">
      <strong className="text-[10px] uppercase tracking-wide text-zinc-400">{title}</strong>
      {children}
    </div>
  );
}

function Slider({
  label, min, max, step, value, onChange,
}: {
  label: string; min: number; max: number; step: number; value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px]">
      <span className="w-20 shrink-0 text-zinc-400">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-emerald-500"
      />
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => {
          if (Number.isNaN(e.target.valueAsNumber)) return;
          onChange(e.target.valueAsNumber);
        }}
        className="w-14 shrink-0 rounded bg-zinc-800 px-1 text-right tabular-nums"
      />
    </label>
  );
}
