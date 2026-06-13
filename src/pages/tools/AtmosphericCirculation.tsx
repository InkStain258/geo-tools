import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Slider } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import AnimationControls from '@/components/shared/AnimationControls';

const CANVAS_W = 600;
const CANVAS_H = 500;

const AtmosphericCirculation: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [seasonOffset, setSeasonOffset] = useState(0);

  const progressRef = useRef(0);
  const playingRef = useRef(true);
  const speedRef = useRef(1);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Draw function - reads from refs, no state dependencies
  const drawCirculation = useCallback((ctx: CanvasRenderingContext2D, p: number, season: number) => {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0, '#e3f2fd');
    bgGrad.addColorStop(0.5, '#fff3e0');
    bgGrad.addColorStop(1, '#e3f2fd');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;
    const radius = 180;

    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#e8f5e9';
    ctx.fill();

    const shift = Math.sin((season / 12) * Math.PI * 2) * 15;

    const belts = [
      { lat: 0 + shift, label: '赤道低压带', color: '#ef5350' },
      { lat: 30 + shift, label: '副热带高压带(北)', color: '#42A5F5' },
      { lat: -30 + shift, label: '副热带高压带(南)', color: '#42A5F5' },
      { lat: 60 + shift, label: '副极地低压带(北)', color: '#ef5350' },
      { lat: -60 + shift, label: '副极地低压带(南)', color: '#ef5350' },
      { lat: 90, label: '极地高压带(北)', color: '#42A5F5' },
      { lat: -90, label: '极地高压带(南)', color: '#42A5F5' },
    ];

    belts.forEach((belt) => {
      const y = cy - (belt.lat / 90) * radius;
      ctx.strokeStyle = belt.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - radius, y);
      ctx.lineTo(cx + radius, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = belt.color;
      ctx.font = '9px sans-serif';
      ctx.fillText(belt.label, cx + radius + 5, y + 3);
    });

    const drawCell = (
      startY: number, endY: number, direction: number, color: string, label: string,
    ) => {
      const cellH = endY - startY;
      const midY = (startY + endY) / 2;
      const arcRadius = Math.abs(cellH) / 3;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = color;

      const arrowOffset = p * direction * 0.5;

      // Upward leg
      ctx.beginPath();
      ctx.moveTo(cx - arcRadius, startY);
      ctx.lineTo(cx - arcRadius, endY);
      ctx.stroke();
      const ay1 = endY + arrowOffset * 2;
      ctx.beginPath();
      ctx.moveTo(cx - arcRadius, ay1);
      ctx.lineTo(cx - arcRadius - 5, ay1 - 8 * direction);
      ctx.lineTo(cx - arcRadius + 5, ay1 - 8 * direction);
      ctx.closePath();
      ctx.fill();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(cx - arcRadius, startY);
      ctx.lineTo(cx + arcRadius, startY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - arcRadius, endY);
      ctx.lineTo(cx + arcRadius, endY);
      ctx.stroke();

      // Downward leg
      ctx.beginPath();
      ctx.moveTo(cx + arcRadius, endY);
      ctx.lineTo(cx + arcRadius, startY);
      ctx.stroke();
      const ay2 = startY - arrowOffset * 2;
      ctx.beginPath();
      ctx.moveTo(cx + arcRadius, ay2);
      ctx.lineTo(cx + arcRadius - 5, ay2 + 8 * direction);
      ctx.lineTo(cx + arcRadius + 5, ay2 + 8 * direction);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#333';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(label, cx - 20, midY + 4);
    };

    const n30y = cy - ((30 + shift) / 90) * radius;
    const n60y = cy - ((60 + shift) / 90) * radius;
    const eqY = cy - (shift / 90) * radius;
    const topY = cy - radius;

    drawCell(eqY, n30y, 1, '#ef5350', '哈德莱环流');
    drawCell(n30y, n60y, -1, '#66BB6A', '费雷尔环流');
    drawCell(n60y, topY, 1, '#42A5F5', '极地环流');

    const s30y = cy + ((30 - shift) / 90) * radius;
    const s60y = cy + ((60 - shift) / 90) * radius;
    const botY = cy + radius;

    drawCell(s30y, eqY, -1, '#ef5350', '哈德莱环流');
    drawCell(s60y, s30y, 1, '#66BB6A', '费雷尔环流');
    drawCell(botY, s60y, -1, '#42A5F5', '极地环流');

    ctx.fillStyle = '#333';
    ctx.font = '10px sans-serif';
    ctx.fillText('东北信风', cx - 45, eqY + 15);
    ctx.fillText('盛行西风', cx - 40, n30y - 5);
    ctx.fillText('极地东风', cx - 40, n60y + 15);

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    ctx.fillStyle = '#2E7D32';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`月份：${monthNames[season]}  气压带偏移：${shift > 0 ? '北移' : shift < 0 ? '南移' : '无偏移'}`, 20, 30);
  }, []);

  // Animation loop - stable effect
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      let currentProgress = progressRef.current;
      const currentSeason = seasonOffset;

      if (playingRef.current) {
        currentProgress = (currentProgress + 0.3 * speedRef.current) % 360;
        progressRef.current = currentProgress;
      }

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawCirculation(ctx, currentProgress, currentSeason);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawCirculation, seasonOffset]);

  // Sync ref progress to state for slider (throttled)
  useEffect(() => {
    if (!playing) {
      setProgress(progressRef.current);
      return;
    }
    const sync = setInterval(() => {
      setProgress(progressRef.current);
    }, 100);
    return () => clearInterval(sync);
  }, [playing]);

  return (
    <ToolPageLayout title="大气环流可视化" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
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
        <Box sx={{ mt: 2, px: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>季节变化（气压带风带移动）</Typography>
          <Slider
            value={seasonOffset}
            onChange={(_, v) => setSeasonOffset(v as number)}
            min={0}
            max={11}
            step={1}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v + 1}月`}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography variant="body2" sx={{ color: '#ef5350' }}>● 低压带/上升气流</Typography>
          <Typography variant="body2" sx={{ color: '#42A5F5' }}>● 高压带/下沉气流</Typography>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default AtmosphericCirculation;
