'use client';

import { useEffect } from 'react';

type Model3DViewerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Z_BACKDROP = 500;
const Z_CHROME = 1200;

/**
 * 「查看 3D」仅 DOM:遮罩盖住叙事文字、在 Canvas 之下;✕/提示最顶。
 * 与 ScreenTextLayer / Canvas 约定:文字叙事1000/查看200,遮罩500,Canvas叙事100/查看800,Chrome1200。
 */
export function Model3DViewer({ isOpen, onClose }: Model3DViewerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: Z_BACKDROP,
          background: 'rgba(0, 0, 0, 0.72)',
          pointerEvents: 'none',
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="3D 模型查看"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: Z_CHROME,
          pointerEvents: 'none',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 44,
            height: 44,
            border: 'none',
            borderRadius: 4,
            background: '#333',
            color: '#fff',
            fontSize: 22,
            lineHeight: 1,
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          ✕
        </button>
        <p
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            margin: 0,
            padding: '6px 12px',
            fontSize: 13,
            color: '#e5e5e5',
            pointerEvents: 'auto',
          }}
        >
          拖动旋转 · 滚轮缩放 · 右键平移
        </p>
      </div>
    </>
  );
}
