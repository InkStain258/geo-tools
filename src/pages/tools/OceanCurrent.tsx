import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import AnimationControls from '@/components/shared/AnimationControls';
import { oceanCurrents } from '@/data/terrainPresets';

const CANVAS_W = 700;
const CANVAS_H = 450;

interface Particle {
  x: number;
  y: number;
  pathIdx: number;
  t: number;
  speed: number;
}

const OceanCurrent: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [selectedCurrent, setSelectedCurrent] = useState<string | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = [];
    oceanCurrents.forEach((_, idx) => {
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: 0, y: 0,
          pathIdx: idx,
          t: Math.random(),
          speed: 0.002 + Math.random() * 0.002,
        });
      }
    });
    particlesRef.current = particles;
  }, []);

  /** Draw world map outline */
  const drawWorldOutline = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;

    // Simple continent outlines
    const continents = [
      // North America
      [[60, 80], [80, 60], [130, 55], [160, 70], [170, 100], [160, 140], [130, 160], [100, 170], [80, 150], [60, 120]],
      // South America
      [[110, 190], [130, 180], [150, 200], [155, 250], [140, 310], [120, 350], [105, 330], [100, 280], [105, 230]],
      // Europe
      [[280, 60], [310, 55], [340, 65], [350, 90], [340, 110], [310, 120], [290, 110], [280, 85]],
      // Africa
      [[280, 140], [310, 130], [340, 150], [350, 200], [340, 270], [310, 310], [290, 300], [280, 240], [275, 180]],
      // Asia
      [[340, 50], [380, 40], [430, 45], [470, 60], [490, 90], [480, 120], [450, 150], [410, 160], [370, 140], [350, 100]],
      // Australia
      [[430, 280], [470, 270], [500, 290], [490, 330], [460, 340], [430, 320]],
    ];

    continents.forEach((pts) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      pts.forEach((p, i) => { if (i > 0) ctx.lineTo(p[0], p[1]); });
      ctx.closePath();
      ctx.fillStyle = '#e8e8e8';
      ctx.fill();
      ctx.stroke();
    });

    // Equator
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H / 2);
    ctx.lineTo(CANVAS_W, CANVAS_H / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  /** Animation loop */
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Ocean background
    ctx.fillStyle = '#e3f2fd';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    drawWorldOutline(ctx);

    // Draw current paths
    oceanCurrents.forEach((current) => {
      const path = current.path;
      ctx.strokeStyle = current.type === 'warm' ? '#ef5350' : '#42A5F5';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow head
      const last = path[path.length - 1];
      const prev = path[path.length - 2];
      const angle = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
      ctx.fillStyle = current.type === 'warm' ? '#ef5350' : '#42A5F5';
      ctx.beginPath();
      ctx.moveTo(last[0], last[1]);
      ctx.lineTo(last[0] - 8 * Math.cos(angle - 0.4), last[1] - 8 * Math.sin(angle - 0.4));
      ctx.lineTo(last[0] - 8 * Math.cos(angle + 0.4), last[1] - 8 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();

      // Label
      const mid = path[Math.floor(path.length / 2)];
      ctx.fillStyle = current.type === 'warm' ? '#c62828' : '#1565C0';
      ctx.font = '9px sans-serif';
      ctx.fillText(current.name, mid[0] - 20, mid[1] - 8);
    });

    // Animate particles
    if (playing) {
      particlesRef.current.forEach((p) => {
        p.t += p.speed * speed;
        if (p.t > 1) p.t -= 1;

        const current = oceanCurrents[p.pathIdx];
        const path = current.path;
        const totalSegs = path.length - 1;
        const segIdx = Math.min(Math.floor(p.t * totalSegs), totalSegs - 1);
        const segT = (p.t * totalSegs) - segIdx;

        p.x = path[segIdx][0] + (path[segIdx + 1][0] - path[segIdx][0]) * segT;
        p.y = path[segIdx][1] + (path[segIdx + 1][1] - path[segIdx][1]) * segT;

        // Draw particle
        ctx.fillStyle = current.type === 'warm'
          ? `rgba(239,83,80,${0.5 + segT * 0.5})`
          : `rgba(66,165,245,${0.5 + segT * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      setProgress((prev) => (prev + 0.1 * speed) % 100);
    }

    // Highlight selected
    if (selectedCurrent) {
      const sc = oceanCurrents.find((c) => c.id === selectedCurrent);
      if (sc) {
        ctx.strokeStyle = sc.type === 'warm' ? '#b71c1c' : '#0D47A1';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sc.path[0][0], sc.path[0][1]);
        sc.path.forEach((p, i) => { if (i > 0) ctx.lineTo(p[0], p[1]); });
        ctx.stroke();
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }, [playing, speed, selectedCurrent, drawWorldOutline]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found: string | null = null;
    oceanCurrents.forEach((c) => {
      c.path.forEach((p) => {
        if (Math.sqrt((mx - p[0]) ** 2 + (my - p[1]) ** 2) < 30) {
          found = c.id;
        }
      });
    });
    setSelectedCurrent(found);
  };

  const sc = selectedCurrent ? oceanCurrents.find((c) => c.id === selectedCurrent) : null;

  return (
    <ToolPageLayout title="洋流动态模拟" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onClick={handleCanvasClick}
          style={{ border: '1px solid #ddd', borderRadius: 8, maxWidth: '100%', cursor: 'pointer' }}
        />
        <AnimationControls
          playing={playing}
          speed={speed}
          progress={progress}
          onPlayPause={() => setPlaying(!playing)}
          onSpeedChange={setSpeed}
          onProgressChange={setProgress}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography variant="body2" sx={{ color: '#c62828' }}>● 暖流</Typography>
          <Typography variant="body2" sx={{ color: '#1565C0' }}>● 寒流</Typography>
        </Box>
        {sc && (
          <Box sx={{ mt: 1, p: 1.5, bgcolor: sc.type === 'warm' ? '#ffebee' : '#e3f2fd', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{sc.name}</Typography>
            <Typography variant="body2">{sc.description}</Typography>
          </Box>
        )}
      </Box>
    </ToolPageLayout>
  );
};

export default OceanCurrent;
