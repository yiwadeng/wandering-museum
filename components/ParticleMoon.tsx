'use client';

import { useEffect, useRef } from 'react';

interface ParticleMoonProps {
  // 保持可配置参数,但默认值就调好
  clusterCount?: number;       // 云团数量,默认 55
  particleCount?: number;      // 主体粒子总数,默认 8500
  dispersionCount?: number;    // 月缘外散逸粒子数,默认 700
}

interface Cluster {
  x: number; y: number; radius: number; weight: number;
}

interface Particle {
  baseX: number; baseY: number;
  r: number;
  color: string;
  opacity: number;
  phaseA: number; phaseB: number;
  freqA: number; freqB: number;
  ampA: number; ampB: number;
}

const HUES_INNER = ['#fffaeb', '#fef5d8', '#fff2c8'];
const HUES_MID = ['#f8eccc', '#fef5d8', '#f5e8c8'];
const HUES_EDGE = ['#e8e0c4', '#f0e6cc', '#d6cdb0'];
const HUES_DISPERSION = ['#d8d0b8', '#e0d8c0', '#c8c0a8'];

function pickColor(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickColorByDist(normDist: number) {
  if (normDist < 0.4) return pickColor(HUES_INNER);
  if (normDist < 0.85) return pickColor(HUES_MID);
  return pickColor(HUES_EDGE);
}

function generateParticles(
  size: number,
  cx: number,
  cy: number,
  moonR: number,
  clusterCount: number,
  particleCount: number,
  dispersionCount: number,
  radiusScale: number,
): Particle[] {
  // 生成云团中心,全部在 moonR 内,30% 偏向边缘
  const clusters: Cluster[] = [];
  for (let i = 0; i < clusterCount; i++) {
    let dist: number;
    const tier = Math.random();
    if (tier < 0.30) {
      dist = Math.pow(Math.random(), 0.5) * moonR * 0.35;
    } else if (tier < 0.70) {
      dist = moonR * (0.35 + Math.random() * 0.40);
    } else {
      dist = moonR * (0.70 + Math.random() * 0.25);
    }
    const angle = Math.random() * Math.PI * 2;
    clusters.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      radius: 12 + Math.random() * 48,
      weight: 0.7 + Math.random() * 0.5,
    });
  }
  const totalWeight = clusters.reduce(
    (s, c) => s + c.weight * c.radius * c.radius, 0,
  );

  const particles: Particle[] = [];

  for (const cluster of clusters) {
    const share = (cluster.weight * cluster.radius * cluster.radius) / totalWeight;
    const cCount = Math.floor(particleCount * share);
    for (let i = 0; i < cCount; i++) {
      const u = Math.max(0.0001, Math.random());
      const v = Math.random();
      let radial = Math.abs(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v))
        * cluster.radius * 0.4;
      radial = Math.min(radial, cluster.radius * 1.3);
      const a = Math.random() * Math.PI * 2;
      const x = cluster.x + Math.cos(a) * radial;
      const y = cluster.y + Math.sin(a) * radial;

      const dx = x - cx;
      const dy = y - cy;
      const dFromMoon = Math.sqrt(dx * dx + dy * dy);
      const normDist = dFromMoon / moonR;

      let baseOpacity: number;
      if (normDist < 0.55) baseOpacity = 0.65 + Math.random() * 0.35;
      else if (normDist < 0.95) baseOpacity = 0.45 + Math.random() * 0.4;
      else baseOpacity = 0.15 + Math.random() * 0.35;

      const ampScale = normDist > 0.7 ? 0.4 : 1.0;

      particles.push({
        baseX: x, baseY: y,
        r: (0.2 + Math.random() * 0.7) * radiusScale,
        color: pickColorByDist(normDist),
        opacity: baseOpacity,
        phaseA: Math.random() * Math.PI * 2,
        phaseB: Math.random() * Math.PI * 2,
        freqA: 0.003 + Math.random() * 0.008,
        freqB: 0.002 + Math.random() * 0.007,
        ampA: (0.6 + Math.random() * 2.2) * ampScale * radiusScale,
        ampB: (0.5 + Math.random() * 2.0) * ampScale * radiusScale,
      });
    }
  }

  // 月缘外薄散逸层
  for (let i = 0; i < dispersionCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = moonR * (0.97 + Math.pow(Math.random(), 0.35) * 0.28);
    particles.push({
      baseX: cx + Math.cos(angle) * r,
      baseY: cy + Math.sin(angle) * r,
      r: (0.2 + Math.random() * 0.4) * radiusScale,
      color: pickColor(HUES_DISPERSION),
      opacity: 0.05 + Math.random() * 0.22,
      phaseA: Math.random() * Math.PI * 2,
      phaseB: Math.random() * Math.PI * 2,
      freqA: 0.003 + Math.random() * 0.008,
      freqB: 0.002 + Math.random() * 0.007,
      ampA: (1 + Math.random() * 2.2) * radiusScale,
      ampB: (0.8 + Math.random() * 2.0) * radiusScale,
    });
  }

  return particles;
}

export function ParticleMoon({
  clusterCount = 55,
  particleCount = 8500,
  dispersionCount = 700,
}: ParticleMoonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let size = Math.min(parent.clientWidth, parent.clientHeight);
    if (size < 20) size = 400;
    const dpr = window.devicePixelRatio || 1;
    const REF_SIZE = 500;
    const sizeFactor = size / REF_SIZE;
    const scaledParticleCount = Math.round(particleCount * sizeFactor * sizeFactor);
    const scaledDispersionCount = Math.round(dispersionCount * sizeFactor * sizeFactor);

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const moonR = size * 0.45;

    const particles = generateParticles(
      size, cx, cy, moonR,
      clusterCount, scaledParticleCount, scaledDispersionCount, sizeFactor,
    );

    let running = true;
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, size, size);

      for (const p of particles) {
        p.phaseA += p.freqA;
        p.phaseB += p.freqB;
        const dx = Math.sin(p.phaseA) * p.ampA + Math.cos(p.phaseA * 0.62) * p.ampA * 0.5;
        const dy = Math.cos(p.phaseB) * p.ampB + Math.sin(p.phaseB * 0.83) * p.ampB * 0.5;
        ctx.beginPath();
        ctx.arc(p.baseX + dx, p.baseY + dy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [clusterCount, particleCount, dispersionCount]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: 'transparent',
        }}
      />
    </div>
  );
}
