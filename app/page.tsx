'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import type { Group } from 'three';

/** Slightly lifted from pure black so the scene reads brighter around the model */
const SCENE_BG = '#27272a';

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
      <Canvas
        className="h-full w-full"
        camera={{ position: [2.8, 1.8, 2.8], fov: 45 }}
        gl={{ toneMappingExposure: 1.15 }}
      >
        <color attach="background" args={[SCENE_BG]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#f4f4f5', '#3f3f46', 0.45]} />
        <directionalLight position={[4, 8, 5]} intensity={1.6} />
        <Suspense
          fallback={
            <Html center>
              <p className="select-none text-sm text-zinc-400">加载中…</p>
            </Html>
          }
        >
          <WatermoonModel scale={1} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
