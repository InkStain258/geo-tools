import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import AnimationControls from '@/components/shared/AnimationControls';
import type { FrontType } from '@/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CANVAS_W = 600;
const CANVAS_H = 300;

const frontLabels: Record<FrontType, string> = {
  cold: '冷锋',
  warm: '暖锋',
  stationary: '准静止锋',
};

const FrontWeather: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [frontType, setFrontType] = useState<FrontType>('cold');
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);

  const drawFront = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H * 0.6);
    skyGrad.addColorStop(0, '#90caf9');
    skyGrad.addColorStop(1, '#e3f2fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H * 0.6);

    // Ground
    ctx.fillStyle = '#a5d6a7';
    ctx.fillRect(0, CANVAS_H * 0.6, CANVAS_W, CANVAS_H * 0.4);

    const frontX = 100 + (progress / 100) * 400;

    if (frontType === 'cold') {
      // Cold air mass (blue, pushing from left)
      ctx.fillStyle = 'rgba(66,165,245,0.3)';
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H * 0.3);
      ctx.lineTo(frontX, CANVAS_H * 0.3);
      ctx.lineTo(frontX, CANVAS_H * 0.6);
      ctx.lineTo(0, CANVAS_H * 0.6);
      ctx.closePath();
      ctx.fill();

      // Warm air mass (red, being pushed up)
      ctx.fillStyle = 'rgba(239,83,80,0.3)';
      ctx.beginPath();
      ctx.moveTo(frontX, CANVAS_H * 0.15);
      ctx.lineTo(CANVAS_W, CANVAS_H * 0.15);
      ctx.lineTo(CANVAS_W, CANVAS_H * 0.6);
      ctx.lineTo(frontX, CANVAS_H * 0.6);
      ctx.closePath();
      ctx.fill();

      // Cold front line (triangle markers)
      ctx.strokeStyle = '#1565C0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(frontX, CANVAS_H * 0.25);
      ctx.lineTo(frontX, CANVAS_H * 0.6);
      ctx.stroke();

      // Triangle markers on front line
      for (let y = CANVAS_H * 0.28; y < CANVAS_H * 0.58; y += 25) {
        ctx.fillStyle = '#1565C0';
        ctx.beginPath();
        ctx.moveTo(frontX, y);
        ctx.lineTo(frontX + 12, y + 8);
        ctx.lineTo(frontX, y + 16);
        ctx.closePath();
        ctx.fill();
      }

      // Clouds (cumulonimbus)
      drawCloud(ctx, frontX - 20, CANVAS_H * 0.12, 40, '#78909c');
      drawCloud(ctx, frontX - 50, CANVAS_H * 0.08, 35, '#90a4ae');
      drawCloud(ctx, frontX + 10, CANVAS_H * 0.1, 30, '#78909c');

      // Rain
      ctx.strokeStyle = '#42A5F5';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const rx = frontX - 30 + Math.random() * 50;
        const ry = CANVAS_H * 0.2 + Math.random() * CANVAS_H * 0.35;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 8);
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = '#1565C0';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('冷气团', frontX - 80, CANVAS_H * 0.45);
      ctx.fillStyle = '#c62828';
      ctx.fillText('暖气团', frontX + 40, CANVAS_H * 0.45);

    } else if (frontType === 'warm') {
      // Warm front - warm air overruns cold air
      ctx.fillStyle = 'rgba(66,165,245,0.3)';
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H * 0.45);
      ctx.lineTo(CANVAS_W, CANVAS_H * 0.45);
      ctx.lineTo(CANVAS_W, CANVAS_H * 0.6);
      ctx.lineTo(0, CANVAS_H * 0.6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(239,83,80,0.3)';
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H * 0.15);
      ctx.lineTo(frontX, CANVAS_H * 0.15);
      ctx.lineTo(frontX, CANVAS_H * 0.45);
      ctx.lineTo(0, CANVAS_H * 0.45);
      ctx.closePath();
      ctx.fill();

      // Warm front line (semicircle markers)
      ctx.strokeStyle = '#c62828';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(frontX, CANVAS_H * 0.25);
      ctx.lineTo(frontX, CANVAS_H * 0.6);
      ctx.stroke();

      for (let y = CANVAS_H * 0.28; y < CANVAS_H * 0.58; y += 25) {
        ctx.fillStyle = '#c62828';
        ctx.beginPath();
        ctx.arc(frontX, y + 8, 6, Math.PI, 0);
        ctx.fill();
      }

      // Layered clouds
      drawCloud(ctx, frontX - 80, CANVAS_H * 0.06, 50, '#b0bec5');
      drawCloud(ctx, frontX - 40, CANVAS_H * 0.1, 45, '#90a4ae');
      drawCloud(ctx, frontX, CANVAS_H * 0.14, 35, '#78909c');

      ctx.fillStyle = '#1565C0';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('冷气团', frontX + 30, CANVAS_H * 0.55);
      ctx.fillStyle = '#c62828';
      ctx.fillText('暖气团', frontX - 80, CANVAS_H * 0.35);

    } else {
      // Stationary front
      ctx.fillStyle = 'rgba(66,165,245,0.2)';
      ctx.fillRect(0, CANVAS_H * 0.4, CANVAS_W / 2, CANVAS_H * 0.2);

      ctx.fillStyle = 'rgba(239,83,80,0.2)';
      ctx.fillRect(CANVAS_W / 2, CANVAS_H * 0.4, CANVAS_W / 2, CANVAS_H * 0.2);

      const sx = CANVAS_W / 2;
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, CANVAS_H * 0.25);
      ctx.lineTo(sx, CANVAS_H * 0.6);
      ctx.stroke();

      // Alternating markers
      for (let y = CANVAS_H * 0.28; y < CANVAS_H * 0.55; y += 30) {
        ctx.fillStyle = '#1565C0';
        ctx.beginPath();
        ctx.moveTo(sx, y);
        ctx.lineTo(sx + 10, y + 8);
        ctx.lineTo(sx, y + 16);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#c62828';
        ctx.beginPath();
        ctx.arc(sx, y + 23, 5, Math.PI, 0);
        ctx.fill();
      }

      drawCloud(ctx, sx - 30, CANVAS_H * 0.05, 50, '#90a4ae');
      drawCloud(ctx, sx + 20, CANVAS_H * 0.08, 45, '#90a4ae');

      ctx.fillStyle = '#1565C0';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('冷气团', sx - 120, CANVAS_H * 0.5);
      ctx.fillStyle = '#c62828';
      ctx.fillText('暖气团', sx + 40, CANVAS_H * 0.5);
    }

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${frontLabels[frontType]}过境模拟`, 10, 20);
  }, [frontType, progress]);

  function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.15, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y + size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  useEffect(() => {
    const animate = () => {
      if (playing) {
        setProgress((p) => (p + 0.15 * speed) % 100);
      }
      drawFront();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, speed, drawFront]);

  // Temperature curve data
  const tempCurveData = {
    labels: ['过境前', '过境时', '过境后'],
    datasets: [{
      label: '气温变化 (°C)',
      data: frontType === 'cold' ? [25, 20, 12] : frontType === 'warm' ? [10, 18, 25] : [15, 16, 15],
      borderColor: '#F57C00',
      backgroundColor: 'rgba(245,124,0,0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 5,
    }],
  };

  return (
    <ToolPageLayout title="锋面天气模拟" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ToggleButtonGroup
            value={frontType}
            exclusive
            onChange={(_, v) => { if (v) setFrontType(v); }}
            size="small"
            sx={{ mb: 1 }}
          >
            <ToggleButton value="cold">冷锋</ToggleButton>
            <ToggleButton value="warm">暖锋</ToggleButton>
            <ToggleButton value="stationary">准静止锋</ToggleButton>
          </ToggleButtonGroup>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ border: '1px solid #ddd', borderRadius: 8, maxWidth: '100%' }}
          />
          <AnimationControls
            playing={playing}
            speed={speed}
            progress={progress}
            onPlayPause={() => setPlaying(!playing)}
            onSpeedChange={setSpeed}
            onProgressChange={setProgress}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>温度变化曲线</Typography>
          <div style={{ height: 200 }}>
            <Line data={tempCurveData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{frontLabels[frontType]}特征</Typography>
            <Typography variant="body2">
              {frontType === 'cold' && '冷锋过境：气温骤降，气压升高，大风和降水天气，降水主要在锋后。移动速度快。'}
              {frontType === 'warm' && '暖锋过境：气温升高，气压降低，连续性降水，降水在锋前。移动速度慢。'}
              {frontType === 'stationary' && '准静止锋：冷暖气团势均力敌，锋面来回摆动，长时间阴雨天气。如江淮梅雨。'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default FrontWeather;
