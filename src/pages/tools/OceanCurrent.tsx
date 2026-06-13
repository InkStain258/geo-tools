import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import AnimationControls from '@/components/shared/AnimationControls';
import { oceanCurrents } from '@/data/terrainPresets';
import { getCanvasCoords } from '@/utils/canvasHelper';

const W = 760;
const H = 450;

interface Particle {
  x: number; y: number; pathIdx: number; t: number; speed: number;
}

/** Geographically accurate simplified world map outlines (equirectangular projection) */
const continents: [number, number][][] = [
  // North America
  [[0.15, 0.25], [0.12, 0.18], [0.13, 0.13], [0.17, 0.10], [0.22, 0.08], [0.25, 0.09], [0.27, 0.11], [0.25, 0.14], [0.18, 0.18], [0.17, 0.25], [0.15, 0.30], [0.13, 0.34], [0.12, 0.38]],
  // South America
  [[0.26, 0.43], [0.27, 0.40], [0.30, 0.40], [0.32, 0.44], [0.31, 0.52], [0.28, 0.58], [0.25, 0.62], [0.23, 0.58], [0.22, 0.52], [0.22, 0.46]],
  // Europe
  [[0.48, 0.17], [0.50, 0.15], [0.53, 0.15], [0.55, 0.17], [0.57, 0.20], [0.56, 0.23], [0.53, 0.24], [0.50, 0.23], [0.48, 0.20]],
  // Africa
  [[0.48, 0.28], [0.52, 0.27], [0.55, 0.28], [0.57, 0.32], [0.58, 0.40], [0.56, 0.47], [0.54, 0.52], [0.50, 0.52], [0.48, 0.47], [0.46, 0.40], [0.46, 0.32]],
  // Asia (mainland)
  [[0.57, 0.13], [0.65, 0.10], [0.72, 0.10], [0.78, 0.12], [0.82, 0.15], [0.85, 0.18], [0.84, 0.25], [0.78, 0.28], [0.72, 0.30], [0.65, 0.32], [0.60, 0.30], [0.56, 0.26]],
  // Southeast Asia + Islands
  [[0.78, 0.30], [0.82, 0.32], [0.85, 0.34], [0.84, 0.37], [0.80, 0.36]],
  // Japan
  [[0.86, 0.22], [0.87, 0.24], [0.86, 0.26]],
  // Australia
  [[0.70, 0.50], [0.75, 0.48], [0.78, 0.50], [0.79, 0.55], [0.75, 0.58], [0.71, 0.57], [0.68, 0.54]],
  // Greenland
  [[0.28, 0.07], [0.33, 0.05], [0.35, 0.08], [0.33, 0.12], [0.29, 0.11]],
  // Antarctica
  [[0.05, 0.88], [0.20, 0.86], [0.35, 0.87], [0.50, 0.88], [0.65, 0.87], [0.80, 0.88], [0.85, 0.86], [0.70, 0.85], [0.50, 0.86], [0.35, 0.85], [0.20, 0.84]],
  // India
  [[0.66, 0.28], [0.70, 0.33], [0.68, 0.36], [0.65, 0.35], [0.64, 0.31]],
  // Arabian Peninsula
  [[0.58, 0.30], [0.62, 0.32], [0.63, 0.36], [0.60, 0.36], [0.57, 0.33]],
];

const OceanCurrent: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [selectedCurrent, setSelectedCurrent] = useState<string | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const progressRef = useRef(0);
  const playingRef = useRef(true);
  const speedRef = useRef(1);
  const selectedRef = useRef<string | null>(null);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { selectedRef.current = selectedCurrent; }, [selectedCurrent]);

  useEffect(() => {
    const particles: Particle[] = [];
    oceanCurrents.forEach((_, idx) => {
      for (let i = 0; i < 18; i++) {
        particles.push({
          x: 0, y: 0, pathIdx: idx,
          t: Math.random(),
          speed: 0.0015 + Math.random() * 0.002,
        });
      }
    });
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(animate); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(animate); return; }

      ctx.clearRect(0, 0, W, H);

      // Ocean background
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
      oceanGrad.addColorStop(0, '#b3e5fc');
      oceanGrad.addColorStop(0.3, '#e1f5fe');
      oceanGrad.addColorStop(0.7, '#e1f5fe');
      oceanGrad.addColorStop(1, '#b3e5fc');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, W, H);

      // Grid lines (lat/lon)
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 0.5;
      for (let lat = 0; lat <= 1; lat += 0.2) {
        const y = H * 0.1 + lat * H * 0.8;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let lon = 0; lon <= 1; lon += 0.1) {
        const x = W * 0.05 + lon * W * 0.9;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      // Equator (bold)
      ctx.strokeStyle = 'rgba(255,152,0,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 4]);
      ctx.beginPath(); ctx.moveTo(0, H * 0.5); ctx.lineTo(W, H * 0.5); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#F57C00';
      ctx.font = '10px sans-serif';
      ctx.fillText('赤道 0°', W - 50, H * 0.5 - 5);

      // Tropic lines
      ctx.strokeStyle = 'rgba(245,124,0,0.3)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, H * 0.24); ctx.lineTo(W, H * 0.24); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, H * 0.76); ctx.lineTo(W, H * 0.76); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText('北回归线 23.5°N', W - 90, H * 0.24 - 3);
      ctx.fillText('南回归线 23.5°S', W - 90, H * 0.76 + 12);

      // Continents
      continents.forEach((pts) => {
        ctx.beginPath();
        const sx = W * 0.05 + pts[0][0] * W * 0.9;
        const sy = H * 0.1 + pts[0][1] * H * 0.8;
        ctx.moveTo(sx, sy);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(W * 0.05 + pts[i][0] * W * 0.9, H * 0.1 + pts[i][1] * H * 0.8);
        }
        ctx.closePath();
        ctx.fillStyle = '#c8e6c9';
        ctx.fill();
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Continent labels
      ctx.fillStyle = '#2E7D32';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('亚洲', W * 0.65, H * 0.22);
      ctx.fillText('非洲', W * 0.52, H * 0.44);
      ctx.fillText('北美', W * 0.16, H * 0.28);
      ctx.fillText('南美', W * 0.24, H * 0.52);
      ctx.fillText('欧洲', W * 0.51, H * 0.20);
      ctx.fillText('大洋洲', W * 0.73, H * 0.55);
      ctx.fillText('南极洲', W * 0.30, H * 0.92);

      // Draw current paths and labels
      oceanCurrents.forEach((current) => {
        const path = current.path;
        const color = current.type === 'warm' ? '#ef5350' : '#42A5F5';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i][0], path[i][1]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow
        const last = path[path.length - 1];
        const prev = path[Math.max(0, path.length - 2)];
        const angle = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(last[0], last[1]);
        ctx.lineTo(last[0] - 10 * Math.cos(angle - 0.5), last[1] - 10 * Math.sin(angle - 0.5));
        ctx.lineTo(last[0] - 10 * Math.cos(angle + 0.5), last[1] - 10 * Math.sin(angle + 0.5));
        ctx.closePath();
        ctx.fill();

        // Small label near midpoint
        const mid = path[Math.floor(path.length / 2)];
        ctx.fillStyle = current.type === 'warm' ? '#c62828' : '#0D47A1';
        ctx.font = 'bold 8px sans-serif';
        const shortName = current.name.replace(/（.*?）/, '').replace(/\(.*?\)/, '');
        ctx.fillText(shortName, mid[0] - 15, mid[1] - 6);
      });

      // Animate particles
      if (playingRef.current) {
        particlesRef.current.forEach((p) => {
          p.t += p.speed * speedRef.current;
          if (p.t > 1) p.t -= 1;
          const current = oceanCurrents[p.pathIdx];
          const path = current.path;
          const totalSegs = path.length - 1;
          const segIdx = Math.min(Math.floor(p.t * totalSegs), totalSegs - 1);
          const segT = (p.t * totalSegs) - segIdx;
          p.x = path[segIdx][0] + (path[segIdx + 1][0] - path[segIdx][0]) * segT;
          p.y = path[segIdx][1] + (path[segIdx + 1][1] - path[segIdx][1]) * segT;

          const baseColor = current.type === 'warm' ? [239, 83, 80] : [66, 165, 245];
          ctx.fillStyle = `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${0.4 + segT * 0.6})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
        progressRef.current = (progressRef.current + 0.08 * speedRef.current) % 100;
      }

      // Highlight
      if (selectedRef.current) {
        const sc = oceanCurrents.find((c) => c.id === selectedRef.current);
        if (sc) {
          ctx.strokeStyle = sc.type === 'warm' ? '#b71c1c' : '#0D47A1';
          ctx.lineWidth = 4;
          ctx.shadowColor = sc.type === 'warm' ? '#ff8a80' : '#82b1ff';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(sc.path[0][0], sc.path[0][1]);
          for (let i = 1; i < sc.path.length; i++) ctx.lineTo(sc.path[i][0], sc.path[i][1]);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Legend
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(W - 130, 5, 125, 45);
      ctx.strokeStyle = '#bbb';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(W - 130, 5, 125, 45);

      ctx.fillStyle = '#c62828';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('● 暖流 (向高纬)', W - 125, 22);
      ctx.fillStyle = '#0D47A1';
      ctx.fillText('● 寒流 (向低纬)', W - 125, 42);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    if (!playing) { setProgress(progressRef.current); return; }
    const sync = setInterval(() => setProgress(progressRef.current), 100);
    return () => clearInterval(sync);
  }, [playing]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x: mx, y: my } = getCanvasCoords(e.currentTarget, e);
    let found: string | null = null;
    oceanCurrents.forEach((c) => {
      c.path.forEach((p) => {
        if (Math.sqrt((mx - p[0]) ** 2 + (my - p[1]) ** 2) < 35) found = c.id;
      });
    });
    setSelectedCurrent(found);
  };

  const sc = selectedCurrent ? oceanCurrents.find((c) => c.id === selectedCurrent) : null;

  return (
    <ToolPageLayout title="洋流动态模拟" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <canvas
          ref={canvasRef} width={W} height={H}
          onClick={handleCanvasClick}
          style={{ border: '1px solid #ddd', borderRadius: 8, maxWidth: '100%', cursor: 'pointer' }}
        />
        <AnimationControls
          playing={playing} speed={speed} progress={progress}
          onPlayPause={() => setPlaying(!playing)}
          onSpeedChange={setSpeed}
          onProgressChange={setProgress}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          <Typography variant="body2" sx={{ color: '#c62828', fontWeight: 600 }}>● 暖流（赤道→高纬，增温增湿）</Typography>
          <Typography variant="body2" sx={{ color: '#0D47A1', fontWeight: 600 }}>● 寒流（高纬/深海→低纬，降温减湿）</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {oceanCurrents.map((c) => (
            <Box
              key={c.id}
              onClick={() => setSelectedCurrent(c.id === selectedCurrent ? null : c.id)}
              sx={{
                px: 1, py: 0.3, borderRadius: 1, cursor: 'pointer', fontSize: 11,
                bgcolor: c.id === selectedCurrent ? (c.type === 'warm' ? '#ffebee' : '#e3f2fd') : '#f5f5f5',
                border: '1px solid',
                borderColor: c.id === selectedCurrent ? (c.type === 'warm' ? '#ef5350' : '#42A5F5') : '#e0e0e0',
                fontWeight: c.id === selectedCurrent ? 700 : 400,
              }}
            >
              {c.name.replace(/（.*?）/, '')}
            </Box>
          ))}
        </Box>
        {sc && (
          <Box sx={{
            mt: 2, p: 2, borderRadius: 2,
            bgcolor: sc.type === 'warm' ? '#ffebee' : '#e3f2fd',
            border: '2px solid', borderColor: sc.type === 'warm' ? '#ef5350' : '#42A5F5'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: sc.type === 'warm' ? '#c62828' : '#0D47A1' }}>
              {sc.name} {sc.type === 'warm' ? '【暖流】' : '【寒流】'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.8 }}>
              {sc.description}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: '#666', fontStyle: 'italic' }}>
              💡 洋流性质：{sc.type === 'warm'
                ? '暖流从低纬度流向高纬度，水温高于所经海区，对沿岸气候起增温增湿作用。'
                : '寒流从高纬度流向低纬度（或深层冷水上泛），水温低于所经海区，对沿岸气候起降温减湿作用。'}
            </Typography>
          </Box>
        )}
      </Box>
    </ToolPageLayout>
  );
};

export default OceanCurrent;
