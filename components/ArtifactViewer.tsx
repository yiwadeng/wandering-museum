'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useRef, type ComponentProps } from 'react';
import type { Group } from 'three';

/** Slightly lifted from pure black so the scene reads brighter around the model */
const SCENE_BG = '#27272a';

export type ArtifactViewerAnimation = 'breathe' | 'rotate' | 'static';

export type ArtifactViewerCameraLimits = {
  azimuth: { min: number; max: number };
  polar: { min: number; max: number };
};

const DEFAULT_CAMERA_LIMITS: ArtifactViewerCameraLimits = {
  azimuth: { min: -Math.PI / 2.4, max: Math.PI / 2.4 },
  polar: { min: Math.PI / 4, max: Math.PI / 1.8 },
};

export type ArtifactViewerProps = {
  modelUrl: string;
  scale?: number;
  rotation?: [number, number, number];
  hdriPreset?: string;
  animation?: ArtifactViewerAnimation;
  rotationSpeed?: number;
  cameraLimits?: ArtifactViewerCameraLimits;
};

function ArtifactModel({
  modelUrl,
  scale,
  rotation,
  animation,
  rotationSpeed,
}: {
  modelUrl: string;
  scale: number;
  rotation: [number, number, number];
  animation: ArtifactViewerAnimation;
  rotationSpeed: number;
}) {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    if (animation === 'breathe') {
      g.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    } else if (animation === 'rotate') {
      g.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} rotation={rotation}>
      <Center>
        <primitive object={scene} scale={scale} />
      </Center>
    </group>
  );
}

export default function ArtifactViewer({
  modelUrl,
  scale = 1,
  rotation = [0, 0, 0],
  hdriPreset = 'studio',
  animation = 'breathe',
  rotationSpeed = 0.25,
  cameraLimits = DEFAULT_CAMERA_LIMITS,
}: ArtifactViewerProps) {
  useEffect(() => {
    void useGLTF.preload(modelUrl);
  }, [modelUrl]);

  return (
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
        <ArtifactModel
          modelUrl={modelUrl}
          scale={scale}
          rotation={rotation}
          animation={animation}
          rotationSpeed={rotationSpeed}
        />
        <Environment preset={hdriPreset as NonNullable<ComponentProps<typeof Environment>['preset']>} />
      </Suspense>
      <OrbitControls
        // 水平旋转范围：左右各 75°，防止用户拖到背面破洞
        minAzimuthAngle={cameraLimits.azimuth.min}
        maxAzimuthAngle={cameraLimits.azimuth.max}
        // 垂直角度范围：不让从正上方俯视、不让从正下方仰视
        minPolarAngle={cameraLimits.polar.min} // 最多斜上方俯视，看不到模型头顶
        maxPolarAngle={cameraLimits.polar.max} // 略低于水平，看不到底座下方
        // 关掉平移，避免用户拖飞整个画面
        enablePan={false}
        // 顺滑阻尼，拖完有惯性滑行，不戛然而止
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
