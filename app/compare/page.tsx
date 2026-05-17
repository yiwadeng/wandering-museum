'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

type ViewerProps = {
  modelUrl: string;
  label: string;
  size: string;
};

function Model({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl, true);

  return <primitive object={scene} scale={0.2} />;
}

function CompareViewer({ modelUrl, label, size }: ViewerProps) {
  return (
    <section className="relative h-full w-full">
      <div
        className="pointer-events-none absolute left-4 top-4 z-10 rounded bg-black/45 px-3 py-2 text-white"
        style={{ fontSize: 14 }}
      >
        {label} · {size}
      </div>
      <Canvas camera={{ position: [0, 0, 5], fov: 35 }}>
        <color attach="background" args={['#0a0b1a']} />
        <ambientLight intensity={0.3} />
        <Suspense fallback={null}>
          <Model modelUrl={modelUrl} />
          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </section>
  );
}

export default function ComparePage() {
  return (
    <main className="fixed inset-0 grid grid-cols-2 bg-[#0a0b1a]">
      <CompareViewer modelUrl="/models/watermoon_jianmian_final.glb" label="原版" size="16MB" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px bg-zinc-600" />
      <CompareViewer modelUrl="/models/watermoon_draco_hq.glb" label="Draco 高精度" size="10.67 MB" />
    </main>
  );
}
