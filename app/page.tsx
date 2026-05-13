'use client';

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

const ZINC_900 = "#18181b";

function RotatingCube() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}

export default function Home() {
  return (
    <div className="fixed inset-0 h-screen w-screen">
      <Canvas className="h-full w-full" camera={{ position: [2.8, 1.8, 2.8], fov: 45 }}>
        <color attach="background" args={[ZINC_900]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 4]} intensity={1.25} />
        <RotatingCube />
      </Canvas>
    </div>
  );
}
