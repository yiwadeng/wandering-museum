'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import type { Group } from 'three';

const ZINC_900 = '#18181b';

const MODEL_URL = '/models/watermoon_test.glb';

function WatermoonModel({ scale = 1 }: { scale?: number }) {
  const { scene } = useGLTF(MODEL_URL);
  const groupRef = useRef<Group>(null);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} scale={scale} />
      </Center>
    </group>
  );
}

useGLTF.preload(MODEL_URL);

export default function Home() {
  return (
    <div className="fixed inset-0 h-screen w-screen">
      <Canvas className="h-full w-full" camera={{ position: [2.8, 1.8, 2.8], fov: 45 }}>
        <color attach="background" args={[ZINC_900]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 4]} intensity={1.25} />
        <Suspense
          fallback={
            <Html center>
              <p className="select-none text-sm text-zinc-400">加载中…</p>
            </Html>
          }
        >
          <WatermoonModel scale={1} />
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
