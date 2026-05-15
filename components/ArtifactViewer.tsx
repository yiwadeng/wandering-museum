'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import {
  Center,
  Environment,
  Html,
  OrbitControls,
  ScrollControls,
  useGLTF,
  useScroll,
} from '@react-three/drei';
import { Suspense, useCallback, useEffect, useRef, useState, type ComponentProps } from 'react';
import * as THREE from 'three';
import type { Group } from 'three';

import { ScrollDebuggerPanel, ScrollDebuggerSync } from '@/components/ScrollDebugger';
import { ScreenTextLayer, ScrollTextActiveSync } from '@/components/ScreenTextLayer';
import { getScreenLayout, SCREENS, TOTAL_SCREENS } from '@/lib/screens';

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
  /** 查看 3D 模式:单 Canvas 内暂停滚动走位、自由轨道;由 page 传入 */
  inspectMode?: boolean;
};

function visibility01(s: { modelVisible?: boolean }) {
  return s.modelVisible === false ? 0 : 1;
}

function WatermoonModel({
  modelUrl,
  rotation,
  animation,
  rotationSpeed,
  inspectMode,
  inspectScale,
}: {
  modelUrl: string;
  rotation: [number, number, number];
  animation: ArtifactViewerAnimation;
  rotationSpeed: number;
  inspectMode: boolean;
  inspectScale: number;
}) {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef<Group>(null);
  const scroll = useScroll();

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    if (inspectMode) {
      const breatheY = animation === 'breathe' ? Math.sin(state.clock.elapsedTime * 1.5) * 0.05 : 0;
      g.position.set(0, breatheY, 0);
      g.rotation.set(rotation[0], rotation[1], rotation[2]);
      if (animation === 'rotate') {
        g.rotation.y += delta * rotationSpeed;
      }
      g.scale.setScalar(inspectScale);
      return;
    }

    const n = TOTAL_SCREENS;
    if (n < 1) return;
    const maxIdx = n - 1;
    const span = Math.max(1, maxIdx);
    const rawU = scroll.offset * span;
    const u = THREE.MathUtils.clamp(Number.isFinite(rawU) ? rawU : 0, 0, span);
    const i0 = THREE.MathUtils.clamp(Math.floor(u), 0, maxIdx);
    const i1 = Math.min(i0 + 1, maxIdx);
    const t = i0 === i1 ? 0 : THREE.MathUtils.clamp(u - i0, 0, 1);

    const a = getScreenLayout(SCREENS[i0]);
    const b = getScreenLayout(SCREENS[i1]);

    const px = THREE.MathUtils.lerp(a.position[0], b.position[0], t);
    const py = THREE.MathUtils.lerp(a.position[1], b.position[1], t);
    const pz = THREE.MathUtils.lerp(a.position[2], b.position[2], t);
    const sc = THREE.MathUtils.lerp(a.scale, b.scale, t);
    const rx = THREE.MathUtils.lerp(a.rotation[0], b.rotation[0], t);
    const ry = THREE.MathUtils.lerp(a.rotation[1], b.rotation[1], t);
    const rz = THREE.MathUtils.lerp(a.rotation[2], b.rotation[2], t);
    const vis = THREE.MathUtils.lerp(visibility01(a), visibility01(b), t);

    const breatheY = animation === 'breathe' ? Math.sin(state.clock.elapsedTime * 1.5) * 0.05 : 0;

    g.position.x = px;
    g.position.y = py + breatheY;
    g.position.z = pz;

    g.rotation.set(rotation[0] + rx, rotation[1] + ry, rotation[2] + rz);
    if (animation === 'rotate') {
      g.rotation.y += delta * rotationSpeed;
    }

    g.scale.setScalar(sc * vis);
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} />
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
  inspectMode = false,
}: ArtifactViewerProps) {
  const scrollDbgLine1Ref = useRef<HTMLDivElement>(null);
  const scrollDbgLine2Ref = useRef<HTMLDivElement>(null);
  const [activeTextScreen, setActiveTextScreen] = useState(0);
  const onActiveTextScreen = useCallback((i: number) => {
    setActiveTextScreen(i);
  }, []);

  useEffect(() => {
    void useGLTF.preload(modelUrl);
  }, [modelUrl]);

  return (
    <>
      <ScrollDebuggerPanel line1Ref={scrollDbgLine1Ref} line2Ref={scrollDbgLine2Ref} />
      <ScreenTextLayer activeScreenIndex={activeTextScreen} inspectMode={inspectMode} />
      {/* 叙事 z=100 低于文字 1000；查看3D z=800 高于遮罩 500、低于 ✕ 1200 */}
      <div
        className="relative h-full w-full"
        style={{ zIndex: inspectMode ? 800 : 100 }}
      >
        <Canvas
          className="h-full w-full"
          camera={{ position: [2.8, 1.8, 2.8], fov: 45 }}
          gl={{ toneMappingExposure: 1.15 }}
        >
        <ScrollControls pages={TOTAL_SCREENS} damping={0.25}>
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
            <WatermoonModel
              modelUrl={modelUrl}
              rotation={rotation}
              animation={animation}
              rotationSpeed={rotationSpeed}
              inspectMode={inspectMode}
              inspectScale={scale}
            />
            <Environment preset={hdriPreset as NonNullable<ComponentProps<typeof Environment>['preset']>} />
          </Suspense>
          <ScrollDebuggerSync line1Ref={scrollDbgLine1Ref} line2Ref={scrollDbgLine2Ref} />
          <ScrollTextActiveSync onActiveIndex={onActiveTextScreen} />
          <OrbitControls
            makeDefault
            // 叙事模式:编排阶段临时解除角度限制,定稿后恢复下方注释
            // 水平旋转范围：左右各 75°，防止用户拖到背面破洞
            // minAzimuthAngle={cameraLimits.azimuth.min}
            // maxAzimuthAngle={cameraLimits.azimuth.max}
            // 垂直角度范围：不让从正上方俯视、不让从正下方仰视
            // minPolarAngle={cameraLimits.polar.min} // 最多斜上方俯视，看不到模型头顶
            // maxPolarAngle={cameraLimits.polar.max} // 略低于水平，看不到底座下方
            enablePan={inspectMode}
            enableZoom={inspectMode}
            enableDamping
            dampingFactor={0.05}
          />
        </ScrollControls>
        </Canvas>
      </div>
    </>
  );
}
