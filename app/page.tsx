'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import type { Group } from 'three';

/** Slightly lifted from pure black so the scene reads brighter around the model */
const SCENE_BG = '#27272a';

const MODEL_URL = '/models/watermoon_test.glb';

function WatermoonModel({ scale = 0.2 }: { scale?: number }) {
  const { scene } = useGLTF(MODEL_URL);
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.55, 0.05, -0.35]}>
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
          <WatermoonModel scale={0.2} />
          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls
          // 水平旋转范围：左右各 75°，防止用户拖到背面破洞
          minAzimuthAngle={-Math.PI / 2.4}
          maxAzimuthAngle={Math.PI / 2.4}

          // 垂直角度范围：不让从正上方俯视、不让从正下方仰视
          minPolarAngle={Math.PI / 4} // 最多斜上方俯视，看不到模型头顶
          maxPolarAngle={Math.PI / 1.8} // 略低于水平，看不到底座下方

          // 关掉平移，避免用户拖飞整个画面
          enablePan={false}

          // 顺滑阻尼，拖完有惯性滑行，不戛然而止
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
