'use client';

import ArtifactViewer from '@/components/ArtifactViewer';

export default function Home() {
  return (
    <div className="fixed inset-0 h-screen w-screen">
      <ArtifactViewer
        modelUrl="/models/watermoon_test.glb"
        scale={0.2}
        // ⚠️ 临时值:占位模型的朝向补丁。正式模型在 Blender 扶正后,此行可删除。
        rotation={[0.55, 0.05, -0.35]}
        hdriPreset="sunset"
      />
    </div>
  );
}
