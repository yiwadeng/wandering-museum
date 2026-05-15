'use client';

import { useCallback, useState } from 'react';
import ArtifactViewer from '@/components/ArtifactViewer';
import { Model3DViewer } from '@/components/Model3DViewer';

const MODEL_URL = '/models/watermoon_test.glb';
const MODEL_ROTATION: [number, number, number] = [0.55, 0.05, -0.35];

export default function Home() {
  const [inspectMode, setInspectMode] = useState(false);
  const openInspect = useCallback(() => setInspectMode(true), []);
  const closeInspect = useCallback(() => setInspectMode(false), []);

  return (
    <div className="fixed inset-0 h-screen w-screen">
      <ArtifactViewer
        modelUrl={MODEL_URL}
        scale={0.2}
        inspectMode={inspectMode}
        // ⚠️ 临时值:占位模型的朝向补丁。正式模型在 Blender 扶正后,此行可删除。
        rotation={MODEL_ROTATION}
        hdriPreset="sunset"
      />
      {!inspectMode ? (
        <button
          type="button"
          onClick={openInspect}
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 9998,
            padding: '10px 14px',
            fontSize: 14,
            cursor: 'pointer',
            border: '1px solid #666',
            borderRadius: 4,
            background: '#2a2a2e',
            color: '#fafafa',
          }}
        >
          查看 3D 模型
        </button>
      ) : null}
      <Model3DViewer isOpen={inspectMode} onClose={closeInspect} />
    </div>
  );
}
